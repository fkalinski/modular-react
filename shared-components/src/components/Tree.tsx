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
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  // Box design system styling
  const nodeStyles: React.CSSProperties = {
    padding: '8px',
    paddingLeft: `${level * 16 + 8}px`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#222222',
    backgroundColor: isSelected ? '#e7f1ff' : isHovered ? '#f7f7f8' : 'transparent',
    borderLeft: isSelected ? '2px solid #0061d5' : '2px solid transparent',
    height: '32px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const expanderStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#767676',
    transition: 'transform 0.15s',
  };

  const chevronStyles: React.CSSProperties = {
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: 'transform 0.15s',
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={expanderStyles}>
          {hasChildren ? (
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              style={chevronStyles}
            >
              <path
                d="M1.5 1L6.5 6L1.5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span style={{ width: '8px' }}></span>
          )}
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
  // Box design system - clean container
  const containerStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
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
