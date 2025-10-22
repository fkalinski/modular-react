import React from 'react';
export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
    icon?: string;
    data?: any;
}
export interface TreeProps {
    nodes: TreeNode[];
    onNodeClick?: (node: TreeNode) => void;
    selectedId?: string;
}
export declare const Tree: React.FC<TreeProps>;
export default Tree;
