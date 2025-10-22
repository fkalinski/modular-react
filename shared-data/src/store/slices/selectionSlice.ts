import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SelectionState {
  selectedIds: string[];
  lastSelectedId?: string;
  selectionType: 'single' | 'multiple';
}

const initialState: SelectionState = {
  selectedIds: [],
  selectionType: 'multiple',
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectItem: (state, action: PayloadAction<string>) => {
      if (state.selectionType === 'single') {
        state.selectedIds = [action.payload];
      } else {
        if (!state.selectedIds.includes(action.payload)) {
          state.selectedIds.push(action.payload);
        }
      }
      state.lastSelectedId = action.payload;
    },
    deselectItem: (state, action: PayloadAction<string>) => {
      state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
      if (state.lastSelectedId === action.payload) {
        state.lastSelectedId = state.selectedIds[state.selectedIds.length - 1];
      }
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      if (state.selectedIds.includes(action.payload)) {
        state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
      } else {
        if (state.selectionType === 'single') {
          state.selectedIds = [action.payload];
        } else {
          state.selectedIds.push(action.payload);
        }
      }
      state.lastSelectedId = action.payload;
    },
    selectAll: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    clearSelection: (state) => {
      state.selectedIds = [];
      state.lastSelectedId = undefined;
    },
    setSelectionType: (state, action: PayloadAction<'single' | 'multiple'>) => {
      state.selectionType = action.payload;
      if (action.payload === 'single' && state.selectedIds.length > 1) {
        state.selectedIds = [state.selectedIds[0]];
      }
    },
  },
});

export const {
  selectItem,
  deselectItem,
  toggleSelection,
  selectAll,
  clearSelection,
  setSelectionType,
} = selectionSlice.actions;

export default selectionSlice.reducer;
