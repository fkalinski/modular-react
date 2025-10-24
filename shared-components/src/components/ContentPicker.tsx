import React, { useState, useEffect, useMemo, useRef } from 'react';

export interface ContentLocation {
  id: string;
  name: string;
  type: 'folder' | 'hub' | 'workspace';
  icon?: string;
  children?: ContentLocation[];
  path?: string;
}

export interface ContentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: ContentLocation | ContentLocation[]) => void;
  title?: string;
  locations: ContentLocation[];
  multiSelect?: boolean;
  allowedTypes?: ('folder' | 'hub' | 'workspace')[];
  selectedIds?: string[];
  searchable?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Content Picker Dialog
 *
 * A reusable dialog for selecting content locations (folders, hubs, workspaces).
 * Shared across all federated modules via Module Federation.
 *
 * @example
 * ```tsx
 * const [isPickerOpen, setIsPickerOpen] = useState(false);
 *
 * <ContentPicker
 *   isOpen={isPickerOpen}
 *   onClose={() => setIsPickerOpen(false)}
 *   onSelect={(location) => {
 *     console.log('Selected:', location);
 *     setIsPickerOpen(false);
 *   }}
 *   locations={folderTree}
 *   multiSelect={false}
 *   searchable={true}
 * />
 * ```
 */
export const ContentPicker: React.FC<ContentPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Choose Location',
  locations,
  multiSelect = false,
  allowedTypes,
  selectedIds,
  searchable = true,
  confirmLabel = 'Select',
  cancelLabel = 'Cancel',
}) => {
  // Create stable default to prevent infinite loop when prop is undefined
  const stableDefaultIds = useMemo(() => [], []);
  const effectiveSelectedIds = selectedIds ?? stableDefaultIds;

  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set(effectiveSelectedIds));
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');

  // Track previous selectedIds to prevent infinite loop from array reference changes
  const prevSelectedIdsRef = useRef<string[]>(effectiveSelectedIds);

  useEffect(() => {
    // Only update if array contents actually changed, not just reference
    const prevIds = prevSelectedIdsRef.current;
    const currentIds = effectiveSelectedIds;

    if (
      prevIds.length !== currentIds.length ||
      !prevIds.every((id, index) => id === currentIds[index])
    ) {
      setSelectedSet(new Set(currentIds));
      prevSelectedIdsRef.current = currentIds;
    }
  }, [effectiveSelectedIds]);

  useEffect(() => {
    if (!isOpen) {
      setSearchText('');
      setExpandedSet(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedSet);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSet(newExpanded);
  };

  const handleToggleSelect = (location: ContentLocation) => {
    if (allowedTypes && !allowedTypes.includes(location.type)) {
      return; // Not selectable
    }

    if (multiSelect) {
      const newSelected = new Set(selectedSet);
      if (newSelected.has(location.id)) {
        newSelected.delete(location.id);
      } else {
        newSelected.add(location.id);
      }
      setSelectedSet(newSelected);
    } else {
      setSelectedSet(new Set([location.id]));
    }
  };

  const handleConfirm = () => {
    const findLocations = (locs: ContentLocation[], ids: Set<string>): ContentLocation[] => {
      const result: ContentLocation[] = [];
      for (const loc of locs) {
        if (ids.has(loc.id)) {
          result.push(loc);
        }
        if (loc.children) {
          result.push(...findLocations(loc.children, ids));
        }
      }
      return result;
    };

    const selected = findLocations(locations, selectedSet);
    if (multiSelect) {
      onSelect(selected);
    } else {
      onSelect(selected[0]);
    }
  };

  const filterLocations = (locs: ContentLocation[], search: string): ContentLocation[] => {
    if (!search) return locs;

    const lowerSearch = search.toLowerCase();
    const filtered: ContentLocation[] = [];

    for (const loc of locs) {
      const matches = loc.name.toLowerCase().includes(lowerSearch);
      const childMatches = loc.children ? filterLocations(loc.children, search) : [];

      if (matches || childMatches.length > 0) {
        filtered.push({
          ...loc,
          children: childMatches.length > 0 ? childMatches : loc.children,
        });
      }
    }

    return filtered;
  };

  const renderLocationTree = (locs: ContentLocation[], level: number = 0) => {
    const filteredLocs = filterLocations(locs, searchText);

    return filteredLocs.map((location) => {
      const isExpanded = expandedSet.has(location.id);
      const isSelected = selectedSet.has(location.id);
      const hasChildren = location.children && location.children.length > 0;
      const isSelectable = !allowedTypes || allowedTypes.includes(location.type);

      return (
        <div key={location.id} style={{ marginLeft: level > 0 ? '20px' : '0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: isSelected ? '#e7f1ff' : 'transparent',
              cursor: isSelectable ? 'pointer' : 'default',
              opacity: isSelectable ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (isSelectable) {
                e.currentTarget.style.backgroundColor = isSelected ? '#e7f1ff' : '#f7f7f8';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isSelected ? '#e7f1ff' : 'transparent';
            }}
          >
            {/* Expand/collapse icon */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpand(location.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '4px',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path
                    d="M4 2L8 6L4 10"
                    stroke="#767676"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* Checkbox (multi-select) */}
            {multiSelect && isSelectable && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleSelect(location)}
                style={{ marginRight: '8px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Location item */}
            <div
              onClick={() => isSelectable && handleToggleSelect(location)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {/* Icon */}
              <span style={{ fontSize: '16px' }}>
                {location.icon || (location.type === 'folder' ? '📁' : location.type === 'hub' ? '🏢' : '💼')}
              </span>

              {/* Name */}
              <span
                style={{
                  fontSize: '13px',
                  color: '#222222',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {location.name}
              </span>

              {/* Path (if available) */}
              {location.path && (
                <span style={{ fontSize: '11px', color: '#909090', marginLeft: 'auto' }}>
                  {location.path}
                </span>
              )}
            </div>
          </div>

          {/* Render children */}
          {hasChildren && isExpanded && renderLocationTree(location.children!, level + 1)}
        </div>
      );
    });
  };

  // Box design system styles
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const dialogStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const headerStyles: React.CSSProperties = {
    padding: '20px',
    borderBottom: '1px solid #e2e2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#222222',
    margin: 0,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    color: '#767676',
  };

  const searchContainerStyles: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e2e2',
  };

  const searchInputStyles: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d3d3d3',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '12px 20px',
  };

  const footerStyles: React.CSSProperties = {
    padding: '16px 20px',
    borderTop: '1px solid #e2e2e2',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  };

  const buttonStyles: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
  };

  const primaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: '#0061d5',
    color: '#ffffff',
  };

  const secondaryButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    backgroundColor: '#f7f7f8',
    color: '#222222',
    border: '1px solid #d3d3d3',
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={dialogStyles} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyles}>
          <h2 style={titleStyles}>{title}</h2>
          <button style={closeButtonStyles} onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        {searchable && (
          <div style={searchContainerStyles}>
            <input
              type="text"
              placeholder="Search locations..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={searchInputStyles}
            />
          </div>
        )}

        {/* Content - Location Tree */}
        <div style={contentStyles}>
          {locations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#767676' }}>
              No locations available
            </div>
          ) : (
            renderLocationTree(locations)
          )}
        </div>

        {/* Footer */}
        <div style={footerStyles}>
          <button style={secondaryButtonStyles} onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            style={primaryButtonStyles}
            onClick={handleConfirm}
            disabled={selectedSet.size === 0}
          >
            {confirmLabel}
            {selectedSet.size > 0 && multiSelect && ` (${selectedSet.size})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentPicker;
