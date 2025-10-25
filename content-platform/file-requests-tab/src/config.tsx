import React from 'react';
import { gql } from '@apollo/client';
import type { ColumnDefinition, RowAction, BulkAction } from '@modular-platform/shared-components';
import { StatusBadge, PriorityIndicator, DueDateCell, FileInfoCell } from './CustomComponents';

/**
 * File Requests Tab Configuration
 *
 * This file demonstrates Level 2 integration with custom extensions:
 * - Mix of custom renderers and built-in formatters
 * - Programmatic UI overrides for specific columns
 * - Custom action handlers with complex logic
 */

/**
 * GraphQL query for file requests
 */
export const GET_FILE_REQUESTS_QUERY = gql`
  query GetFileRequests($filters: FileRequestFilters) {
    fileRequests(filters: $filters) {
      id
      fileName
      requestedBy {
        id
        name
        email
      }
      requestedFrom {
        id
        name
        email
      }
      requestedAt
      dueDate
      status
      priority
      message
      fileSize
      fileType
      uploadedAt
    }
  }
`;

/**
 * Column definitions for File Requests table
 * Demonstrates mixing custom renderers with built-in formatters
 */
export const FILE_REQUEST_COLUMNS: ColumnDefinition[] = [
  {
    field: 'fileName',
    label: 'File',
    sortable: true,
    width: 300,
    // Custom renderer - shows file icon and size
    render: (value, row: any) => (
      <FileInfoCell
        fileName={value}
        fileType={row.fileType}
        fileSize={row.fileSize}
      />
    ),
  },
  {
    field: 'status',
    label: 'Status',
    sortable: true,
    width: 140,
    align: 'center',
    // Custom renderer - color-coded status badge
    render: (value: string) => <StatusBadge status={value} />,
  },
  {
    field: 'priority',
    label: 'Priority',
    sortable: true,
    width: 130,
    align: 'center',
    // Custom renderer - priority indicator with icon
    render: (value: string) => <PriorityIndicator priority={value} />,
  },
  {
    field: 'requestedBy.name',
    label: 'Requested By',
    sortable: true,
    width: 180,
    // No custom renderer - uses default
  },
  {
    field: 'requestedFrom.name',
    label: 'Requested From',
    sortable: true,
    width: 180,
    // No custom renderer - uses default
  },
  {
    field: 'requestedAt',
    label: 'Requested',
    sortable: true,
    width: 180,
    // Built-in formatter - datetime
    formatter: 'datetime',
  },
  {
    field: 'dueDate',
    label: 'Due Date',
    sortable: true,
    width: 200,
    // Custom renderer - shows urgency with color coding
    render: (value: string, row: any) => (
      <DueDateCell dueDate={value} status={row.status} />
    ),
  },
  {
    field: 'message',
    label: 'Message',
    sortable: false,
    width: 250,
    // Custom renderer - truncates long messages
    render: (value: string | null) => {
      if (!value) return <span style={{ color: '#999' }}>-</span>;
      const maxLength = 50;
      if (value.length <= maxLength) return <span>{value}</span>;
      return (
        <span title={value}>
          {value.substring(0, maxLength)}...
        </span>
      );
    },
  },
];

/**
 * Row actions for File Request items
 * Demonstrates custom action handlers with complex logic
 */
