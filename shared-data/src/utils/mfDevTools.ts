/**
 * Module Federation Developer Tools
 *
 * Exposes convenient functions in the browser console for testing
 * different remote versions during development.
 *
 * Usage in browser console:
 * - mf.override('shared_components', 'https://my-pr.vercel.app/remoteEntry.js')
 * - mf.listOverrides()
 * - mf.clearOverrides()
 * - mf.useStaging()
 * - mf.useProduction()
 */

import { getAllOverrides } from './loadDynamicRemote';

interface MFDevTools {
  /**
   * Override a remote URL for testing
   * Changes will take effect on next page reload
   */
  override(remoteName: string, url: string): void;

  /**
   * Clear a specific override
   */
  clearOverride(remoteName: string): void;

  /**
   * Clear all overrides
   */
  clearOverrides(): void;

  /**
   * List all current overrides
   */
  listOverrides(): void;

  /**
   * Switch to staging environment
   */
  useStaging(): void;

  /**
   * Switch to production environment
   */
  useProduction(): void;

  /**
   * Switch to local development
   */
  useLocal(): void;

  /**
   * Test a specific PR deployment
   */
  testPR(remoteName: string, prNumber: number | string): void;

  /**
   * Get current effective URLs for all remotes
   */
  showCurrentURLs(): void;

  /**
   * Quick test different versions
   */
  testVersion(remoteName: string, version: string): void;
}

class ModuleFederationDevTools implements MFDevTools {
  private readonly stagingURLs: Record<string, string> = {
    shared_components: 'https://staging-shared-components.vercel.app/remoteEntry.js',
    shared_data: 'https://staging-shared-data.vercel.app/remoteEntry.js',
    content_shell: 'https://staging-content-shell.vercel.app/remoteEntry.js',
    reports_tab: 'https://staging-reports-tab.vercel.app/remoteEntry.js',
    user_tab: 'https://staging-user-tab.vercel.app/remoteEntry.js',
    files_folders: 'https://staging-files-folders.vercel.app/remoteEntry.js',
    hubs_tab: 'https://staging-hubs-tab.vercel.app/remoteEntry.js',
  };

  private readonly productionURLs: Record<string, string> = {
    shared_components: 'https://shared-components.vercel.app/remoteEntry.js',
    shared_data: 'https://shared-data.vercel.app/remoteEntry.js',
    content_shell: 'https://content-platform-shell.vercel.app/remoteEntry.js',
    reports_tab: 'https://reports-tab.vercel.app/remoteEntry.js',
    user_tab: 'https://user-tab.vercel.app/remoteEntry.js',
    files_folders: 'https://files-folders-tab.vercel.app/remoteEntry.js',
    hubs_tab: 'https://hubs-tab.vercel.app/remoteEntry.js',
  };

  private readonly localURLs: Record<string, string> = {
    shared_components: 'http://localhost:3001/remoteEntry.js',
    shared_data: 'http://localhost:3002/remoteEntry.js',
    content_shell: 'http://localhost:3003/remoteEntry.js',
    reports_tab: 'http://localhost:3006/remoteEntry.js',
    user_tab: 'http://localhost:3007/remoteEntry.js',
    files_folders: 'http://localhost:3004/remoteEntry.js',
    hubs_tab: 'http://localhost:3005/remoteEntry.js',
  };

