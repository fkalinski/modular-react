import React from 'react';
export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
}
export declare const Button: React.FC<ButtonProps>;
export default Button;
