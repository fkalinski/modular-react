import React from 'react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  separator?: React.ReactNode;
  onItemClick?: (item: BreadcrumbItem) => void;
}

/**
 * Breadcrumbs Component
 *
 * Displays a navigation breadcrumb trail showing the user's location
 * in the application hierarchy. Works with Navigation Service for
 * cross-section navigation.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { id: 'home', label: 'Home', icon: '🏠' },
 *     { id: 'content', label: 'Content', icon: '📁' },
 *     { id: 'files', label: 'My Documents' },
 *   ]}
 *   onItemClick={(item) => navigateTo(item.id)}
 * />
 * ```
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  maxItems = 5,
  separator = '/',
  onItemClick,
}) => {
  // If items exceed maxItems, show first, ellipsis, and last items
  const shouldCollapse = items.length > maxItems;
  const displayItems = shouldCollapse
    ? [
        items[0],
        { id: 'ellipsis', label: '...', icon: undefined },
        ...items.slice(-(maxItems - 2)),
      ]
    : items;

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    // Don't handle click on last item (current page) or ellipsis
    if (index === displayItems.length - 1 || item.id === 'ellipsis') {
      return;
    }

    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item);
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  // Box design system styles
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e2e2',
    fontSize: '13px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    overflow: 'auto',
    whiteSpace: 'nowrap',
  };

  const itemContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const itemStyles = (isLast: boolean, isEllipsis: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: isLast ? '#222222' : '#0061d5',
    textDecoration: 'none',
    cursor: isLast || isEllipsis ? 'default' : 'pointer',
    fontWeight: isLast ? 500 : 400,
    transition: 'color 0.15s ease',
  });

  const separatorStyles: React.CSSProperties = {
    color: '#909090',
    userSelect: 'none',
  };

  return (
    <nav aria-label="Breadcrumb" style={containerStyles}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.id === 'ellipsis';

          return (
            <li key={`${item.id}-${index}`} style={itemContainerStyles}>
              <a
                href={item.href || '#'}
                onClick={(e) => {
                  if (!item.href || item.onClick || onItemClick) {
                    e.preventDefault();
                    handleItemClick(item, index);
                  }
                }}
                style={itemStyles(isLast, isEllipsis)}
                aria-current={isLast ? 'page' : undefined}
                onMouseEnter={(e) => {
                  if (!isLast && !isEllipsis) {
                    e.currentTarget.style.color = '#0052b3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLast && !isEllipsis) {
                    e.currentTarget.style.color = '#0061d5';
                  }
                }}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </a>

              {!isLast && (
                <span style={separatorStyles} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
