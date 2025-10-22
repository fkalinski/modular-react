import {
  users,
  files,
  folders,
  hubs,
  reports,
  formSubmissions,
  searchContent,
} from './mockData.js';

export const resolvers = {
  // Interface resolver for ContentItem
  ContentItem: {
    __resolveType(obj) {
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
  },
};
