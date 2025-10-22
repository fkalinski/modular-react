/**
 * @platform/context
 *
 * Platform context and event bus for cross-MFE communication
 *
 * This package provides two patterns for cross-MFE communication:
 * 1. React Context - For parent-child state sharing (search, filters, selection)
 * 2. Event Bus - For loose coupling between sibling MFEs
 *
 * Usage:
 * - Wrap your app with PlatformProvider
 * - Use usePlatform() hook to access context
 * - Use publishEvent() and subscribeToEvent() for cross-tab events
 */

// Export Context
export {
  PlatformContext,
  PlatformProvider,
  usePlatform,
  useSearch,
  useNavigation,
  useSelection,
  useUser,
} from './PlatformContext';

export type {
  PlatformContextValue,
  Breadcrumb,
  User,
} from './PlatformContext';

// Export Event Bus
export {
  eventBus,
  publishEvent,
  subscribeToEvent,
  subscribeToMultiple,
  clearAllListeners,
} from './EventBus';

export type {
  PlatformEvents,
  Filter,
} from './EventBus';
