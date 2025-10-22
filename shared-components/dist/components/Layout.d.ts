import React from 'react';
export interface LayoutProps {
    children: React.ReactNode;
    direction?: 'row' | 'column';
    gap?: string;
    padding?: string;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}
export declare const Layout: React.FC<LayoutProps>;
export interface ContainerProps {
    children: React.ReactNode;
    maxWidth?: string;
    padding?: string;
}
export declare const Container: React.FC<ContainerProps>;
export interface CardProps {
    children: React.ReactNode;
    title?: string;
    padding?: string;
}
export declare const Card: React.FC<CardProps>;
declare const _default: {
    Layout: React.FC<LayoutProps>;
    Container: React.FC<ContainerProps>;
    Card: React.FC<CardProps>;
};
export default _default;