export const FILE_REQUEST_ACTIONS: RowAction[] = [
  {
    id: 'approve',
    label: 'Approve',
    icon: '✅',
    variant: 'primary',
    onClick: async (request: any) => {
      console.log('Approve request:', request);
      // TODO: Implement approve mutation
      alert(`Approved request for ${request.fileName}`);
    },
    isVisible: (request: any) => {
      return request.status === 'pending';
    },
  },
  {
    id: 'reject',
    label: 'Reject',
    icon: '❌',
    variant: 'danger',
    onClick: async (request: any) => {
      const reason = prompt('Please provide a rejection reason:');
      if (!reason) return;

      console.log('Reject request:', request, reason);
      // TODO: Implement reject mutation
      alert(`Rejected request for ${request.fileName}`);
    },
    isVisible: (request: any) => {
      return request.status === 'pending';
    },
    confirm: (request: any) =>
      `Are you sure you want to reject the request for ${request.fileName}?`,
  },
  {
    id: 'upload',
    label: 'Upload File',
    icon: '⬆️',
    onClick: async (request: any) => {
      console.log('Upload file for request:', request);
      // TODO: Implement file upload
      alert(`Opening file upload for ${request.fileName}`);
    },
    isVisible: (request: any) => {
      return request.status === 'approved' || request.status === 'in_progress';
    },
  },
  {
    id: 'download',
    label: 'Download',
    icon: '⬇️',
    onClick: async (request: any) => {
      console.log('Download file:', request);
      // TODO: Implement file download
      alert(`Downloading ${request.fileName}`);
    },
    isVisible: (request: any) => {
      return request.status === 'completed' && request.fileSize;
    },
  },
  {
    id: 'view-details',
    label: 'View Details',
    icon: '👁️',
    variant: 'secondary',
    onClick: async (request: any) => {
      console.log('View details:', request);
      const details = [
        `File: ${request.fileName}`,
        `Status: ${request.status}`,
        `Priority: ${request.priority}`,
        `Requested by: ${request.requestedBy.name}`,
        `Requested from: ${request.requestedFrom.name}`,
        `Message: ${request.message || 'No message'}`,
        `Requested at: ${new Date(request.requestedAt).toLocaleString()}`,
        `Due date: ${new Date(request.dueDate).toLocaleString()}`,
        request.uploadedAt ? `Uploaded at: ${new Date(request.uploadedAt).toLocaleString()}` : '',
      ].filter(Boolean).join('\n');

      alert(details);
    },
  },
  {
    id: 'remind',
    label: 'Send Reminder',
    icon: '🔔',
    onClick: async (request: any) => {
      console.log('Send reminder:', request);
      alert(`Sending reminder to ${request.requestedFrom.name} for ${request.fileName}`);
    },
    isVisible: (request: any) => {
      return (request.status === 'pending' || request.status === 'approved') &&
             new Date(request.dueDate) < new Date();
    },
  },
];

/**
 * Bulk actions for File Request items
 */
export const FILE_REQUEST_BULK_ACTIONS: BulkAction[] = [
  {
    id: 'approve-all',
    label: 'Approve Selected',
    icon: '✅',
    variant: 'primary',
    onClick: async (requests: any[]) => {
      console.log('Approve requests:', requests);
      alert(`Approving ${requests.length} requests`);
    },
    isVisible: (requests: any[]) => {
      return requests.every(r => r.status === 'pending');
    },
  },
  {
    id: 'reject-all',
    label: 'Reject Selected',
    icon: '❌',
    variant: 'danger',
    onClick: async (requests: any[]) => {
      const reason = prompt('Please provide a rejection reason:');
      if (!reason) return;

      console.log('Reject requests:', requests, reason);
      alert(`Rejecting ${requests.length} requests`);
    },
    isVisible: (requests: any[]) => {
      return requests.every(r => r.status === 'pending');
    },
    confirm: (requests: any[]) =>
      `Are you sure you want to reject ${requests.length} file requests?`,
  },
  {
    id: 'send-reminders',
    label: 'Send Reminders',
    icon: '🔔',
    variant: 'secondary',
    onClick: async (requests: any[]) => {
      console.log('Send reminders:', requests);
      alert(`Sending reminders for ${requests.length} requests`);
    },
    isVisible: (requests: any[]) => {
      return requests.some(r =>
        (r.status === 'pending' || r.status === 'approved') &&
        new Date(r.dueDate) < new Date()
      );
    },
  },
  {
    id: 'export',
    label: 'Export to CSV',
    icon: '📥',
    onClick: async (requests: any[]) => {
      console.log('Export requests:', requests);
      alert(`Exporting ${requests.length} requests to CSV`);
    },
  },
];
