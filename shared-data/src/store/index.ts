import { configureStore, combineReducers, Reducer, AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';
import selectionReducer from './slices/selectionSlice';
import navigationReducer from './slices/navigationSlice';

// Base reducer configuration
const staticReducers = {
  filters: filtersReducer,
  selection: selectionReducer,
  navigation: navigationReducer,
};

export type RootState = ReturnType<typeof createRootReducer>;

// Store interface with dynamic reducer injection
export interface DynamicStore extends EnhancedStore {
  asyncReducers: { [key: string]: Reducer };
  injectReducer: (key: string, reducer: Reducer) => void;
  removeReducer: (key: string) => void;
}

export type AppDispatch = DynamicStore['dispatch'];

function createRootReducer(asyncReducers = {}) {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });
}

export function createStore(preloadedState = {}) {
  const store = configureStore({
    reducer: createRootReducer(),
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these paths in the state for serialization checks
          ignoredActions: ['graphql/setClient'],
          ignoredPaths: ['graphql.client'],
        },
      }),
  }) as unknown as DynamicStore;

  // Add a dictionary to keep track of the async reducers
  store.asyncReducers = {};

  // Create an inject reducer function
  store.injectReducer = (key: string, asyncReducer: Reducer) => {
    if (store.asyncReducers[key]) {
      console.warn(`Reducer with key "${key}" already exists. Replacing it.`);
    }

    store.asyncReducers[key] = asyncReducer;
    store.replaceReducer(createRootReducer(store.asyncReducers));

    console.log(`[Store] Injected reducer: ${key}`);
  };

  // Create a remove reducer function
  store.removeReducer = (key: string) => {
    if (!store.asyncReducers[key]) {
      console.warn(`Reducer with key "${key}" does not exist.`);
      return;
    }

    delete store.asyncReducers[key];
    store.replaceReducer(createRootReducer(store.asyncReducers));

    console.log(`[Store] Removed reducer: ${key}`);
  };

  return store;
}

// Export types
export type { RootState as StoreState };
