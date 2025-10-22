import React from 'react';

export interface TopBarProps {
  searchComponent?: React.ReactNode;
  onUploadClick?: () => void;
  onNotificationsClick?: () => void;
  onUserClick?: () => void;
  userName?: string;
  notificationCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchComponent,
  onUploadClick,
  onNotificationsClick,
  onUserClick,
  userName = 'User',
  notificationCount = 0,
}) => {
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null);

  // Box design system - TopBar styling
  const topBarStyles: React.CSSProperties = {
    height: '56px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e2e2',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const searchContainerStyles: React.CSSProperties = {
    flex: 1,
    maxWidth: '600px',
  };

  const utilitiesStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  };

  const iconButtonStyles = (buttonName: string): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#767676',
    backgroundColor: hoveredButton === buttonName ? '#f7f7f8' : 'transparent',
    transition: 'background-color 0.15s',
    position: 'relative',
  });

  const uploadButtonStyles: React.CSSProperties = {
    backgroundColor: hoveredButton === 'upload' ? '#0053ba' : '#0061d5',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.15s',
  };

  const userButtonStyles: React.CSSProperties = {
    ...iconButtonStyles('user'),
    padding: '4px 8px',
    gap: '6px',
  };

  const avatarStyles: React.CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0061d5',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
  };

  const notificationBadgeStyles: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 600,
    borderRadius: '10px',
    padding: '2px 5px',
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={topBarStyles}>
      {searchComponent && (
        <div style={searchContainerStyles}>
          {searchComponent}
        </div>
      )}
      <div style={utilitiesStyles}>
        <button
          style={uploadButtonStyles}
          onClick={onUploadClick}
          onMouseEnter={() => setHoveredButton('upload')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1V13M1 7H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Upload
        </button>

        <button
          style={iconButtonStyles('notifications')}
          onClick={onNotificationsClick}
          onMouseEnter={() => setHoveredButton('notifications')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5789 18.2537 10.292 18.3304 10 18.3304C9.70802 18.3304 9.42113 18.2537 9.16815 18.1079C8.91516 17.9622 8.70484 17.7526 8.55835 17.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {notificationCount > 0 && (
            <span style={notificationBadgeStyles}>{notificationCount}</span>
          )}
        </button>

        <button
          style={userButtonStyles}
          onClick={onUserClick}
          onMouseEnter={() => setHoveredButton('user')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <div style={avatarStyles}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="#767676"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
