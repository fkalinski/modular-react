// Mock data for GraphQL server

// Users
export const users = [
  { id: '1', name: 'John Doe', email: 'john.doe@company.com', avatar: 'JD' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com', avatar: 'JS' },
  { id: '3', name: 'Bob Johnson', email: 'bob.johnson@company.com', avatar: 'BJ' },
  { id: '4', name: 'Alice Brown', email: 'alice.brown@company.com', avatar: 'AB' },
];

// Folders
export const folders = [
  {
    id: 'folder-1',
    name: 'My Documents',
    type: 'folder',
    path: '/My Documents',
    parentId: null,
    ownerId: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    itemCount: 5,
  },
  {
    id: 'folder-2',
    name: 'Projects',
    type: 'folder',
    path: '/My Documents/Projects',
    parentId: 'folder-1',
    ownerId: '1',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    itemCount: 3,
  },
  {
    id: 'folder-3',
    name: 'Shared',
    type: 'folder',
    path: '/Shared',
    parentId: null,
    ownerId: '2',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
    itemCount: 8,
  },
];

// Files
export const files = [
  {
    id: 'file-1',
    name: 'Proposal.docx',
    type: 'file',
    path: '/My Documents/Proposal.docx',
    parentId: 'folder-1',
    ownerId: '1',
    size: 245760,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'file-2',
    name: 'Budget.xlsx',
    type: 'file',
    path: '/My Documents/Budget.xlsx',
    parentId: 'folder-1',
    ownerId: '1',
    size: 102400,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-19T09:15:00Z',
  },
  {
    id: 'file-3',
    name: 'Presentation.pptx',
    type: 'file',
    path: '/My Documents/Presentation.pptx',
    parentId: 'folder-1',
    ownerId: '2',
    size: 512000,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    createdAt: '2024-01-17T13:20:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
  },
  {
    id: 'file-4',
    name: 'README.md',
    type: 'file',
    path: '/My Documents/Projects/README.md',
    parentId: 'folder-2',
    ownerId: '1',
    size: 4096,
    mimeType: 'text/markdown',
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: 'file-5',
    name: 'diagram.png',
    type: 'file',
    path: '/My Documents/Projects/diagram.png',
    parentId: 'folder-2',
    ownerId: '1',
    size: 153600,
    mimeType: 'image/png',
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z',
  },
];

// Hubs
export const hubs = [
  {
    id: 'hub-1',
    name: 'Engineering',
    description: 'Engineering team collaboration hub',
    memberCount: 24,
    category: 'Team',
    isActive: true,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-22T15:30:00Z',
  },
  {
    id: 'hub-2',
    name: 'Product Launch 2024',
    description: 'Product launch coordination and materials',
    memberCount: 15,
    category: 'Project',
    isActive: true,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-21T09:45:00Z',
  },
  {
    id: 'hub-3',
    name: 'Marketing',
    description: 'Marketing campaigns and resources',
    memberCount: 12,
    category: 'Team',
    isActive: true,
    createdAt: '2024-01-03T09:00:00Z',
    updatedAt: '2024-01-20T16:20:00Z',
  },
  {
    id: 'hub-4',
    name: 'Design System',
    description: 'UI/UX design system and guidelines',
    memberCount: 8,
    category: 'Resource',
    isActive: true,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-19T14:00:00Z',
  },
];

// Reports
export const reports = [
  {
    id: 'report-1',
    name: 'Q1 2024 Sales',
    type: 'Sales',
    status: 'Completed',
    generatedBy: '2',
    createdAt: '2024-01-15T09:00:00Z',
    scheduleType: 'Monthly',
  },
  {
    id: 'report-2',
    name: 'Weekly Activity Summary',
    type: 'Activity',
    status: 'Scheduled',
    generatedBy: '1',
    createdAt: '2024-01-20T10:00:00Z',
    scheduleType: 'Weekly',
  },
  {
    id: 'report-3',
    name: 'User Engagement Analytics',
    type: 'Analytics',
    status: 'In Progress',
    generatedBy: '3',
    createdAt: '2024-01-18T14:30:00Z',
    scheduleType: 'Daily',
  },
  {
    id: 'report-4',
    name: 'Content Performance',
    type: 'Performance',
    status: 'Completed',
    generatedBy: '2',
    createdAt: '2024-01-10T11:00:00Z',
    scheduleType: 'Monthly',
  },
  {
    id: 'report-5',
    name: 'Storage Usage Report',
    type: 'System',
    status: 'Completed',
    generatedBy: '1',
    createdAt: '2024-01-22T08:00:00Z',
    scheduleType: 'Weekly',
  },
];

// Form Submissions (Archives)
export const formSubmissions = [
  {
    id: 'form-1',
    formName: 'Customer Feedback',
    submittedBy: '1',
    submittedAt: '2024-01-20T14:30:00Z',
    status: 'Reviewed',
    responseCount: 12,
  },
  {
    id: 'form-2',
    formName: 'Employee Survey',
    submittedBy: '2',
    submittedAt: '2024-01-19T09:15:00Z',
    status: 'Pending',
    responseCount: 45,
  },
  {
    id: 'form-3',
    formName: 'Bug Report',
    submittedBy: '3',
    submittedAt: '2024-01-21T16:45:00Z',
    status: 'In Review',
    responseCount: 3,
  },
];

// Archives
export const archives = [
  {
    id: 'archive-1',
    name: 'Q4_2023_Reports.zip',
    type: 'archive',
    path: '/Archives/Q4_2023_Reports.zip',
    parentId: null,
    ownerId: '2',
    createdAt: '2023-12-31T23:59:00Z',
    updatedAt: '2023-12-31T23:59:00Z',
    archiveDate: '2023-12-31T23:59:00Z',
    archiveReason: 'End of quarter archival',
    originalLocation: '/Reports/2023/Q4',
    compressionType: 'ZIP',
    compressedSize: 15728640, // 15 MB
    originalSize: 52428800, // 50 MB
    archivedById: '2',
  },
  {
    id: 'archive-2',
    name: 'Old_Project_Files.tar.gz',
    type: 'archive',
    path: '/Archives/Old_Project_Files.tar.gz',
    parentId: null,
    ownerId: '1',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
    archiveDate: '2024-01-05T10:00:00Z',
    archiveReason: 'Project completed - archiving for reference',
    originalLocation: '/Projects/Legacy/OldProject',
    compressionType: 'GZIP',
    compressedSize: 104857600, // 100 MB
    originalSize: 524288000, // 500 MB
    archivedById: '1',
  },
  {
    id: 'archive-3',
    name: '2023_Marketing_Campaigns',
    type: 'archive',
    path: '/Archives/2023_Marketing_Campaigns',
    parentId: null,
    ownerId: '3',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    archiveDate: '2024-01-01T00:00:00Z',
    archiveReason: 'Annual archival - new year',
    originalLocation: '/Marketing/Campaigns/2023',
    compressionType: 'NONE',
    compressedSize: 209715200, // 200 MB (uncompressed)
    originalSize: 209715200, // 200 MB
    archivedById: '3',
  },
  {
    id: 'archive-4',
    name: 'Design_Assets_Archive.zip',
    type: 'archive',
    path: '/Archives/Design_Assets_Archive.zip',
    parentId: null,
    ownerId: '4',
    createdAt: '2024-01-10T15:30:00Z',
    updatedAt: '2024-01-10T15:30:00Z',
    archiveDate: '2024-01-10T15:30:00Z',
    archiveReason: 'Consolidating old design files',
    originalLocation: '/Design/Assets/Old',
    compressionType: 'ZIP',
    compressedSize: 314572800, // 300 MB
    originalSize: 1073741824, // 1 GB
    archivedById: '4',
  },
  {
    id: 'archive-5',
    name: 'Customer_Data_Backup_2023.tar',
    type: 'archive',
    path: '/Archives/Customer_Data_Backup_2023.tar',
    parentId: null,
    ownerId: '2',
    createdAt: '2023-12-28T18:00:00Z',
    updatedAt: '2023-12-28T18:00:00Z',
    archiveDate: '2023-12-28T18:00:00Z',
    archiveReason: 'Compliance - annual data backup',
    originalLocation: '/Data/Customers/2023',
    compressionType: 'TAR',
    compressedSize: 2147483648, // 2 GB
    originalSize: 2147483648, // 2 GB (TAR doesn't compress)
    archivedById: '2',
  },
  {
    id: 'archive-6',
    name: 'Training_Materials_2023.zip',
    type: 'archive',
    path: '/Archives/Training_Materials_2023.zip',
    parentId: null,
    ownerId: '1',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    archiveDate: '2024-01-15T12:00:00Z',
    archiveReason: 'Updated training materials available',
    originalLocation: '/HR/Training/2023',
    compressionType: 'ZIP',
    compressedSize: 52428800, // 50 MB
    originalSize: 157286400, // 150 MB
    archivedById: '1',
  },
];

// Search results aggregator
export const searchContent = (query, filters = {}) => {
  const lowerQuery = query.toLowerCase();

  const matchedFiles = files.filter(file =>
    file.name.toLowerCase().includes(lowerQuery)
  );

  const matchedFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(lowerQuery)
  );

  const matchedHubs = hubs.filter(hub =>
    hub.name.toLowerCase().includes(lowerQuery) ||
    hub.description.toLowerCase().includes(lowerQuery)
  );

  return {
    files: matchedFiles,
    folders: matchedFolders,
    hubs: matchedHubs,
    totalResults: matchedFiles.length + matchedFolders.length + matchedHubs.length,
  };
};
