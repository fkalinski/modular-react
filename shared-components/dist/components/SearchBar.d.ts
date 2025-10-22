import React from 'react';
export interface SearchScope {
    id: string;
    label: string;
    icon?: React.ReactNode;
}
export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: (value: string) => void;
    placeholder?: string;
    scopes?: SearchScope[];
    selectedScope?: string;
    onScopeChange?: (scopeId: string) => void;
}
export declare const SearchBar: React.FC<SearchBarProps>;
export default SearchBar;
