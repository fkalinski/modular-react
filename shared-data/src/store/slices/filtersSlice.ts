import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FilterValue {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'between';
  value: any;
}

export interface FiltersState {
  active: FilterValue[];
  searchText: string;
  dateRange?: {
    start: string;
    end: string;
  };
  contentType?: string;
}

const initialState: FiltersState = {
  active: [],
  searchText: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FilterValue>) => {
      // Remove existing filter for the same field
      state.active = state.active.filter(f => f.field !== action.payload.field);
      // Add new filter
      state.active.push(action.payload);
    },
    removeFilter: (state, action: PayloadAction<string>) => {
      state.active = state.active.filter(f => f.field !== action.payload);
    },
    clearFilters: (state) => {
      state.active = [];
      state.searchText = '';
      state.dateRange = undefined;
      state.contentType = undefined;
    },
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ start: string; end: string } | undefined>) => {
      state.dateRange = action.payload;
    },
    setContentType: (state, action: PayloadAction<string | undefined>) => {
      state.contentType = action.payload;
    },
  },
});

export const {
  setFilter,
  removeFilter,
  clearFilters,
  setSearchText,
  setDateRange,
  setContentType,
} = filtersSlice.actions;

export default filtersSlice.reducer;
