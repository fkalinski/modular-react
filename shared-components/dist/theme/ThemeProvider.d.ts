import React, { ReactNode } from 'react';
export interface Theme {
    colors: {
        primary: string;
        primaryHover: string;
        primaryLight: string;
        sidebarBg: string;
        sidebarText: string;
        sidebarTextMuted: string;
        sidebarHover: string;
        sidebarActive: string;
        background: string;
        surface: string;
        textPrimary: string;
        textSecondary: string;
        textMuted: string;
        border: string;
        borderLight: string;
        hover: string;
        selected: string;
        selectedBorder: string;
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
export interface ThemeProviderProps {
    children: ReactNode;
    theme?: Partial<Theme>;
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export declare const useTheme: () => Theme;
export default ThemeProvider;
