/**
 * Dynamic Remote Loader with Cookie/LocalStorage Support
 *
 * This utility enables runtime URL override for Module Federation remotes
 * while maintaining static webpack configuration benefits.
 *
 * Features:
 * - URL overrides via localStorage (developer testing)
 * - URL overrides via cookies (server-controlled canary/A/B testing)
 * - URL overrides via URL parameters (quick testing)
 * - Default fallback URLs per environment
 * - Proper error handling and logging
 */

interface RemoteConfig {
  name: string;
  url: string;
  scope: string;
}

interface RemoteOverride {
  name: string;
  url: string;
}

interface DefaultRemoteURLs {
  [key: string]: string;
}

/**
 * Get default remote URLs based on environment
 */
function getDefaultRemoteURLs(): DefaultRemoteURLs {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      shared_components: process.env.REMOTE_SHARED_COMPONENTS_URL || 'https://shared-components.vercel.app/remoteEntry.js',
      shared_data: process.env.REMOTE_SHARED_DATA_URL || 'https://shared-data.vercel.app/remoteEntry.js',
      content_shell: process.env.REMOTE_CONTENT_SHELL_URL || 'https://content-platform-shell.vercel.app/remoteEntry.js',
      reports_tab: process.env.REMOTE_REPORTS_TAB_URL || 'https://reports-tab.vercel.app/remoteEntry.js',
      user_tab: process.env.REMOTE_USER_TAB_URL || 'https://user-tab.vercel.app/remoteEntry.js',
      files_folders: process.env.REMOTE_FILES_FOLDERS_URL || 'https://files-folders-tab.vercel.app/remoteEntry.js',
      hubs_tab: process.env.REMOTE_HUBS_TAB_URL || 'https://hubs-tab.vercel.app/remoteEntry.js',
    };
  }

  return {
    shared_components: 'http://localhost:3001/remoteEntry.js',
    shared_data: 'http://localhost:3002/remoteEntry.js',
    content_shell: 'http://localhost:3003/remoteEntry.js',
    reports_tab: 'http://localhost:3006/remoteEntry.js',
    user_tab: 'http://localhost:3007/remoteEntry.js',
    files_folders: 'http://localhost:3004/remoteEntry.js',
    hubs_tab: 'http://localhost:3005/remoteEntry.js',
  };
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));

  if (cookie) {
    return decodeURIComponent(cookie.split('=')[1]);
  }
  return null;
}

/**
 * Get URL parameter value by name
 */
function getURLParam(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Get remote URL with priority:
 * 1. URL parameter (highest priority - for quick testing)
 * 2. Cookie (server-controlled)
 * 3. LocalStorage (developer overrides)
 * 4. Default URL (lowest priority)
 */
export function getRemoteURL(remoteName: string): string {
  const defaults = getDefaultRemoteURLs();

  // 1. Check URL parameters (highest priority for testing)
  const urlParam = getURLParam(`remote_${remoteName}`);
  if (urlParam) {
    console.log(`[MF Override] Using ${remoteName} from URL param:`, urlParam);
    return urlParam;
  }

  // 2. Check cookies (server-controlled canary/A/B testing)
  const cookieValue = getCookie(`mf_${remoteName}`);
  if (cookieValue) {
    try {
      // Cookie might contain just URL or JSON with metadata
      const parsed = JSON.parse(cookieValue);
      if (parsed.url) {
        console.log(`[MF Override] Using ${remoteName} from cookie:`, parsed.url);
        return parsed.url;
      }
    } catch {
      // Not JSON, treat as plain URL
      console.log(`[MF Override] Using ${remoteName} from cookie:`, cookieValue);
      return cookieValue;
    }
  }

  // 3. Check localStorage (developer overrides)
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('mf-remote-overrides');
      if (stored) {
        const overrides: Record<string, string> = JSON.parse(stored);
        if (overrides[remoteName]) {
          console.log(`[MF Override] Using ${remoteName} from localStorage:`, overrides[remoteName]);
          return overrides[remoteName];
        }
      }
    } catch (error) {
      console.warn('[MF Override] Failed to parse localStorage overrides:', error);
    }
  }

  // 4. Return default URL
  const defaultUrl = defaults[remoteName];
  if (!defaultUrl) {
    throw new Error(`No default URL configured for remote: ${remoteName}`);
  }

  return defaultUrl;
}