  private getOverrides(): Record<string, string> {
    try {
      const stored = localStorage.getItem('mf-remote-overrides');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveOverrides(overrides: Record<string, string>): void {
    localStorage.setItem('mf-remote-overrides', JSON.stringify(overrides));
  }

  override(remoteName: string, url: string): void {
    const overrides = this.getOverrides();
    overrides[remoteName] = url;
    this.saveOverrides(overrides);

    console.log(`%c✅ Override Set`, 'color: #4caf50; font-weight: bold');
    console.log(`%cRemote: ${remoteName}`, 'color: #2196f3');
    console.log(`%cURL: ${url}`, 'color: #2196f3');
    console.log(`%c⚠️  Reload the page to apply changes`, 'color: #ff9800; font-weight: bold');
    console.log(`Run: location.reload()`);
  }

  clearOverride(remoteName: string): void {
    const overrides = this.getOverrides();
    if (overrides[remoteName]) {
      delete overrides[remoteName];
      this.saveOverrides(overrides);
      console.log(`%c✅ Cleared override for: ${remoteName}`, 'color: #4caf50; font-weight: bold');
      console.log(`%c⚠️  Reload the page to apply changes`, 'color: #ff9800; font-weight: bold');
    } else {
      console.log(`%cℹ️  No override found for: ${remoteName}`, 'color: #2196f3');
    }
  }

  clearOverrides(): void {
    localStorage.removeItem('mf-remote-overrides');
    console.log(`%c✅ All overrides cleared`, 'color: #4caf50; font-weight: bold');
    console.log(`%c⚠️  Reload the page to apply changes`, 'color: #ff9800; font-weight: bold');
    console.log(`Run: location.reload()`);
  }

  listOverrides(): void {
    const allOverrides = getAllOverrides();
    const localOverrides = this.getOverrides();

    console.log(`%c📋 Module Federation Overrides`, 'color: #673ab7; font-weight: bold; font-size: 14px');
    console.log('');

    if (Object.keys(allOverrides).length === 0) {
      console.log('%cNo overrides active', 'color: #9e9e9e');
      console.log('');
      console.log('%cTry:', 'color: #2196f3; font-weight: bold');
      console.log(`  mf.override('shared_components', 'https://my-pr.vercel.app/remoteEntry.js')`);
      console.log(`  mf.useStaging()`);
      console.log(`  mf.testPR('shared_components', 123)`);
      return;
    }

    // Show localStorage overrides
    if (Object.keys(localOverrides).length > 0) {
      console.log('%c🔧 LocalStorage Overrides:', 'color: #ff9800; font-weight: bold');
      console.table(localOverrides);
      console.log('');
    }

    // Show all active overrides
    console.log('%c🌐 All Active Overrides (includes cookies & URL params):', 'color: #4caf50; font-weight: bold');
    console.table(allOverrides);
    console.log('');
    console.log('%cℹ️  Priority: URL params > Cookies > LocalStorage > Defaults', 'color: #2196f3');
  }

  useStaging(): void {
    console.log('%c🚀 Switching to staging environment...', 'color: #673ab7; font-weight: bold');
    const overrides = this.getOverrides();

    Object.entries(this.stagingURLs).forEach(([name, url]) => {
      overrides[name] = url;
      console.log(`  ${name} → ${url}`);
    });

    this.saveOverrides(overrides);
    console.log('');
    console.log('%c✅ Staging environment configured', 'color: #4caf50; font-weight: bold');
    console.log('%c⚠️  Reload to apply: location.reload()', 'color: #ff9800; font-weight: bold');
  }

  useProduction(): void {
    console.log('%c🚀 Switching to production environment...', 'color: #673ab7; font-weight: bold');
    const overrides = this.getOverrides();

    Object.entries(this.productionURLs).forEach(([name, url]) => {
      overrides[name] = url;
      console.log(`  ${name} → ${url}`);
    });

    this.saveOverrides(overrides);
    console.log('');
    console.log('%c✅ Production environment configured', 'color: #4caf50; font-weight: bold');
    console.log('%c⚠️  Reload to apply: location.reload()', 'color: #ff9800; font-weight: bold');
  }

  useLocal(): void {
    console.log('%c🏠 Switching to local development...', 'color: #673ab7; font-weight: bold');
    // Clear all overrides to use defaults (which are local in dev mode)
    this.clearOverrides();
    console.log('');
    console.log('%c✅ Local development configured', 'color: #4caf50; font-weight: bold');
    console.log('%c⚠️  Reload to apply: location.reload()', 'color: #ff9800; font-weight: bold');
  }

  testPR(remoteName: string, prNumber: number | string): void {
    // Vercel PR preview pattern
    const baseRemoteName = remoteName.replace(/_/g, '-');
    const url = `https://${baseRemoteName}-pr-${prNumber}.vercel.app/remoteEntry.js`;

    console.log(`%c🧪 Testing PR #${prNumber} for ${remoteName}`, 'color: #673ab7; font-weight: bold');
    this.override(remoteName, url);
  }

  showCurrentURLs(): void {
    // This requires importing getRemoteURL, which creates a circular dependency
    // Instead, we'll show what's configured
    console.log('%c📍 Current Configuration', 'color: #673ab7; font-weight: bold; font-size: 14px');
    console.log('');

    const allOverrides = getAllOverrides();

    if (Object.keys(allOverrides).length === 0) {
      console.log('%cUsing default URLs (no overrides)', 'color: #9e9e9e');
    } else {
      console.log('%c🔄 Overridden URLs:', 'color: #ff9800; font-weight: bold');
      console.table(allOverrides);
    }

    console.log('');
    console.log('%cℹ️  To see actual resolved URLs, check the console for [MF Override] logs during app load', 'color: #2196f3');
  }

  testVersion(remoteName: string, version: string): void {
    // Assumes CDN structure: https://cdn.example.com/{remote}/v{version}/remoteEntry.js
    console.log(`%c🔢 Testing version ${version} for ${remoteName}`, 'color: #673ab7; font-weight: bold');

    // Try common version URL patterns
    const patterns = [
      `https://${remoteName.replace(/_/g, '-')}-v${version}.vercel.app/remoteEntry.js`,
      `https://cdn.example.com/${remoteName}/v${version}/remoteEntry.js`,
    ];

    console.log('%cPossible URLs:', 'color: #2196f3');
    patterns.forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`);
    });

    console.log('');
    console.log('%cTo use a specific URL:', 'color: #2196f3; font-weight: bold');
    console.log(`  mf.override('${remoteName}', '${patterns[0]}')`);
  }
}

// Create singleton instance
const mfDevTools = new ModuleFederationDevTools();

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).mf = mfDevTools;

  // Show helpful message on load
  console.log(
    '%c🔧 Module Federation DevTools Loaded',
    'color: white; background: #673ab7; padding: 4px 8px; border-radius: 4px; font-weight: bold'
  );
  console.log('');
  console.log('%cAvailable commands:', 'color: #673ab7; font-weight: bold');
  console.log('%c  mf.listOverrides()    ', 'color: #2196f3', '- Show all active overrides');
  console.log('%c  mf.override()         ', 'color: #2196f3', '- Override a remote URL');
  console.log('%c  mf.clearOverrides()   ', 'color: #2196f3', '- Clear all overrides');
  console.log('%c  mf.useStaging()       ', 'color: #2196f3', '- Switch to staging environment');
  console.log('%c  mf.useProduction()    ', 'color: #2196f3', '- Switch to production environment');
  console.log('%c  mf.useLocal()         ', 'color: #2196f3', '- Switch to local development');
  console.log('%c  mf.testPR()           ', 'color: #2196f3', '- Test a PR deployment');
  console.log('%c  mf.showCurrentURLs()  ', 'color: #2196f3', '- Show current configuration');
  console.log('');
  console.log('%cExamples:', 'color: #ff9800; font-weight: bold');
  console.log(`  mf.override('shared_components', 'https://my-pr.vercel.app/remoteEntry.js')`);
  console.log(`  mf.testPR('shared_components', 123)`);
  console.log(`  mf.useStaging()`);
  console.log('');
}

export default mfDevTools;
