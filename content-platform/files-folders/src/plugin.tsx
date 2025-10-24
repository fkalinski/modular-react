import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { TabPlugin, TabProps, ContentItem } from '@tab-contract';

// Import Redux action for clearing search
const setSearchTextModule = import('shared_data/store');

// Lazy load shared components
const Tree = lazy(() => import('shared_components/Tree').then(m => ({ default: m.Tree })));
const Table = lazy(() => import('shared_components/Table').then(m => ({ default: m.Table })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const FileIcon = lazy(() => import('shared_components/FileIcon').then(m => ({ default: m.FileIcon, getFileTypeFromName: m.getFileTypeFromName })));
const ContentPicker = lazy(() => import('shared_components/ContentPicker').then(m => ({ default: m.ContentPicker })));
const Breadcrumbs = lazy(() => import('shared_components/Breadcrumbs').then(m => ({ default: m.Breadcrumbs })));
const Preview = lazy(() => import('shared_components/Preview').then(m => ({ default: m.Preview })));
const HighlightText = lazy(() => import('shared_components/HighlightText').then(m => ({ default: m.HighlightText })));

// Import navigation service components/hooks
const NavigationLink = lazy(() => import('shared_components/NavigationService').then(m => ({ default: m.NavigationLink })));
const NavigationServiceModule = import('shared_components/NavigationService');

// Mock data for demonstration
const mockFolderTree = [
  {
    id: 'user-john',
    label: 'John Doe',
    icon: '👤',
    children: [
      {
        id: 'john-work',
        label: 'Work',
        icon: '📁',
        children: [
          { id: 'john-work-projects', label: 'Projects', icon: '📁' },
          { id: 'john-work-reports', label: 'Reports', icon: '📁' },
        ],
      },
      {
        id: 'john-personal',
        label: 'Personal',
        icon: '📁',
        children: [
          { id: 'john-personal-photos', label: 'Photos', icon: '📁' },
          { id: 'john-personal-docs', label: 'Documents', icon: '📁' },
        ],
      },
    ],
  },
  {
    id: 'user-jane',
    label: 'Jane Smith',
    icon: '👤',
    children: [
      {
        id: 'jane-projects',
        label: 'Projects',
        icon: '📁',
        children: [
          { id: 'jane-projects-2024', label: '2024', icon: '📁' },
          { id: 'jane-projects-archive', label: 'Archive', icon: '📁' },
        ],
      },
      {
        id: 'jane-documents',
        label: 'Documents',
        icon: '📁',
      },
    ],
  },
  {
    id: 'user-bob',
    label: 'Bob Johnson',
    icon: '👤',
    children: [
      {
        id: 'bob-shared',
        label: 'Shared',
        icon: '📁',
      },
    ],
  },
];

const mockFiles: ContentItem[] = [
  { id: 'f1', name: 'Project Proposal.docx', type: 'file', size: '2.5 MB', ownerId: 'user-john', owner: 'John Doe', folderId: 'john-work-projects', path: 'user-john/john-work/john-work-projects', createdAt: '2024-01-15', updatedAt: '2024-01-15', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { id: 'f2', name: 'Budget 2024.xlsx', type: 'file', size: '1.2 MB', ownerId: 'user-jane', owner: 'Jane Smith', folderId: 'jane-projects-2024', path: 'user-jane/jane-projects/jane-projects-2024', createdAt: '2024-01-14', updatedAt: '2024-01-16', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { id: 'f3', name: 'Meeting Notes.txt', type: 'file', size: '45 KB', ownerId: 'user-john', owner: 'John Doe', folderId: 'john-work-reports', path: 'user-john/john-work/john-work-reports', createdAt: '2024-01-13', updatedAt: '2024-01-17', mimeType: 'text/plain' },
  { id: 'f4', name: 'Presentation.pptx', type: 'file', size: '8.3 MB', ownerId: 'user-bob', owner: 'Bob Johnson', folderId: 'bob-shared', path: 'user-bob/bob-shared', createdAt: '2024-01-12', updatedAt: '2024-01-18', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { id: 'f5', name: 'Design Specs.pdf', type: 'file', size: '3.1 MB', ownerId: 'user-jane', owner: 'Jane Smith', folderId: 'jane-documents', path: 'user-jane/jane-documents', createdAt: '2024-01-11', updatedAt: '2024-01-15', mimeType: 'application/pdf' },
  { id: 'f6', name: 'Team Photo.jpg', type: 'file', size: '2.8 MB', ownerId: 'user-bob', owner: 'Bob Johnson', folderId: 'bob-shared', path: 'user-bob/bob-shared', createdAt: '2024-01-10', updatedAt: '2024-01-10', mimeType: 'image/jpeg' },
  { id: 'f7', name: 'Q1 Report.pdf', type: 'file', size: '1.5 MB', ownerId: 'user-john', owner: 'John Doe', folderId: 'john-personal-docs', path: 'user-john/john-personal/john-personal-docs', createdAt: '2024-01-09', updatedAt: '2024-01-16', mimeType: 'application/pdf' },
  { id: 'f8', name: 'Vacation.jpg', type: 'file', size: '4.2 MB', ownerId: 'user-john', owner: 'John Doe', folderId: 'john-personal-photos', path: 'user-john/john-personal/john-personal-photos', createdAt: '2024-01-08', updatedAt: '2024-01-08', mimeType: 'image/jpeg' },
];

// Tab component implementation
const FilesTabComponent: React.FC<TabProps> = ({ context, onNavigate, onSelect }) => {
  const dispatch = useDispatch();
  const [selectedFolder, setSelectedFolder] = useState<string>('user-john');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | undefined>(undefined);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [files, setFiles] = useState<ContentItem[]>(mockFiles);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState([
    { id: 'content', label: 'Content', icon: '📁' },
    { id: 'files', label: 'Files & Folders', icon: '📂' },
    { id: 'user-john', label: 'John Doe', icon: '👤' },
  ]);

  // Track if in search mode
  const isSearchMode = Boolean(context.filters.searchText && context.filters.searchText.trim());

  // Helper function to get files for a folder (including children)
  const getFilesForFolder = (folderId: string): ContentItem[] => {
    return mockFiles.filter(file => {
      // Match exact folder or any parent folder in the path
      return file.folderId === folderId || file.path?.startsWith(folderId.replace(/-/g, '/'));
    });
  };

  // React to context changes (filters)
  useEffect(() => {
    if (context.filters.searchText) {
      // Search mode: show all matching files across all folders
      const filtered = mockFiles.filter(f =>
        f.name.toLowerCase().includes(context.filters.searchText.toLowerCase())
      );
      setFiles(filtered);
    } else {
      // Normal mode: show files for selected folder
      const folderFiles = getFilesForFolder(selectedFolder);
      setFiles(folderFiles);
    }
  }, [context.filters.searchText, selectedFolder]);

  // Helper function to build full breadcrumb path by traversing tree
  const buildBreadcrumbPath = (nodeId: string, tree: any[]): Array<{id: string, label: string, icon: string}> => {
    const basePath = [
      { id: 'content', label: 'Content', icon: '📁' },
      { id: 'files', label: 'Files & Folders', icon: '📂' },
    ];

    // Recursive function to find node and build path
    const findNodePath = (nodes: any[], targetId: string, currentPath: any[] = []): any[] | null => {
      for (const node of nodes) {
        const newPath = [...currentPath, { id: node.id, label: node.label, icon: node.icon }];

        if (node.id === targetId) {
          return newPath;
        }

        if (node.children) {
          const found = findNodePath(node.children, targetId, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    const nodePath = findNodePath(tree, nodeId);
    return nodePath ? [...basePath, ...nodePath] : basePath;
  };

  // Helper function to get breadcrumb data for a file based on its path
  const getFileBreadcrumbPath = (file: ContentItem): Array<{id: string, label: string, icon: string}> => {
    if (!file.path) return [];

    const pathSegments = file.path.split('/');
    const breadcrumbs: Array<{id: string, label: string, icon: string}> = [];

    // Build breadcrumbs by looking up each segment in the tree
    const findNodeById = (nodes: any[], id: string): any => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNodeById(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    pathSegments.forEach((segmentId: string) => {
      const node = findNodeById(mockFolderTree, segmentId);
      if (node) {
        breadcrumbs.push({ id: node.id, label: node.label, icon: node.icon });
      }
    });

    return breadcrumbs;
  };

  // Handler for breadcrumb navigation - clears search and navigates to folder
  const handleBreadcrumbClick = async (folderId: string) => {
    try {
      // Clear search filter
      const { setSearchText } = await setSearchTextModule;
      dispatch(setSearchText(''));

      // Navigate to the folder
      setSelectedFolder(folderId);
      const newPath = buildBreadcrumbPath(folderId, mockFolderTree);
      setBreadcrumbPath(newPath);
      onNavigate(folderId);
    } catch (error) {
      console.error('Failed to clear search:', error);
    }
  };

  // Memoize locations to prevent unnecessary re-renders of ContentPicker
  const pickerLocations = useMemo(() => {
    return mockFolderTree.map((node: any) => ({
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
    }));
  }, []); // mockFolderTree is const, so empty deps array is safe

  const handleFolderSelect = (node: any) => {
    setSelectedFolder(node.id);
    onNavigate(node.id);

    // Build proper breadcrumb path using tree traversal
    const newBreadcrumbPath = buildBreadcrumbPath(node.id, mockFolderTree);
    setBreadcrumbPath(newBreadcrumbPath);

    // Files will be updated by useEffect watching selectedFolder
  };

  const handleFileClick = (file: ContentItem) => {
    // Set active row and open preview
    setActiveRowId(file.id);
    setPreviewItem(file);
    onSelect([file.id]);
  };

  const handleOwnerClick = async (ownerId: string) => {
    // Navigate to user page using navigation service
    try {
      const { useNavigation } = await NavigationServiceModule;
      // Since we can't use hooks dynamically, we'll emit a navigation event
      // In a real app with proper routing, this would navigate to /users/:id
      console.log('[Navigation] Navigating to user:', ownerId);

      // For demo, dispatch a custom event that the shell can listen to
      window.dispatchEvent(new CustomEvent('navigate', {
        detail: { target: 'user', params: { userId: ownerId } }
      }));

      // Also show feedback
      alert(`Navigation event dispatched for user: ${ownerId}\n\nIn production, this would navigate to the user profile tab.`);
    } catch (error) {
      console.error('Navigation service not available:', error);
      alert(`Navigating to user profile: ${ownerId}`);
    }
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
            // Skip navigation for base items (content, files)
            if (item.id === 'content' || item.id === 'files') {
              return;
            }

            // Navigate to the clicked folder and clear search if active
            handleBreadcrumbClick(item.id);
          }}
        />
      </Suspense>

      <div style={containerStyles}>
        {/* Left Panel - Folder Tree (hidden in search mode) */}
        {!isSearchMode && (
          <div style={leftPanelStyles}>
            <Tree
              nodes={mockFolderTree}
              onNodeClick={handleFolderSelect}
              selectedId={selectedFolder}
            />
          </div>
        )}

        {/* Right Panel - Files Table */}
        <div style={{...rightPanelStyles, marginLeft: isSearchMode ? 0 : undefined}}>
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
                  width: isSearchMode ? '35%' : '40%',
                  render: (file) => {
                    const item = file as ContentItem;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Suspense fallback={<span>📄</span>}>
                            <FileIcon type="file" size={20} />
                          </Suspense>
                          {isSearchMode && context.filters.searchText ? (
                            <Suspense fallback={<span>{item.name}</span>}>
                              <HighlightText text={item.name} highlight={context.filters.searchText} />
                            </Suspense>
                          ) : (
                            <span>{item.name}</span>
                          )}
                        </div>
                        {isSearchMode && item.path && (
                          <div style={{ fontSize: '11px', color: '#767676', paddingLeft: '28px' }}>
                            {getFileBreadcrumbPath(item).map((crumb, index, arr) => (
                              <React.Fragment key={crumb.id}>
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBreadcrumbClick(crumb.id);
                                  }}
                                  style={{
                                    color: '#0061d5',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none';
                                  }}
                                >
                                  {crumb.label}
                                </a>
                                {index < arr.length - 1 && <span> &gt; </span>}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: 'owner',
                  header: 'Owner',
                  width: '15%',
                  render: (file) => {
                    const item = file as ContentItem;
                    return item.owner ? (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOwnerClick(item.ownerId);
                        }}
                        style={{
                          color: '#0061d5',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >
                        {item.owner}
                      </a>
                    ) : null;
                  },
                },
                { key: 'size', header: 'Size', width: isSearchMode ? '12%' : '13%' },
                { key: 'mimeType', header: 'Type', width: isSearchMode ? '18%' : '17%' },
                { key: 'updatedAt', header: 'Modified', width: '15%' },
              ]}
              data={files}
              selectedIds={selectedFiles}
              onSelectionChange={setSelectedFiles}
              activeRowId={activeRowId}
              onActiveRowChange={setActiveRowId}
              onRowClick={(item) => handleFileClick(item as ContentItem)}
              showCheckboxes={true}
              showActions={true}
              onActionClick={(file) => alert(`Actions for ${(file as ContentItem).name}`)}
              enableKeyboardNav={true}
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
          locations={pickerLocations}
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

      {/* Preview Component */}
      <Suspense fallback={null}>
        <Preview
          isOpen={previewItem !== null}
          onClose={() => {
            setPreviewItem(null);
            setActiveRowId(undefined);
          }}
          item={previewItem}
          onNavigateToOwner={handleOwnerClick}
        />
      </Suspense>
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
