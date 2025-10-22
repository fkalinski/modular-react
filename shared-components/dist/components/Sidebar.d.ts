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
export declare const Sidebar: React.FC<SidebarProps>;
export default Sidebar;
