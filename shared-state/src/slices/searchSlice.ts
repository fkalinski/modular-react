import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Filter interface (matches @platform/context)
 */
export interface Filter {
  id: string;
  type: string;
  label: string;
  value: unknown;
}

/**
 * Search state shape
 */
export interface SearchState {
  query: string;
  filters: Filter[];
  results: {
    files: number;
    folders: number;
    hubs: number;
    total: number;
  };
}

/**
 * Initial state
 */
const initialState: SearchState = {
  query: '',
  filters: [],
  results: {
    files: 0,
    folders: 0,
    hubs: 0,
    total: 0,
  },
};

/**
 * Search slice
 *
 * Manages global search state across all tabs.
 * Tabs can dispatch actions to update search, and all subscribed tabs will re-render.
 */
export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Set search query
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },

    // Set all filters
    setFilters: (state, action: PayloadAction<Filter[]>) => {
      state.filters = action.payload;
    },

    // Add or update a single filter
    addFilter: (state, action: PayloadAction<Filter>) => {
      const existingIndex = state.filters.findIndex(
        f => f.id === action.payload.id
      );

      if (existingIndex >= 0) {
        state.filters[existingIndex] = action.payload;
      } else {
        state.filters.push(action.payload);
      }
    },

    // Remove a filter
    removeFilter: (state, action: PayloadAction<string>) => {
      state.filters = state.filters.filter(f => f.id !== action.payload);
    },

    // Clear all search state
    clearSearch: (state) => {
      state.query = '';
      state.filters = [];
      state.results = {
        files: 0,
        folders: 0,
        hubs: 0,
        total: 0,
      };
    },

    // Update search results
    updateResults: (state, action: PayloadAction<Partial<SearchState['results']>>) => {
      state.results = { ...state.results, ...action.payload };
    },
  },
});

// Export actions
export const {
  setQuery,
  setFilters,
  addFilter,
  removeFilter,
  clearSearch,
  updateResults,
} = searchSlice.actions;

// Export reducer
export default searchSlice.reducer;

// Selectors
export const selectSearchQuery = (state: { search: SearchState }) => state.search.query;
export const selectFilters = (state: { search: SearchState }) => state.search.filters;
export const selectSearchResults = (state: { search: SearchState }) => state.search.results;
