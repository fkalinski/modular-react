import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Selection state shape
 */
export interface SelectionState {
  selectedIds: string[];
  lastSelectedId: string | null;
}

/**
 * Initial state
 */
const initialState: SelectionState = {
  selectedIds: [],
  lastSelectedId: null,
};

/**
 * Selection slice
 *
 * Manages global selection state for bulk actions.
 * When user selects items in Files tab, selection persists when switching tabs.
 */
export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    // Set selection
    setSelection: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
      state.lastSelectedId = action.payload[action.payload.length - 1] || null;
    },

    // Toggle single item
    toggleSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.selectedIds.indexOf(id);

      if (index >= 0) {
        state.selectedIds.splice(index, 1);
      } else {
        state.selectedIds.push(id);
      }

      state.lastSelectedId = id;
    },

    // Select all
    selectAll: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
      state.lastSelectedId = action.payload[action.payload.length - 1] || null;
    },

    // Clear selection
    clearSelection: (state) => {
      state.selectedIds = [];
      state.lastSelectedId = null;
    },

    // Select range (for Shift+Click)
    selectRange: (state, action: PayloadAction<{ allIds: string[]; endId: string }>) => {
      const { allIds, endId } = action.payload;

      if (!state.lastSelectedId) {
        state.selectedIds = [endId];
        state.lastSelectedId = endId;
        return;
      }

      const startIndex = allIds.indexOf(state.lastSelectedId);
      const endIndex = allIds.indexOf(endId);

      if (startIndex < 0 || endIndex < 0) return;

      const rangeStart = Math.min(startIndex, endIndex);
      const rangeEnd = Math.max(startIndex, endIndex);

      const rangeIds = allIds.slice(rangeStart, rangeEnd + 1);

      // Merge with existing selection
      const newSelection = new Set([...state.selectedIds, ...rangeIds]);
      state.selectedIds = Array.from(newSelection);
      state.lastSelectedId = endId;
    },
  },
});

// Export actions
export const {
  setSelection,
  toggleSelection,
  selectAll,
  clearSelection,
  selectRange,
} = selectionSlice.actions;

// Export reducer
export default selectionSlice.reducer;

// Selectors
export const selectSelectedIds = (state: { selection: SelectionState }) =>
  state.selection.selectedIds;
export const selectLastSelectedId = (state: { selection: SelectionState }) =>
  state.selection.lastSelectedId;
export const selectSelectionCount = (state: { selection: SelectionState }) =>
  state.selection.selectedIds.length;
