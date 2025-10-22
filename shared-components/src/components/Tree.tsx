import React, { useState } from 'react';

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

const TreeNodeComponent: React.FC<{
  node: TreeNode;
  level: number;
  onNodeClick?: (node: TreeNode) => void;
  selectedId?: string;
}> = ({ node, level, onNodeClick, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const nodeStyles: React.CSSProperties = {
    padding: '6px 8px',
    paddingLeft: `${level * 20 + 8}px`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    backgroundColor: isSelected ? '#e7f3ff' : 'transparent',
    borderRadius: '4px',
    marginBottom: '2px',
  };

  const expanderStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
  };

  return (
    <div>
      <div
        style={nodeStyles}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onNodeClick?.(node);
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <span style={expanderStyles}>
          {hasChildren ? (isExpanded ? '▼' : '▶') : '  '}
        </span>
        {node.icon && <span>{node.icon}</span>}
        <span>{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Tree: React.FC<TreeProps> = ({ nodes, onNodeClick, selectedId }) => {
  const containerStyles: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '8px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  return (
    <div style={containerStyles}>
      {nodes.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          onNodeClick={onNodeClick}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
};

export default Tree;
