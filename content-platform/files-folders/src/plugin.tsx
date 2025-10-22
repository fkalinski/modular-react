import React, { Suspense, lazy, useState, useEffect } from 'react';
import type { TabPlugin, TabProps, ContentItem } from './types';

// Lazy load shared components
const Tree = lazy(() => import('shared_components/Tree').then(m => ({ default: m.Tree })));
const Table = lazy(() => import('shared_components/Table').then(m => ({ default: m.Table })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const FileIcon = lazy(() => import('shared_components/FileIcon').then(m => ({ default: m.FileIcon, getFileTypeFromName: m.getFileTypeFromName })));
const ContentPicker = lazy(() => import('shared_components/ContentPicker').then(m => ({ default: m.ContentPicker })));
const NavigationLink = lazy(() => import('shared_components/NavigationService').then(m => ({ default: m.NavigationLink })));
const Breadcrumbs = lazy(() => import('shared_components/Breadcrumbs').then(m => ({ default: m.Breadcrumbs })));

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
  const [selectedFolder, setSelectedFolder] = useState<string>('root');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [files, setFiles] = useState<ContentItem[]>(mockFiles);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState([
    { id: 'content', label: 'Content', icon: '📁' },
    { id: 'files', label: 'Files & Folders', icon: '📂' },
    { id: 'root', label: 'My Documents', icon: '📁' },
  ]);

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

    // Update breadcrumbs based on selected folder
    if (node.id === 'root') {
      setBreadcrumbPath([
        { id: 'content', label: 'Content', icon: '📁' },
        { id: 'files', label: 'Files & Folders', icon: '📂' },
        { id: 'root', label: 'My Documents', icon: '📁' },
      ]);
    } else if (node.id === 'work') {
      setBreadcrumbPath([
        { id: 'content', label: 'Content', icon: '📁' },
        { id: 'files', label: 'Files & Folders', icon: '📂' },
        { id: 'root', label: 'My Documents', icon: '📁' },
        { id: 'work', label: 'Work', icon: '📁' },
      ]);
    } else if (node.id === 'personal') {
      setBreadcrumbPath([
        { id: 'content', label: 'Content', icon: '📁' },
        { id: 'files', label: 'Files & Folders', icon: '📂' },
        { id: 'root', label: 'My Documents', icon: '📁' },
        { id: 'personal', label: 'Personal', icon: '📁' },
      ]);
    }
  };

  const handleFileClick = (file: ContentItem) => {
    const newSelection = selectedFiles.includes(file.id)
      ? selectedFiles.filter(id => id !== file.id)
      : [...selectedFiles, file.id];

    setSelectedFiles(newSelection);
    onSelect(newSelection);
  };

  // Box design system - Two-column layout
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    height: '100%',
    backgroundColor: '#f7f7f8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const leftPanelStyles: React.CSSProperties = {
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e2e2',
    overflow: 'auto',
    padding: '16px',
  };

  const rightPanelStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  };

  const toolbarStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderBottom: '1px solid #e2e2e2',
  };

  const toolbarLeftStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const toolbarRightStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  const iconButtonStyles: React.CSSProperties = {
    background: 'none',
    border: '1px solid #d3d3d3',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#222222',
  };

  const tableContainerStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '0 20px',
  };

  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading Files...</div>}>
      {/* Breadcrumbs */}
      <Suspense fallback={null}>
        <Breadcrumbs
          items={breadcrumbPath}
          onItemClick={(item) => {
            if (item.id === 'files') {
              setBreadcrumbPath([
                { id: 'content', label: 'Content', icon: '📁' },
                { id: 'files', label: 'Files & Folders', icon: '📂' },
                { id: 'root', label: 'My Documents', icon: '📁' },
              ]);
              setSelectedFolder('root');
            }
          }}
        />
      </Suspense>

      <div style={containerStyles}>
        {/* Left Panel - Folder Tree */}
        <div style={leftPanelStyles}>
          <Tree
            nodes={mockFolderTree}
            onNodeClick={handleFolderSelect}
            selectedId={selectedFolder}
          />
        </div>

        {/* Right Panel - Files Table */}
        <div style={rightPanelStyles}>
          {/* Toolbar */}
          <div style={toolbarStyles}>
            <div style={toolbarLeftStyles}>
              <span style={{ fontSize: '13px', color: '#222222', fontWeight: 500 }}>
                {files.length} items
              </span>
              {selectedFiles.length > 0 && (
                <span style={{ fontSize: '12px', color: '#767676' }}>
                  • {selectedFiles.length} selected
                </span>
              )}
            </div>

            <div style={toolbarRightStyles}>
              <Suspense fallback={null}>
                <button style={iconButtonStyles}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Grid
                </button>
                <button style={iconButtonStyles}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  List
                </button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setIsPickerOpen(true)}
                  disabled={selectedFiles.length === 0}
                >
                  Move To...
                </Button>
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => alert('Upload file')}
                >
                  Upload
                </Button>
              </Suspense>
            </div>
          </div>

          {/* Files Table */}
          <div style={tableContainerStyles}>
            <Table
              columns={[
                {
                  key: 'name',
                  header: 'Name',
                  width: '45%',
                  render: (file: ContentItem) => {
                    const FileIconComponent = FileIcon as any;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Suspense fallback={<span>📄</span>}>
                          <FileIconComponent type="file" size={20} />
                        </Suspense>
                        <span>{file.name}</span>
                      </div>
                    );
                  },
                },
                { key: 'size', header: 'Size', width: '15%' },
                { key: 'mimeType', header: 'Type', width: '20%' },
                { key: 'updatedAt', header: 'Modified', width: '20%' },
              ]}
              data={files}
              selectedIds={selectedFiles}
              onSelectionChange={setSelectedFiles}
              showCheckboxes={true}
              showActions={true}
              onActionClick={(file) => alert(`Actions for ${file.name}`)}
            />
          </div>
        </div>
      </div>

      {/* Content Picker Dialog - Demo of shared reusable component */}
      <Suspense fallback={null}>
        <ContentPicker
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={(location: any) => {
            console.log('Moving files to:', location);
            alert(`Moving ${selectedFiles.length} file(s) to: ${location.name}`);
            setIsPickerOpen(false);
          }}
          title="Choose Destination"
          locations={mockFolderTree.map((node: any) => ({
            id: node.id,
            name: node.label,
            type: 'folder' as const,
            icon: node.icon,
            children: node.children?.map((child: any) => ({
              id: child.id,
              name: child.label,
              type: 'folder' as const,
              icon: child.icon,
              children: child.children?.map((grandchild: any) => ({
                id: grandchild.id,
                name: grandchild.label,
                type: 'folder' as const,
                icon: grandchild.icon,
              })),
            })),
          }))}
          multiSelect={false}
          searchable={true}
          confirmLabel="Move Here"
        />
      </Suspense>

      {/* Navigation Link Demo - Cross-section navigation */}
      {selectedFiles.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '12px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '12px',
          color: '#767676',
        }}>
          <div style={{ marginBottom: '8px' }}>
            {selectedFiles.length} file(s) selected
          </div>
          <Suspense fallback={null}>
            <NavigationLink to="reports" style={{ fontSize: '12px' }}>
              Generate Report →
            </NavigationLink>
          </Suspense>
        </div>
      )}
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

  // Search support - count matching files
  getSearchHitCount: (searchText: string) => {
    if (!searchText || searchText.trim() === '') {
      return mockFiles.length; // Return total when no search
    }

    const lowerSearch = searchText.toLowerCase();
    return mockFiles.filter(file =>
      file.name.toLowerCase().includes(lowerSearch) ||
      file.mimeType?.toLowerCase().includes(lowerSearch)
    ).length;
  },

  contextRequirements: ['filters', 'selection'],
};

export default FilesTabPlugin;
