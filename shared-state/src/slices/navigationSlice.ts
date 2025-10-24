import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Breadcrumb interface (matches @platform/context)
 */
export interface Breadcrumb {
  id: string;
  label: string;
  path?: string;
}

/**
 * Navigation state shape
 */
export interface NavigationState {
  currentPath: Breadcrumb[];
  currentFolderId: string | null;
  currentHubId: string | null;
}

/**
 * Initial state
 */
const initialState: NavigationState = {
  currentPath: [],
  currentFolderId: null,
  currentHubId: null,
};

/**
 * Navigation slice
 *
 * Manages global navigation state (breadcrumbs, current location).
 * All tabs can see where the user is in the application.
 */
export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    // Set breadcrumb path
    setPath: (state, action: PayloadAction<Breadcrumb[]>) => {
      state.currentPath = action.payload;
    },

    // Navigate to a folder
    navigateToFolder: (state, action: PayloadAction<{ folderId: string; breadcrumbs: Breadcrumb[] }>) => {
      state.currentFolderId = action.payload.folderId;
      state.currentPath = action.payload.breadcrumbs;
    },

    // Navigate to a hub
    navigateToHub: (state, action: PayloadAction<{ hubId: string; breadcrumbs: Breadcrumb[] }>) => {
      state.currentHubId = action.payload.hubId;
      state.currentPath = action.payload.breadcrumbs;
    },

    // Clear navigation
    clearNavigation: (state) => {
      state.currentPath = [];
      state.currentFolderId = null;
      state.currentHubId = null;
    },
  },
});

// Export actions
export const {
  setPath,
  navigateToFolder,
  navigateToHub,
  clearNavigation,
} = navigationSlice.actions;

// Export reducer
export default navigationSlice.reducer;

// Selectors
export const selectCurrentPath = (state: { navigation: NavigationState }) =>
  state.navigation.currentPath;
export const selectCurrentFolderId = (state: { navigation: NavigationState }) =>
  state.navigation.currentFolderId;
export const selectCurrentHubId = (state: { navigation: NavigationState }) =>
  state.navigation.currentHubId;
