import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { FiltersState } from '../store/slices/filtersSlice';
import { SelectionState } from '../store/slices/selectionSlice';
import { NavigationState } from '../store/slices/navigationSlice';

export interface PlatformContextValue {
  filters: FiltersState;
  selection: SelectionState;
  navigation: NavigationState;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export interface PlatformContextProviderProps {
  children: ReactNode;
}

export const PlatformContextProvider: React.FC<PlatformContextProviderProps> = ({ children }) => {
  const filters = useSelector((state: any) => state.filters);
  const selection = useSelector((state: any) => state.selection);
  const navigation = useSelector((state: any) => state.navigation);

  const value: PlatformContextValue = {
    filters,
    selection,
    navigation,
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatformContext = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatformContext must be used within PlatformContextProvider');
  }
  return context;
};

export default PlatformContext;
