import React, { useState } from 'react';

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

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search files, folders, and content',
  scopes = [],
  selectedScope,
  onScopeChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showScopeMenu, setShowScopeMenu] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const currentScope = scopes.find(s => s.id === selectedScope) || scopes[0];

  // Box design system - Pill-shaped search bar
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  const searchBarStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f7f7f8',
    borderRadius: '20px',
    border: isFocused ? '2px solid #0061d5' : '2px solid transparent',
    padding: '6px 12px',
    gap: '8px',
    transition: 'border-color 0.15s',
  };

  const scopeButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#222222',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const separatorStyles: React.CSSProperties = {
    width: '1px',
    height: '16px',
    backgroundColor: '#d3d3d3',
  };

  const inputStyles: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    color: '#222222',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const iconStyles: React.CSSProperties = {
    color: '#767676',
    display: 'flex',
    alignItems: 'center',
  };

  const scopeMenuStyles: React.CSSProperties = {
    position: 'absolute',
    top: '42px',
    left: '0',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e2e2',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    minWidth: '200px',
    zIndex: 1000,
  };

  const scopeMenuItemStyles = (isSelected: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#222222',
    backgroundColor: isSelected ? '#e7f1ff' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  return (
    <div style={containerStyles}>
      <div style={searchBarStyles}>
        <span style={iconStyles}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 14L10.5 10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {scopes.length > 0 && (
          <>
            <button
              style={scopeButtonStyles}
              onClick={() => setShowScopeMenu(!showScopeMenu)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e2e2e2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {currentScope?.icon}
              <span>{currentScope?.label || 'All'}</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div style={separatorStyles}></div>
          </>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={inputStyles}
        />

        {value && (
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#767676',
            }}
            onClick={() => onChange('')}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M9 3L3 9M3 3L9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {showScopeMenu && scopes.length > 0 && (
        <div
          style={scopeMenuStyles}
          onMouseLeave={() => setShowScopeMenu(false)}
        >
          {scopes.map((scope) => (
            <div
              key={scope.id}
              style={scopeMenuItemStyles(scope.id === selectedScope)}
              onClick={() => {
                onScopeChange?.(scope.id);
                setShowScopeMenu(false);
              }}
              onMouseEnter={(e) => {
                if (scope.id !== selectedScope) {
                  e.currentTarget.style.backgroundColor = '#f7f7f8';
                }
              }}
              onMouseLeave={(e) => {
                if (scope.id !== selectedScope) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {scope.icon}
              <span>{scope.label}</span>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          input::placeholder {
            color: #909090;
          }
        `}
      </style>
    </div>
  );
};

export default SearchBar;
