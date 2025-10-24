import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NavigationState {
  currentPath: string;
  breadcrumbs: Array<{ label: string; path: string }>;
  activeTab: string;
  history: string[];
}

const initialState: NavigationState = {
  currentPath: '/',
  breadcrumbs: [{ label: 'Home', path: '/' }],
  activeTab: 'content',
  history: ['/'],
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    navigate: (state, action: PayloadAction<string>) => {
      state.currentPath = action.payload;
      state.history.push(action.payload);

      // Keep history limited to last 50 items
      if (state.history.length > 50) {
        state.history = state.history.slice(-50);
      }
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    goBack: (state) => {
      if (state.history.length > 1) {
        state.history.pop(); // Remove current
        state.currentPath = state.history[state.history.length - 1];
      }
    },
  },
});

export const {
  navigate,
  setBreadcrumbs,
  setActiveTab,
  goBack,
} = navigationSlice.actions;

export default navigationSlice.reducer;
