import React, { createContext, useContext, ReactNode } from 'react';

export type NavigationTarget = 'content' | 'reports' | 'user' | 'archives' | 'admin';

export interface NavigationContextValue {
  /**
   * Navigate to a specific section
   */
  navigateTo: (target: NavigationTarget, params?: Record<string, any>) => void;

  /**
   * Get current active section
   */
  currentSection: NavigationTarget;

  /**
   * Navigate back
   */
  goBack?: () => void;

  /**
   * Navigate with state
   */
  navigateWithState?: (target: NavigationTarget, state: any) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export interface NavigationProviderProps {
  children: ReactNode;
  currentSection: NavigationTarget;
  onNavigate: (target: NavigationTarget, params?: Record<string, any>) => void;
  onGoBack?: () => void;
}

/**
 * Navigation Provider
 *
 * Provides navigation capabilities across federated modules.
 * Should be placed at the top-level shell to provide navigation
 * to all child modules.
 *
 * @example
 * ```tsx
 * <NavigationProvider
 *   currentSection={activeSection}
 *   onNavigate={(target) => setActiveSection(target)}
 * >
 *   <App />
 * </NavigationProvider>
 * ```
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  currentSection,
  onNavigate,
  onGoBack,
}) => {
  const navigateWithState = (target: NavigationTarget, state: any) => {
    onNavigate(target, { state });
  };

  const value: NavigationContextValue = {
    navigateTo: onNavigate,
    currentSection,
    goBack: onGoBack,
    navigateWithState,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * useNavigation Hook
 *
 * Access navigation capabilities from any federated module.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { navigateTo, currentSection } = useNavigation();
 *
 *   return (
 *     <button onClick={() => navigateTo('reports')}>
 *       Go to Reports
 *     </button>
 *   );
 * };
 * ```
 */
export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

/**
 * Navigation Link Component
 *
 * A reusable link component that uses the navigation context.
 *
 * @example
 * ```tsx
 * <NavigationLink to="reports" style={{ color: 'blue' }}>
 *   View Reports
 * </NavigationLink>
 * ```
 */
export interface NavigationLinkProps {
  to: NavigationTarget;
  children: ReactNode;
  params?: Record<string, any>;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  to,
  children,
  params,
  style,
  className,
  onClick,
}) => {
  const { navigateTo, currentSection } = useNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    navigateTo(to, params);
  };

  const isActive = currentSection === to;

  const linkStyles: React.CSSProperties = {
    color: isActive ? '#0061d5' : '#0073e6',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: isActive ? 600 : 400,
    ...style,
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      style={linkStyles}
      className={className}
    >
      {children}
    </a>
  );
};

export default NavigationProvider;
