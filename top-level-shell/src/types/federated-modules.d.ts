// Type declarations for Module Federation remotes

declare module 'shared_components/Theme' {
  import React from 'react';

  export const ThemeProvider: React.FC<{ children: React.ReactNode }>;
}

declare module 'shared_components/Sidebar' {
  import React from 'react';

  export interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
  }

  export interface SidebarProps {
    items: SidebarItem[];
    activeId: string;
    onItemClick: (item: SidebarItem) => void;
    children?: React.ReactNode;
    currentSection?: string;
    onNavigate?: (target: any) => void;
  }

  export const Sidebar: React.FC<SidebarProps>;
}

declare module 'shared_components/TopBar' {
  import React from 'react';

  export interface TopBarProps {
    searchComponent: React.ReactNode;
    onUploadClick: () => void;
    onNotificationsClick: () => void;
    onUserClick: () => void;
    userName: string;
    notificationCount: number;
  }

  export const TopBar: React.FC<TopBarProps>;
}

declare module 'shared_components/SearchBar' {
  import React from 'react';

  export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }

  export const SearchBar: React.FC<SearchBarProps>;
}

declare module 'shared_components/NavigationService' {
  export const NavigationService: any;
}

declare module 'content_shell/ContentPlatform' {
  import React from 'react';

  export const ContentPlatform: React.ComponentType<any>;
}

declare module 'reports_tab/App' {
  import React from 'react';

  const ReportsApp: React.FC;
  export default ReportsApp;
}

declare module 'user_tab/App' {
  import React from 'react';

  const UserApp: React.FC;
  export default UserApp;
}

declare module 'shared_data/store' {
  export const store: any;
}

declare module 'shared_data/context' {
  import React from 'react';

  export const GlobalStateProvider: React.FC<{ children: React.ReactNode }>;
}
