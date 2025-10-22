import React from 'react';
export interface TopBarProps {
    searchComponent?: React.ReactNode;
    onUploadClick?: () => void;
    onNotificationsClick?: () => void;
    onUserClick?: () => void;
    userName?: string;
    notificationCount?: number;
}
export declare const TopBar: React.FC<TopBarProps>;
export default TopBar;
