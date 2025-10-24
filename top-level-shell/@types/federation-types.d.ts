/**
 * TypeScript declarations for Module Federation remote modules
 * These declarations tell TypeScript about the shape of dynamically loaded remotes
 */

// Shared Components Remote
declare module 'shared_components/Theme' {
  import { ComponentType, ReactNode } from 'react';
  export interface ThemeProviderProps {
    children: ReactNode;
  }
  export const ThemeProvider: ComponentType<ThemeProviderProps>;
}

declare module 'shared_components/Sidebar' {
  import { ComponentType } from 'react';
  export interface SidebarProps {
    items: Array<{
      id: string;
      label: string;
      icon: React.ReactNode;
    }>;
    activeId: string;
    onItemClick: (item: { id: string }) => void;
  }
  export const Sidebar: ComponentType<SidebarProps>;
}

declare module 'shared_components/TopBar' {
  import { ComponentType, ReactNode } from 'react';
  export interface TopBarProps {
    searchComponent?: ReactNode;
    onUploadClick?: () => void;
    onNotificationsClick?: () => void;
    onUserClick?: () => void;
    userName?: string;
    notificationCount?: number;
  }
  export const TopBar: ComponentType<TopBarProps>;
}

declare module 'shared_components/SearchBar' {
  import { ComponentType } from 'react';
  export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }
  export const SearchBar: ComponentType<SearchBarProps>;
}

declare module 'shared_components/NavigationService' {
  import { ComponentType, ReactNode } from 'react';
  export interface NavigationProviderProps {
    children: ReactNode;
    currentSection?: string;
    onNavigate?: (target: string) => void;
  }
  export const NavigationProvider: ComponentType<NavigationProviderProps>;
}

declare module 'shared_components/ErrorBoundary' {
  import { Component, ComponentType, ReactNode, ErrorInfo } from 'react';

  export interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }

  export class ErrorBoundary extends Component<ErrorBoundaryProps> {}

  export function withErrorBoundary<P extends object>(
    Component: ComponentType<P>,
    options?: Omit<ErrorBoundaryProps, 'children'>
  ): ComponentType<P>;
}

// Shared Data Remote
declare module 'shared_data/store' {
  import { Store, AnyAction } from '@reduxjs/toolkit';

  export function createStore(): Store<any, AnyAction>;

  export function setSearchText(text: string): AnyAction;
  export function addFilter(filter: any): AnyAction;
  export function removeFilter(filterId: string): AnyAction;
  export function setSelection(ids: string[]): AnyAction;
  export function setNavigation(path: string): AnyAction;
}

declare module 'shared_data/utils' {
  export function loadDynamicRemote<T = any>(
    remoteName: string,
    modulePath: string
  ): Promise<T>;

  export function getRemoteURL(remoteName: string): string;
  export function preloadRemote(remoteName: string): Promise<void>;
}

declare module 'shared_data/mfDevTools' {
  export interface MFDevTools {
    override(remoteName: string, url: string): void;
    clearOverrides(): void;
    useStaging(remoteName: string): void;
    testPR(remoteName: string, prNumber: number): void;
    showOverrides(): void;
  }

  export const mfDevTools: MFDevTools;
}

declare module 'shared_data/context' {
  export const PlatformContext: any;
}

declare module 'shared_data/graphql' {
  import { ApolloClient } from '@apollo/client';
  export const apolloClient: ApolloClient<any>;
}

// Content Shell Remote
declare module 'content_shell/ContentPlatform' {
  import { ComponentType } from 'react';
  const ContentPlatform: ComponentType;
  export default ContentPlatform;
}

// Reports Tab Remote
declare module 'reports_tab/App' {
  import { ComponentType } from 'react';
  const ReportsTab: ComponentType;
  export default ReportsTab;
}

// User Tab Remote
declare module 'user_tab/App' {
  import { ComponentType } from 'react';
  const UserTab: ComponentType;
  export default UserTab;
}