/**
 * Load remote container script
 */
function loadRemoteContainer(url: string, scope: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any)[scope]) {
      resolve();
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector(`script[data-mf-scope="${scope}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error(`Failed to load remote: ${url}`)));
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-mf-scope', scope);

    script.onload = () => {
      console.log(`[MF] Loaded remote container: ${scope} from ${url}`);
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load remote: ${url}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Initialize remote container with shared scope
 */
async function initRemoteContainer(scope: string): Promise<any> {
  // Wait for container to be available
  await new Promise(resolve => setTimeout(resolve, 0));

  const container = (window as any)[scope];
  if (!container) {
    throw new Error(`Container ${scope} not found after loading script`);
  }

  // Initialize the container with shared dependencies
  // @ts-ignore - webpack runtime API
  if (!container.__initialized) {
    // @ts-ignore - webpack runtime API
    await container.init(__webpack_share_scopes__.default);
    container.__initialized = true;
  }

  return container;
}

/**
 * Main function to load dynamic remote module
 *
 * @param remoteName - Name of the remote (e.g., 'shared_components')
 * @param modulePath - Path to the module within the remote (e.g., './Button')
 * @returns Promise resolving to the loaded module
 *
 * @example
 * ```tsx
 * const Button = lazy(() =>
 *   loadDynamicRemote('shared_components', './Button')
 *     .then(m => ({ default: m.Button }))
 * );
 * ```
 */
export async function loadDynamicRemote<T = any>(
  remoteName: string,
  modulePath: string
): Promise<T> {
  const url = getRemoteURL(remoteName);
  const scope = remoteName;

  try {
    // Load container script
    await loadRemoteContainer(url, scope);

    // Initialize container with shared scope
    const container = await initRemoteContainer(scope);

    // Get the module
    const factory = await container.get(modulePath);
    const module = factory();

    return module;
  } catch (error) {
    console.error(`[MF] Failed to load ${remoteName}/${modulePath}:`, error);
    throw error;
  }
}

/**
 * Preload a remote module for better performance
 * Call this before the module is actually needed
 *
 * @example
 * ```tsx
 * // Preload on hover
 * <button onMouseEnter={() => preloadRemote('shared_components', './Button')}>
 *   Show Dialog
 * </button>
 * ```
 */
export async function preloadRemote(remoteName: string, modulePath: string): Promise<void> {
  try {
    await loadDynamicRemote(remoteName, modulePath);
    console.log(`[MF] Preloaded ${remoteName}/${modulePath}`);
  } catch (error) {
    console.warn(`[MF] Failed to preload ${remoteName}/${modulePath}:`, error);
  }
}

/**
 * Check if a remote is currently overridden
 */
export function isRemoteOverridden(remoteName: string): boolean {
  // Check URL param
  if (getURLParam(`remote_${remoteName}`)) return true;

  // Check cookie
  if (getCookie(`mf_${remoteName}`)) return true;

  // Check localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('mf-remote-overrides');
      if (stored) {
        const overrides: Record<string, string> = JSON.parse(stored);
        return !!overrides[remoteName];
      }
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get all current overrides
 */
export function getAllOverrides(): Record<string, string> {
  const overrides: Record<string, string> = {};

  // Collect from localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('mf-remote-overrides');
      if (stored) {
        Object.assign(overrides, JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Collect from cookies
  if (typeof document !== 'undefined') {
    document.cookie.split('; ').forEach(cookie => {
      if (cookie.startsWith('mf_')) {
        const [key, value] = cookie.split('=');
        const remoteName = key.substring(3); // Remove 'mf_' prefix
        try {
          const parsed = JSON.parse(decodeURIComponent(value));
          if (parsed.url) {
            overrides[remoteName] = parsed.url;
          }
        } catch {
          overrides[remoteName] = decodeURIComponent(value);
        }
      }
    });
  }

  // Collect from URL params
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
      if (key.startsWith('remote_')) {
        const remoteName = key.substring(7); // Remove 'remote_' prefix
        overrides[remoteName] = value;
      }
    });
  }

  return overrides;
}
