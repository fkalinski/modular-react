import React from 'react';
export interface InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number';
    variant?: 'default' | 'search';
    disabled?: boolean;
    label?: string;
}
export declare const Input: React.FC<InputProps>;
export default Input;
