import React from 'react';

/**
 * Custom Components for File Requests Tab
 *
 * Demonstrates Level 2 integration with programmatic extensions:
 * - Custom cell renderers
 * - Visual components mixed with config-based DataTable
 * - Reusable UI components for specific use cases
 */

interface StatusBadgeProps {
  status: string;
}

/**
 * Custom Status Badge Component
 * Shows status with color-coded badge
 */
export function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const getStatusStyle = (status: string) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'capitalize',
    };

    switch (status) {
      case 'pending':
        return {
          ...baseStyle,
          backgroundColor: '#fff4e6',
          color: '#d46b08',
        };
      case 'approved':
        return {
          ...baseStyle,
          backgroundColor: '#f6ffed',
          color: '#52c41a',
        };
      case 'in_progress':
        return {
          ...baseStyle,
          backgroundColor: '#e6f7ff',
          color: '#1890ff',
        };
      case 'completed':
        return {
          ...baseStyle,
          backgroundColor: '#f0f5ff',
          color: '#2f54eb',
        };
      case 'rejected':
        return {
          ...baseStyle,
          backgroundColor: '#fff1f0',
          color: '#f5222d',
        };
      case 'overdue':
        return {
          ...baseStyle,
          backgroundColor: '#fff0f6',
          color: '#eb2f96',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f5f5f5',
          color: '#666',
        };
    }
  };

  return (
    <span style={getStatusStyle(status)}>
      {status.replace('_', ' ')}
    </span>
  );
}

interface PriorityIndicatorProps {
  priority: string;
}

/**
 * Custom Priority Indicator Component
 * Shows priority with icon and color
 */
export function PriorityIndicator({ priority }: PriorityIndicatorProps): JSX.Element {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: '🔴',
          label: 'High',
          color: '#f5222d',
          bgColor: '#fff1f0',
        };
      case 'medium':
        return {
          icon: '🟡',
          label: 'Medium',
          color: '#d46b08',
          bgColor: '#fff4e6',
        };
      case 'low':
        return {
          icon: '🟢',
          label: 'Low',
          color: '#52c41a',
          bgColor: '#f6ffed',
        };
      default:
        return {
          icon: '⚪',
          label: 'Normal',
          color: '#666',
          bgColor: '#f5f5f5',
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '10px',
        backgroundColor: config.bgColor,
        color: config.color,
        fontSize: '13px',
        fontWeight: 500,
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

interface DueDateCellProps {
  dueDate: string;
  status: string;
}

/**
 * Custom Due Date Cell Component
 * Shows due date with color coding based on urgency
 */
export function DueDateCell({ dueDate, status }: DueDateCellProps): JSX.Element {
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const getStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    };

    if (status === 'completed' || status === 'rejected') {
      return {
        ...baseStyle,
        color: '#999',
      };
    }

    if (daysUntilDue < 0) {
      return {
        ...baseStyle,
        color: '#f5222d',
        fontWeight: 600,
      };
    }

    if (daysUntilDue <= 1) {
      return {
        ...baseStyle,
        color: '#fa8c16',
        fontWeight: 600,
      };
    }

    if (daysUntilDue <= 3) {
      return {
        ...baseStyle,
        color: '#d46b08',
        fontWeight: 500,
      };
    }

    return baseStyle;
  };

  const getUrgencyLabel = (): string | null => {
    if (status === 'completed' || status === 'rejected') {
      return null;
    }

    if (daysUntilDue < 0) {
      return `⚠️ ${Math.abs(daysUntilDue)} days overdue`;
    }

    if (daysUntilDue === 0) {
      return '🔥 Due today';
    }

    if (daysUntilDue === 1) {
      return '⚡ Due tomorrow';
    }

    if (daysUntilDue <= 3) {
      return `⏰ ${daysUntilDue} days left`;
    }

    return null;
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(due);

  const urgencyLabel = getUrgencyLabel();

  return (
    <div style={getStyle()}>
      <div>{formattedDate}</div>
      {urgencyLabel && (
        <div style={{ fontSize: '11px', fontWeight: 600 }}>{urgencyLabel}</div>
      )}
    </div>
  );
}

interface FileInfoCellProps {
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
}

/**
 * Custom File Info Cell Component
 * Shows file name with type and size if uploaded
 */
export function FileInfoCell({ fileName, fileType, fileSize }: FileInfoCellProps): JSX.Element {
  const getFileIcon = (type: string | null): string => {
    if (!type) return '📄';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📘';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📗';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📙';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    if (type.includes('audio')) return '🎵';
    return '📄';
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = Math.abs(bytes);
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>{getFileIcon(fileType)}</span>
        <span style={{ fontWeight: 500 }}>{fileName}</span>
      </div>
      {fileSize && (
        <div style={{ fontSize: '12px', color: '#666', paddingLeft: '26px' }}>
          {formatFileSize(fileSize)}
        </div>
      )}
    </div>
  );
}
