import React, { createContext, useContext, ReactNode } from 'react';

export interface Theme {
  colors: {
    // Primary
    primary: string;
    primaryHover: string;
    primaryLight: string;

    // Sidebar
    sidebarBg: string;
    sidebarText: string;
    sidebarTextMuted: string;
    sidebarHover: string;
    sidebarActive: string;

    // Background
    background: string;
    surface: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Borders
    border: string;
    borderLight: string;

    // States
    hover: string;
    selected: string;
    selectedBorder: string;

    // Legacy (for backwards compatibility)
    secondary: string;
    danger: string;
    success: string;
    warning: string;
    text: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
}

const defaultTheme: Theme = {
  colors: {
    // Primary - Box Blue
    primary: '#0061d5',
    primaryHover: '#0053ba',
    primaryLight: '#e7f1ff',

    // Sidebar
    sidebarBg: '#2d2d2d',
    sidebarText: '#ffffff',
    sidebarTextMuted: '#a0a0a0',
    sidebarHover: '#404040',
    sidebarActive: '#0061d5',

    // Background
    background: '#f7f7f8',
    surface: '#ffffff',

    // Text
    textPrimary: '#222222',
    textSecondary: '#767676',
    textMuted: '#909090',

    // Borders
    border: '#e2e2e2',
    borderLight: '#f0f0f0',

    // States
    hover: '#f7f7f8',
    selected: '#e7f1ff',
    selectedBorder: '#0061d5',

    // Legacy (for backwards compatibility)
    secondary: '#6c757d',
    danger: '#dc3545',
    success: '#28a745',
    warning: '#ffc107',
    text: '#222222',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '11px',
      sm: '12px',
      md: '13px',
      lg: '14px',
      xl: '16px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  children: ReactNode;
  theme?: Partial<Theme>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme = {},
}) => {
  const mergedTheme: Theme = {
    colors: { ...defaultTheme.colors, ...theme.colors },
    spacing: { ...defaultTheme.spacing, ...theme.spacing },
    typography: {
      ...defaultTheme.typography,
      ...theme.typography,
      fontSize: {
        ...defaultTheme.typography.fontSize,
        ...theme.typography?.fontSize,
      },
      fontWeight: {
        ...defaultTheme.typography.fontWeight,
        ...theme.typography?.fontWeight,
      },
    },
  };

  return (
    <ThemeContext.Provider value={mergedTheme}>
      <div
        style={{
          fontFamily: mergedTheme.typography.fontFamily,
          color: mergedTheme.colors.text,
          backgroundColor: mergedTheme.colors.background,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};

export default ThemeProvider;
