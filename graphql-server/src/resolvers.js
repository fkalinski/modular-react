import {
  users,
  files,
  folders,
  hubs,
  reports,
  formSubmissions,
  archives,
  searchContent,
} from './mockData.js';

export const resolvers = {
  // Interface resolver for ContentItem
  ContentItem: {
    __resolveType(obj) {
      if (obj.archiveDate !== undefined) {
        return 'Archive';
      }
      if (obj.size !== undefined) {
        return 'File';
      }
      if (obj.itemCount !== undefined) {
        return 'Folder';
      }
      return null;
    },
  },

  // Query resolvers
  Query: {
    // User queries
    user: (_, { id }) => users.find(u => u.id === id),
    users: () => users,

    // File queries
    files: (_, { parentId, filters }) => {
      let result = files;

      if (parentId) {
        result = result.filter(f => f.parentId === parentId);
      }

      if (filters?.ownerId) {
        result = result.filter(f => f.ownerId === filters.ownerId);
      }

      if (filters?.type) {
        result = result.filter(f => f.mimeType.includes(filters.type));
      }

      return result;
    },
    file: (_, { id }) => files.find(f => f.id === id),

    // Folder queries
    folders: (_, { parentId, filters }) => {
      let result = folders;

      if (parentId) {
        result = result.filter(f => f.parentId === parentId);
      }

      if (filters?.ownerId) {
        result = result.filter(f => f.ownerId === filters.ownerId);
      }

      return result;
    },
    folder: (_, { id }) => folders.find(f => f.id === id),

    // Content items (files + folders)
    contentItems: (_, { parentId, filters }) => {
      let allItems = [...files, ...folders];

      if (parentId) {
        allItems = allItems.filter(item => item.parentId === parentId);
      }

      if (filters?.ownerId) {
        allItems = allItems.filter(item => item.ownerId === filters.ownerId);
      }

      return allItems.sort((a, b) => {
        // Folders first, then files
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    },

    // Hub queries
    hubs: (_, { filters }) => {
      let result = hubs;

      if (filters?.category) {
        result = result.filter(h => h.category === filters.category);
      }

      if (filters?.isActive !== undefined) {
        result = result.filter(h => h.isActive === filters.isActive);
      }

      return result;
    },
    hub: (_, { id }) => hubs.find(h => h.id === id),

    // Archive queries
    archives: (_, { filters }) => {
      let result = archives;

      if (filters?.compressionType) {
        result = result.filter(a => a.compressionType === filters.compressionType);
      }

      if (filters?.archivedById) {
        result = result.filter(a => a.archivedById === filters.archivedById);
      }

      if (filters?.fromDate) {
        result = result.filter(a => new Date(a.archiveDate) >= new Date(filters.fromDate));
      }

      if (filters?.toDate) {
        result = result.filter(a => new Date(a.archiveDate) <= new Date(filters.toDate));
      }

      return result.sort((a, b) => new Date(b.archiveDate) - new Date(a.archiveDate));
    },
    archive: (_, { id }) => archives.find(a => a.id === id),

    // Report queries
    reports: () => reports,
    report: (_, { id }) => reports.find(r => r.id === id),

    // Form submission queries
    formSubmissions: () => formSubmissions,
    formSubmission: (_, { id }) => formSubmissions.find(f => f.id === id),

    // Search
    search: (_, { query, filters }) => searchContent(query, filters),
  },

  // Field resolvers
  File: {
    owner: (file) => users.find(u => u.id === file.ownerId),
  },

  Folder: {
    owner: (folder) => users.find(u => u.id === folder.ownerId),
    children: (folder) => {
      const childFiles = files.filter(f => f.parentId === folder.id);
      const childFolders = folders.filter(f => f.parentId === folder.id);
      return [...childFolders, ...childFiles].sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    },
  },

  Hub: {
    // All fields are primitive, no resolver needed
  },

  Report: {
    generatedBy: (report) => users.find(u => u.id === report.generatedBy),
  },

  FormSubmission: {
    submittedBy: (submission) => users.find(u => u.id === submission.submittedBy),
  },

  Archive: {
    owner: (archive) => users.find(u => u.id === archive.ownerId),
    archivedBy: (archive) => users.find(u => u.id === archive.archivedById),
  },

  // Mutation resolvers
  Mutation: {
    createFolder: (_, { name, parentId }) => {
      const newFolder = {
        id: `folder-${folders.length + 1}`,
        name,
        type: 'folder',
        path: parentId
          ? `${folders.find(f => f.id === parentId)?.path}/${name}`
          : `/${name}`,
        parentId: parentId || null,
        ownerId: '1', // Default to first user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemCount: 0,
      };

      folders.push(newFolder);
      return newFolder;
    },

    renameFile: (_, { id, name }) => {
      const file = files.find(f => f.id === id);
      if (!file) throw new Error('File not found');

      file.name = name;
      file.updatedAt = new Date().toISOString();
      return file;
    },

    deleteFile: (_, { id }) => {
      const index = files.findIndex(f => f.id === id);
      if (index === -1) return false;

      files.splice(index, 1);
      return true;
    },

    createHub: (_, { name, description, category }) => {
      const newHub = {
        id: `hub-${hubs.length + 1}`,
        name,
        description,
        memberCount: 0,
        category,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      hubs.push(newHub);
      return newHub;
    },

    updateHub: (_, { id, name, description }) => {
      const hub = hubs.find(h => h.id === id);
      if (!hub) throw new Error('Hub not found');

      if (name) hub.name = name;
      if (description) hub.description = description;
      hub.updatedAt = new Date().toISOString();

      return hub;
    },

    generateReport: (_, { name, type }) => {
      const newReport = {
        id: `report-${reports.length + 1}`,
        name,
        type,
        status: 'In Progress',
        generatedBy: '1', // Default to first user
        createdAt: new Date().toISOString(),
        scheduleType: 'Manual',
      };

      reports.push(newReport);
      return newReport;
    },

    restoreArchive: (_, { id, targetPath }) => {
      const archive = archives.find(a => a.id === id);
      if (!archive) throw new Error('Archive not found');

      // Create a new file from the restored archive
      const restoredFile = {
        id: `file-${files.length + 1}`,
        name: archive.name,
        type: 'file',
        path: targetPath || archive.originalLocation,
        parentId: null,
        ownerId: archive.ownerId,
        size: archive.originalSize,
        mimeType: 'application/zip', // Simplified
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      files.push(restoredFile);

      // Remove from archives
      const index = archives.findIndex(a => a.id === id);
      archives.splice(index, 1);

      return restoredFile;
    },

    deleteArchive: (_, { id }) => {
      const index = archives.findIndex(a => a.id === id);
      if (index === -1) return false;

      archives.splice(index, 1);
      return true;
    },
  },
};
