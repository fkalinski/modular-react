import mitt, { Emitter } from 'mitt';

/**
 * Platform-wide event types for cross-MFE communication
 *
 * Usage:
 * - Tabs can emit events without knowing about other tabs
 * - Tabs can subscribe to events they care about
 * - Loose coupling between micro-frontends
 */
export type PlatformEvents = {
  // Tab lifecycle
  'tab:activated': { tabId: string; timestamp: Date };
  'tab:deactivated': { tabId: string; timestamp: Date };

  // Search events
  'search:submitted': { query: string; timestamp: Date };
  'search:cleared': { timestamp: Date };
  'search:results-updated': {
    query: string;
    results: {
      files: number;
      folders: number;
      hubs: number;
      total: number;
    };
  };

  // Filter events
  'filter:changed': { filters: Filter[]; timestamp: Date };
  'filter:applied': { filterType: string; value: unknown; timestamp: Date };
  'filter:removed': { filterType: string; timestamp: Date };
  'filter:cleared-all': { timestamp: Date };

  // Selection events
  'selection:changed': { selectedIds: string[]; timestamp: Date };
  'selection:cleared': { timestamp: Date };

  // Navigation events
  'navigation:folder-opened': { folderId: string; path: string; timestamp: Date };
  'navigation:breadcrumb-clicked': { itemId: string; path: string; timestamp: Date };

  // Content events
  'file:selected': { fileId: string; fileName: string; timestamp: Date };
  'file:opened': { fileId: string; fileName: string; timestamp: Date };
  'file:uploaded': { fileId: string; fileName: string; timestamp: Date };
  'file:deleted': { fileId: string; timestamp: Date };
  'folder:created': { folderId: string; folderName: string; timestamp: Date };

  // Hub events
  'hub:selected': { hubId: string; hubName: string; timestamp: Date };
  'hub:joined': { hubId: string; userId: string; timestamp: Date };
  'hub:left': { hubId: string; userId: string; timestamp: Date };

  // Bulk action events
  'bulk-action:triggered': { action: string; itemIds: string[]; timestamp: Date };
  'bulk-action:completed': { action: string; itemIds: string[]; timestamp: Date };
  'bulk-action:failed': { action: string; error: string; timestamp: Date };

  // Notification events
  'notification:show': { message: string; type: 'success' | 'error' | 'warning' | 'info'; timestamp: Date };
  'notification:hide': { timestamp: Date };
};

export interface Filter {
  id: string;
  type: string;
  label: string;
  value: unknown;
}

/**
 * Singleton event bus for the platform
 * Uses mitt for lightweight pub/sub pattern
 */
export const eventBus: Emitter<PlatformEvents> = mitt<PlatformEvents>();

/**
 * Type-safe event publishing
 *
 * @example
 * publishEvent('file:selected', { fileId: '123', fileName: 'doc.pdf', timestamp: new Date() });
 */
export const publishEvent = <K extends keyof PlatformEvents>(
  event: K,
  data: PlatformEvents[K]
) => {
  console.log(`[EventBus] Publishing: ${event}`, data);
  eventBus.emit(event, data);
};

/**
 * Type-safe event subscription
 * Returns unsubscribe function
 *
 * @example
 * const unsubscribe = subscribeToEvent('file:selected', (data) => {
 *   console.log('File selected:', data.fileId);
 * });
 *
 * // Later, cleanup
 * unsubscribe();
 */
export const subscribeToEvent = <K extends keyof PlatformEvents>(
  event: K,
  handler: (data: PlatformEvents[K]) => void
): (() => void) => {
  console.log(`[EventBus] Subscribing to: ${event}`);
  eventBus.on(event, handler);

  // Return unsubscribe function
  return () => {
    console.log(`[EventBus] Unsubscribing from: ${event}`);
    eventBus.off(event, handler);
  };
};

/**
 * Subscribe to multiple events at once
 * Returns a single unsubscribe function that unsubscribes from all
 *
 * Note: Due to TypeScript's limitations with mapped tuple types, individual handlers
 * are not fully type-checked within the array. Each handler receives PlatformEvents[K]
 * data at runtime, but TypeScript cannot enforce the connection between event name
 * and handler parameter type within the tuple.
 *
 * @example
 * const unsubscribe = subscribeToMultiple([
 *   ['file:selected', handleFileSelect],
 *   ['folder:created', handleFolderCreate],
 * ]);
 */
export const subscribeToMultiple = (
  subscriptions: ReadonlyArray<readonly [keyof PlatformEvents, (data: any) => void]>
): (() => void) => {
  const unsubscribers = subscriptions.map(([event, handler]) =>
    // TypeScript limitation: Cannot preserve type relationship in mapped tuples
    // At runtime, this is type-safe because subscribeToEvent enforces the constraint
    subscribeToEvent(event, handler as (data: PlatformEvents[typeof event]) => void)
  );

  // Return function that unsubscribes from all
  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
};

/**
 * Clear all event listeners
 * Use with caution - typically only for cleanup during unmount
 */
export const clearAllListeners = () => {
  console.log('[EventBus] Clearing all listeners');
  eventBus.all.clear();
};
