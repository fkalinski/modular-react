import { configureStore, combineReducers } from '@reduxjs/toolkit';
import searchReducer from './slices/searchSlice';
import navigationReducer from './slices/navigationSlice';
import selectionReducer from './slices/selectionSlice';

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
  search: searchReducer,
  navigation: navigationReducer,
  selection: selectionReducer,
});

/**
 * Create the platform Redux store
 *
 * This store is shared across all micro-frontends via Module Federation.
 * Each MFE can dispatch actions and subscribe to state changes.
 */
export const createPlatformStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these paths for non-serializable values if needed
          ignoredActions: [],
          ignoredPaths: [],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

// Export store type
export type PlatformStore = ReturnType<typeof createPlatformStore>;

// Export root state type
export type RootState = ReturnType<typeof rootReducer>;

// Export dispatch type
export type AppDispatch = PlatformStore['dispatch'];
