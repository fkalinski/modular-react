import React, { Suspense, lazy, useState, useEffect } from 'react';
import type { TabPlugin, TabProps, ContentItem } from '@tab-contract';

// Lazy load shared components
const Tree = lazy(() => import('shared_components/Tree').then(m => ({ default: m.Tree })));
const Table = lazy(() => import('shared_components/Table').then(m => ({ default: m.Table })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const Layout = lazy(() => import('shared_components/Layout').then(m => ({ default: m.Layout })));

// Mock data for demonstration
const mockFolderTree = [
  {
    id: 'root',
    label: 'My Documents',
    icon: '📁',
    children: [
      {
        id: 'work',
        label: 'Work',
        icon: '📁',
        children: [
          { id: 'work-1', label: 'Projects', icon: '📁' },
          { id: 'work-2', label: 'Reports', icon: '📁' },
        ],
      },
      {
        id: 'personal',
        label: 'Personal',
        icon: '📁',
        children: [
          { id: 'personal-1', label: 'Photos', icon: '📁' },
          { id: 'personal-2', label: 'Documents', icon: '📁' },
        ],
      },
    ],
  },
];

const mockFiles: ContentItem[] = [
  { id: 'f1', name: 'Project Proposal.docx', type: 'file', size: '2.5 MB', createdAt: '2024-01-15', updatedAt: '2024-01-15', mimeType: 'application/docx' },
  { id: 'f2', name: 'Budget 2024.xlsx', type: 'file', size: '1.2 MB', createdAt: '2024-01-14', updatedAt: '2024-01-16', mimeType: 'application/xlsx' },
  { id: 'f3', name: 'Meeting Notes.txt', type: 'file', size: '45 KB', createdAt: '2024-01-13', updatedAt: '2024-01-17', mimeType: 'text/plain' },
  { id: 'f4', name: 'Presentation.pptx', type: 'file', size: '8.3 MB', createdAt: '2024-01-12', updatedAt: '2024-01-18', mimeType: 'application/pptx' },
];

// Tab component implementation
const FilesTabComponent: React.FC<TabProps> = ({ context, onNavigate, onSelect }) => {
  const [selectedFolder, setSelectedFolder] = useState<string>();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<ContentItem[]>(mockFiles);

  // React to context changes (filters)
  useEffect(() => {
    if (context.filters.searchText) {
      const filtered = mockFiles.filter(f =>
        f.name.toLowerCase().includes(context.filters.searchText.toLowerCase())
      );
      setFiles(filtered);
    } else {
      setFiles(mockFiles);
    }
  }, [context.filters.searchText]);

  const handleFolderSelect = (node: any) => {
    setSelectedFolder(node.id);
    onNavigate(node.id);
  };

  const handleFileClick = (file: ContentItem) => {
    const newSelection = selectedFiles.includes(file.id)
      ? selectedFiles.filter(id => id !== file.id)
      : [...selectedFiles, file.id];

    setSelectedFiles(newSelection);
    onSelect(newSelection);
  };

  const containerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '20px',
    minHeight: '400px',
  };

  const panelStyles: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  return (
    <Suspense fallback={<div>Loading Files...</div>}>
      <div style={containerStyles}>
        {/* Folder Tree */}
        <div style={panelStyles}>
          <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
            Folders
          </h4>
          <Tree
            nodes={mockFolderTree}
            onNodeClick={handleFolderSelect}
            selectedId={selectedFolder}
          />
        </div>

        {/* Files List */}
        <div style={panelStyles}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>
              Files {context.filters.searchText && `(filtered: "${context.filters.searchText}")`}
            </h4>
            <Suspense>
              <Layout direction="row" gap="8px" padding="0">
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => alert('Upload file')}
                >
                  Upload
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => alert(`Download ${selectedFiles.length} files`)}
                  disabled={selectedFiles.length === 0}
                >
                  Download ({selectedFiles.length})
                </Button>
              </Layout>
            </Suspense>
          </div>

          <Table
            columns={[
              { key: 'name', header: 'Name', width: '40%' },
              { key: 'size', header: 'Size', width: '15%' },
              { key: 'mimeType', header: 'Type', width: '20%' },
              { key: 'updatedAt', header: 'Modified', width: '25%' },
            ]}
            data={files}
            onRowClick={handleFileClick}
            selectedIds={selectedFiles}
          />

          <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
            Showing {files.length} files | Selected: {selectedFiles.length} |
            Filter active: {context.filters.active.length > 0 ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

// Plugin export
const FilesTabPlugin: TabPlugin = {
  config: {
    id: 'files',
    name: 'Files & Folders',
    icon: '📁',
    version: '1.0.0',
    componentVersion: '^1.0.0', // Compatible with shared-components v1.x
    description: 'Browse and manage files and folders',
  },

  component: FilesTabComponent,

  // Could inject a reducer here
  // reducerKey: 'files',
  // reducer: filesReducer,

  // Could provide a data source
  // dataSource: new FilesDataSource(),

  // Actions this tab provides
  actions: [
    {
      id: 'upload',
      label: 'Upload File',
      icon: '⬆️',
      handler: async () => {
        console.log('Upload file action');
      },
    },
    {
      id: 'download',
      label: 'Download',
      icon: '⬇️',
      handler: async (context) => {
        console.log('Download files:', context.selection.selectedIds);
      },
      disabled: (context) => context.selection.selectedIds.length === 0,
    },
  ],

  onActivate: () => {
    console.log('[FilesTab] Tab activated');
  },

  onDeactivate: () => {
    console.log('[FilesTab] Tab deactivated');
  },

  contextRequirements: ['filters', 'selection'],
};

export default FilesTabPlugin;
