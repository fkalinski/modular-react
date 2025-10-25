import {
  users,
  files,
  folders,
  hubs,
  reports,
  fileRequests,
  forms,
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

    // FileRequest queries
    fileRequests: (_, { filters }) => {
      let result = fileRequests;

      if (filters?.status) {
        result = result.filter(r => r.status === filters.status);
      }

      if (filters?.priority) {
        result = result.filter(r => r.priority === filters.priority);
      }

      if (filters?.requestedById) {
        result = result.filter(r => r.requestedById === filters.requestedById);
      }

      if (filters?.requestedFromId) {
        result = result.filter(r => r.requestedFromId === filters.requestedFromId);
      }

      return result.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    },
    fileRequest: (_, { id }) => fileRequests.find(r => r.id === id),

    // Form queries
    forms: (_, { filters }) => {
      let result = forms;

      if (filters?.status) {
        result = result.filter(f => f.status === filters.status);
      }

      if (filters?.category) {
        result = result.filter(f => f.category === filters.category);
      }

      if (filters?.createdById) {
        result = result.filter(f => f.createdById === filters.createdById);
      }

      return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    form: (_, { id }) => forms.find(f => f.id === id),

    // Form submission queries
    formSubmissions: (_, { formId }) => {
      let result = formSubmissions;

      if (formId) {
        result = result.filter(s => s.formId === formId);
      }

      return result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    },
    formSubmission: (_, { id }) => formSubmissions.find(s => s.id === id),

    // UI Configuration queries (for SDUI - Level 3)
    formsTableConfig: () => ({
      columns: [
        { field: 'title', label: 'Form Title', sortable: true, width: 250 },
        { field: 'category', label: 'Category', sortable: true, width: 150, align: 'center' },
        { field: 'status', label: 'Status', sortable: true, width: 120, align: 'center' },
        { field: 'submissionCount', label: 'Submissions', sortable: true, formatter: 'number', width: 120, align: 'right' },
        { field: 'lastSubmissionAt', label: 'Last Submission', sortable: true, formatter: 'datetime', width: 180 },
        { field: 'createdBy.name', label: 'Created By', sortable: true, width: 150 },
        { field: 'isPublic', label: 'Public', sortable: true, formatter: 'boolean', width: 100, align: 'center' },
      ],
      actions: [
        { id: 'view', label: 'View Submissions', icon: '👁️', variant: 'primary' },
        { id: 'edit', label: 'Edit', icon: '✏️', variant: 'secondary' },
        { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
      ],
      bulkActions: [
        { id: 'archive', label: 'Archive Selected', icon: '📦', variant: 'secondary' },
        { id: 'delete', label: 'Delete Selected', icon: '🗑️', variant: 'danger' },
      ],
      defaultSort: 'createdAt',
      defaultSortDirection: 'desc',
    }),

    formSubmissionsTableConfig: () => ({
      columns: [
        { field: 'submittedBy.name', label: 'Submitted By', sortable: true, width: 180 },
        { field: 'submittedAt', label: 'Submitted At', sortable: true, formatter: 'datetime', width: 180 },
        { field: 'status', label: 'Status', sortable: true, width: 120, align: 'center' },
        { field: 'ipAddress', label: 'IP Address', sortable: false, width: 150 },
      ],
      actions: [
        { id: 'view', label: 'View Response', icon: '👁️', variant: 'primary' },
        { id: 'download', label: 'Download', icon: '⬇️', variant: 'secondary' },
      ],
      bulkActions: [
        { id: 'export', label: 'Export Selected', icon: '📥', variant: 'primary' },
      ],
      defaultSort: 'submittedAt',
      defaultSortDirection: 'desc',
    }),

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

  FileRequest: {
    requestedBy: (request) => users.find(u => u.id === request.requestedById),
    requestedFrom: (request) => users.find(u => u.id === request.requestedFromId),
  },

  Form: {
    createdBy: (form) => users.find(u => u.id === form.createdById),
  },

  FormSubmission: {
    submittedBy: (submission) => users.find(u => u.id === submission.submittedById),
    form: (submission) => forms.find(f => f.id === submission.formId),
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

    // FileRequest mutations
    approveFileRequest: (_, { id }) => {
      const request = fileRequests.find(r => r.id === id);
      if (!request) throw new Error('File request not found');

      request.status = 'approved';
      return request;
    },

    rejectFileRequest: (_, { id, reason }) => {
      const request = fileRequests.find(r => r.id === id);
      if (!request) throw new Error('File request not found');

      request.status = 'rejected';
      if (reason) {
        request.message = `${request.message}\n\nRejection reason: ${reason}`;
      }
      return request;
    },

    uploadFileForRequest: (_, { id, fileSize, fileType }) => {
      const request = fileRequests.find(r => r.id === id);
      if (!request) throw new Error('File request not found');

      request.status = 'completed';
      request.fileSize = fileSize;
      request.fileType = fileType;
      request.uploadedAt = new Date().toISOString();
      return request;
    },

    // Form mutations
    createForm: (_, { title, description, category }) => {
      const newForm = {
        id: `form-${forms.length + 1}`,
        title,
        description,
        status: 'draft',
        createdById: '1', // Default to first user
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissionCount: 0,
        lastSubmissionAt: null,
        category,
        isPublic: false,
      };

      forms.push(newForm);
      return newForm;
    },

    updateForm: (_, { id, title, description, status }) => {
      const form = forms.find(f => f.id === id);
      if (!form) throw new Error('Form not found');

      if (title) form.title = title;
      if (description) form.description = description;
      if (status) form.status = status;
      form.updatedAt = new Date().toISOString();

      return form;
    },

    deleteForm: (_, { id }) => {
      const index = forms.findIndex(f => f.id === id);
      if (index === -1) return false;

      forms.splice(index, 1);
      return true;
    },

    submitForm: (_, { formId, responseData }) => {
      const form = forms.find(f => f.id === formId);
      if (!form) throw new Error('Form not found');

      const newSubmission = {
        id: `sub-${formSubmissions.length + 1}`,
        formId,
        submittedById: '1', // Default to first user
        submittedAt: new Date().toISOString(),
        status: 'pending',
        responseData,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
      };

      formSubmissions.push(newSubmission);

      // Update form submission count
      form.submissionCount += 1;
      form.lastSubmissionAt = newSubmission.submittedAt;

      return newSubmission;
    },
  },
};
