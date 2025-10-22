import React, { createContext, useContext, ReactNode } from 'react';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    danger: string;
    success: string;
    warning: string;
    text: string;
    background: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
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
  };
}

const defaultTheme: Theme = {
  colors: {
    primary: '#0066cc',
    secondary: '#6c757d',
    danger: '#dc3545',
    success: '#28a745',
    warning: '#ffc107',
    text: '#212529',
    background: '#ffffff',
    border: '#dee2e6',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
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
