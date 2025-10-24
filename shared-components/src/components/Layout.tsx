import React from 'react';

export interface LayoutProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  gap?: string;
  padding?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  direction = 'column',
  gap = '16px',
  padding = '0',
  align = 'stretch',
  justify = 'start',
}) => {
  const styles: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap,
    padding,
    alignItems: align,
    justifyContent: justify,
  };

  return <div style={styles}>{children}</div>;
};

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = '1200px',
  padding = '20px',
}) => {
  const styles: React.CSSProperties = {
    maxWidth,
    margin: '0 auto',
    padding,
    width: '100%',
  };

  return <div style={styles}>{children}</div>;
};

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  padding?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  padding = '20px',
}) => {
  const cardStyles: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef',
    fontSize: '18px',
    fontWeight: 600,
    color: '#212529',
  };

  const contentStyles: React.CSSProperties = {
    padding,
  };

  return (
    <div style={cardStyles}>
      {title && <div style={headerStyles}>{title}</div>}
      <div style={contentStyles}>{children}</div>
    </div>
  );
};

export default { Layout, Container, Card };
