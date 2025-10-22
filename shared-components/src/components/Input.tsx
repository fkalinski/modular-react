import React from 'react';

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  label,
}) => {
  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={labelStyles}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyles}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0066cc';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#ced4da';
        }}
      />
    </div>
  );
};

export default Input;
