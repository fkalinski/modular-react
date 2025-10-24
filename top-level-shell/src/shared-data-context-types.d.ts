// Workaround for shared_data/context types that use relative imports
// This provides the actual exports from PlatformContext

declare module 'shared_data/context' {
  import React, { ReactNode } from 'react';

  export interface PlatformContextValue {
    filters: any;
    selection: any;
    navigation: any;
  }

  export interface PlatformContextProviderProps {
    children: ReactNode;
  }

  export const PlatformContextProvider: React.FC<PlatformContextProviderProps>;
  export const usePlatformContext: () => PlatformContextValue;

  const PlatformContext: React.Context<PlatformContextValue | null>;
  export default PlatformContext;
}
