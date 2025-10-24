import React, { useState } from 'react';

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  variant?: 'default' | 'search';
  disabled?: boolean;
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  variant = 'default',
  disabled = false,
  label,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Box design system styling
  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    paddingLeft: variant === 'search' ? '32px' : '12px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    border: isFocused ? '2px solid #0061d5' : '1px solid #d3d3d3',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border 0.15s',
    height: '36px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#222222',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#222222',
  };

  const containerStyles: React.CSSProperties = {
    marginBottom: '16px',
    position: 'relative',
  };

  const searchIconStyles: React.CSSProperties = {
    position: 'absolute',
    left: '10px',
    top: label ? 'calc(50% + 10px)' : '50%',
    transform: 'translateY(-50%)',
    color: '#767676',
    fontSize: '14px',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      {variant === 'search' && (
        <span style={searchIconStyles}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 13L9.5 9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...inputStyles,
          ...(disabled && { opacity: 0.6, cursor: 'not-allowed' }),
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
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

export default Input;
