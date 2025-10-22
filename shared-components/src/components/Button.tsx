import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  size = 'medium',
}) => {
  // Box design system sizing
  const baseStyles: React.CSSProperties = {
    padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 20px' : '10px 16px',
    fontSize: size === 'small' ? '12px' : size === 'large' ? '14px' : '13px',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    fontWeight: 500,
    transition: 'all 0.15s',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  // Box design system colors
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#0061d5',
      color: '#ffffff',
      border: 'none',
    },
    secondary: {
      backgroundColor: '#ffffff',
      color: '#222222',
      border: '1px solid #d3d3d3',
    },
    tertiary: {
      backgroundColor: 'transparent',
      color: '#0061d5',
      border: 'none',
    },
    danger: {
      backgroundColor: '#dc3545',
      color: '#ffffff',
      border: 'none',
    },
  };

  const getHoverColor = (variant: string) => {
    switch (variant) {
      case 'primary':
        return '#0053ba';
      case 'secondary':
        return '#f7f7f8';
      case 'tertiary':
        return 'rgba(0, 97, 213, 0.1)';
      case 'danger':
        return '#c82333';
      default:
        return '#0053ba';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = getHoverColor(variant);
          } else if (variant === 'tertiary') {
            e.currentTarget.style.backgroundColor = getHoverColor(variant);
          } else {
            e.currentTarget.style.backgroundColor = getHoverColor(variant);
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          const originalBg = variantStyles[variant].backgroundColor as string;
          e.currentTarget.style.backgroundColor = originalBg;
        }
      }}
    >
      {children}
    </button>
  );
};

export default Button;
