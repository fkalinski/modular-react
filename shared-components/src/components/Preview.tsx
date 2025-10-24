import React from 'react';
import type { ContentItem } from './types';

export interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  onNavigateToOwner?: (ownerId: string) => void;
}

/**
 * Preview Component
 *
 * Displays a preview of a content item (file, folder, etc.) with metadata
 * and actions. Can be opened from any location in the application via
 * Module Federation.
 *
 * @example
 * ```tsx
 * <Preview
 *   isOpen={previewOpen}
 *   onClose={() => setPreviewOpen(false)}
 *   item={selectedFile}
 *   onNavigateToOwner={(ownerId) => navigate(`/users/${ownerId}`)}
 * />
 * ```
 */
export const Preview: React.FC<PreviewProps> = ({
  isOpen,
  onClose,
  item,
  onNavigateToOwner,
}) => {
  if (!isOpen || !item) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOwnerClick = () => {
    if (item.ownerId && onNavigateToOwner) {
      onNavigateToOwner(item.ownerId);
    }
  };

  // Box design system styles
  const backdropStyles: React.CSSProperties = {
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const panelStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  };

  const headerStyles: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e2e2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#222222',
    margin: 0,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#767676',
    cursor: 'pointer',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '12px',
  };

  const contentStyles: React.CSSProperties = {
    padding: '24px',
  };

  const previewAreaStyles: React.CSSProperties = {
    backgroundColor: '#f7f7f8',
    borderRadius: '4px',
    padding: '40px',
    textAlign: 'center',
    marginBottom: '24px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const fileIconStyles: React.CSSProperties = {
    fontSize: '64px',
    marginBottom: '12px',
  };

  const metadataStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '12px',
    fontSize: '13px',
  };

  const labelStyles: React.CSSProperties = {
    color: '#767676',
    fontWeight: 500,
  };

  const valueStyles: React.CSSProperties = {
    color: '#222222',
  };

  const linkStyles: React.CSSProperties = {
    color: '#0061d5',
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const footerStyles: React.CSSProperties = {
    padding: '16px 24px',
    borderTop: '1px solid #e2e2e2',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  };

  const buttonStyles = (variant: 'primary' | 'secondary'): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '4px',
    border: variant === 'secondary' ? '1px solid #d3d3d3' : 'none',
    backgroundColor: variant === 'primary' ? '#0061d5' : '#ffffff',
    color: variant === 'primary' ? '#ffffff' : '#222222',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  // Get file icon based on type
  const getFileIcon = () => {
    if (item.type === 'folder') return '📁';
    const mimeType = item.mimeType?.toLowerCase() || '';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('docx')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('xlsx')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('pptx')) return '📽️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    if (mimeType.includes('text')) return '📃';
    return '📄';
  };

  const formatFileSize = (size: string | number): string => {
    if (typeof size === 'string') return size;
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let sizeNum = size;
    while (sizeNum >= 1024 && unitIndex < units.length - 1) {
      sizeNum /= 1024;
      unitIndex++;
    }
    return `${sizeNum.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Render preview content based on file type
  const renderPreviewContent = () => {
    const mimeType = item.mimeType?.toLowerCase() || '';

    // Image preview
    if (mimeType.includes('image')) {
      return (
        <div style={{ ...previewAreaStyles, padding: '20px' }}>
          <div style={{
            width: '100%',
            height: '300px',
            backgroundColor: '#e2e2e2',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#767676',
            fontSize: '14px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
              <div>{item.name}</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>Image Preview</div>
            </div>
          </div>
        </div>
      );
    }

    // PDF preview
    if (mimeType.includes('pdf')) {
      return (
        <div style={previewAreaStyles}>
          <div style={fileIconStyles}>📄</div>
          <div style={{ fontSize: '14px', color: '#767676', marginBottom: '12px' }}>
            PDF Document
          </div>
          <div style={{ fontSize: '13px', color: '#909090' }}>
            PDF preview not available in demo
          </div>
        </div>
      );
    }

    // Text preview
    if (mimeType.includes('text')) {
      return (
        <div style={{ ...previewAreaStyles, padding: '20px', textAlign: 'left' }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e2e2',
            borderRadius: '4px',
            padding: '16px',
            fontSize: '13px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            color: '#222222',
            lineHeight: '1.6',
            maxHeight: '250px',
            overflow: 'auto',
          }}>
            <div style={{ color: '#767676', marginBottom: '8px', fontSize: '12px' }}>
              Text Content Preview:
            </div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            <br />
            Meeting notes from 2024-01-13
            <br />
            <br />
            - Discussed project timeline
            <br />
            - Reviewed budget allocations
            <br />
            - Set next milestones
          </div>
        </div>
      );
    }

    // Office document preview
    if (mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) {
      const docType = mimeType.includes('word') ? 'Word Document' :
                      mimeType.includes('excel') ? 'Excel Spreadsheet' :
                      'PowerPoint Presentation';
      return (
        <div style={previewAreaStyles}>
          <div style={fileIconStyles}>{getFileIcon()}</div>
          <div style={{ fontSize: '14px', color: '#767676', marginBottom: '12px' }}>
            {docType}
          </div>
          <div style={{ fontSize: '13px', color: '#909090' }}>
            Preview requires Microsoft Office or compatible viewer
          </div>
        </div>
      );
    }

    // Default preview
    return (
      <div style={previewAreaStyles}>
        <div style={fileIconStyles}>{getFileIcon()}</div>
        <div style={{ fontSize: '13px', color: '#767676' }}>
          {item.type === 'folder' ? 'Folder' : item.mimeType || 'File'}
        </div>
      </div>
    );
  };

  return (
    <div style={backdropStyles} onClick={handleBackdropClick}>
      <div style={panelStyles} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyles}>
          <h2 style={titleStyles}>{item.name}</h2>
          <button
            style={closeButtonStyles}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#222222';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#767676';
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={contentStyles}>
          {/* Preview Area - Dynamic based on file type */}
          {renderPreviewContent()}

          {/* Metadata */}
          <div style={metadataStyles}>
            <div style={labelStyles}>Type:</div>
            <div style={valueStyles}>{item.type}</div>

            {item.size && (
              <>
                <div style={labelStyles}>Size:</div>
                <div style={valueStyles}>{formatFileSize(item.size)}</div>
              </>
            )}

            {item.owner && (
              <>
                <div style={labelStyles}>Owner:</div>
                <div style={valueStyles}>
                  {item.ownerId && onNavigateToOwner ? (
                    <a
                      style={linkStyles}
                      onClick={handleOwnerClick}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {item.owner}
                    </a>
                  ) : (
                    item.owner
                  )}
                </div>
              </>
            )}

            {item.createdAt && (
              <>
                <div style={labelStyles}>Created:</div>
                <div style={valueStyles}>{formatDate(item.createdAt)}</div>
              </>
            )}

            {item.updatedAt && (
              <>
                <div style={labelStyles}>Modified:</div>
                <div style={valueStyles}>{formatDate(item.updatedAt)}</div>
              </>
            )}

            {item.mimeType && (
              <>
                <div style={labelStyles}>MIME Type:</div>
                <div style={valueStyles}>{item.mimeType}</div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyles}>
          {item.type !== 'folder' && (
            <button
              style={buttonStyles('secondary')}
              onClick={() => {
                console.log('Download:', item.name);
                alert(`Download started for: ${item.name}\n\nIn production, this would initiate a file download.`);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f7f7f8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              ⬇️ Download
            </button>
          )}
          {item.ownerId && onNavigateToOwner && (
            <button
              style={buttonStyles('secondary')}
              onClick={handleOwnerClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f7f7f8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              View Owner Profile
            </button>
          )}
          <button
            style={buttonStyles('primary')}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0052b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0061d5';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
