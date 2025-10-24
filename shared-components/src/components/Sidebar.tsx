import React from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  activeId?: string;
  onItemClick: (item: SidebarItem) => void;
}

const SidebarItemComponent: React.FC<{
  item: SidebarItem;
  level: number;
  isActive: boolean;
  onItemClick: (item: SidebarItem) => void;
}> = ({ item, level, isActive, onItemClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasChildren = item.children && item.children.length > 0;

  // Box design system - Sidebar item styling
  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    paddingLeft: `${level * 16 + 12}px`,
    cursor: 'pointer',
    color: isActive ? '#ffffff' : '#a0a0a0',
    backgroundColor: isActive ? '#0061d5' : isHovered ? '#404040' : 'transparent',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '4px',
    margin: '2px 8px',
    height: '32px',
    transition: 'all 0.15s',
  };

  const iconStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: 'inherit',
  };

  const badgeStyles: React.CSSProperties = {
    marginLeft: 'auto',
    backgroundColor: isActive ? '#ffffff' : '#0061d5',
    color: isActive ? '#0061d5' : '#ffffff',
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '20px',
    textAlign: 'center',
  };

  const chevronStyles: React.CSSProperties = {
    marginLeft: 'auto',
    transition: 'transform 0.15s',
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    fontSize: '10px',
    color: '#767676',
  };

  return (
    <div>
      <div
        style={itemStyles}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onItemClick(item);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={iconStyles}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge && <span style={badgeStyles}>{item.badge}</span>}
        {hasChildren && (
          <span style={chevronStyles}>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
              <path
                d="M1.5 1L6.5 6L1.5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <SidebarItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              isActive={false}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ items, activeId, onItemClick }) => {
  // Box design system - Dark sidebar
  const sidebarStyles: React.CSSProperties = {
    width: '216px',
    height: '100vh',
    backgroundColor: '#2d2d2d',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const headerStyles: React.CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid #404040',
  };

  const logoStyles: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const navStyles: React.CSSProperties = {
    flex: 1,
    padding: '8px 0',
    overflowY: 'auto',
  };

  const footerStyles: React.CSSProperties = {
    padding: '16px',
    borderTop: '1px solid #404040',
    color: '#a0a0a0',
    fontSize: '12px',
  };

  return (
    <div style={sidebarStyles}>
      <div style={headerStyles}>
        <div style={logoStyles}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M4 9h16M9 4v16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>Box Platform</span>
        </div>
      </div>
      <div style={navStyles}>
        {items.map((item) => (
          <SidebarItemComponent
            key={item.id}
            item={item}
            level={0}
            isActive={activeId === item.id}
            onItemClick={onItemClick}
          />
        ))}
      </div>
      <div style={footerStyles}>
        <div>Enterprise Edition</div>
      </div>
    </div>
  );
};

export default Sidebar;
