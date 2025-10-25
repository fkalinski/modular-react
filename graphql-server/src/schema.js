import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # User type
  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String!
  }

  # Base content item interface
  interface ContentItem {
    id: ID!
    name: String!
    type: String!
    path: String!
    parentId: ID
    owner: User!
    createdAt: String!
    updatedAt: String!
  }

  # Folder type
  type Folder implements ContentItem {
    id: ID!
    name: String!
    type: String!
    path: String!
    parentId: ID
    owner: User!
    createdAt: String!
    updatedAt: String!
    itemCount: Int!
    children: [ContentItem!]!
  }

  # File type
  type File implements ContentItem {
    id: ID!
    name: String!
    type: String!
    path: String!
    parentId: ID
    owner: User!
    createdAt: String!
    updatedAt: String!
    size: Int!
    mimeType: String!
  }

  # Hub type
  type Hub {
    id: ID!
    name: String!
    description: String!
    memberCount: Int!
    category: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # Archive type
  type Archive implements ContentItem {
    id: ID!
    name: String!
    type: String!
    path: String!
    parentId: ID
    owner: User!
    createdAt: String!
    updatedAt: String!
    # Archive-specific fields
    archiveDate: String!
    archiveReason: String!
    originalLocation: String!
    compressionType: String!
    compressedSize: Int!
    originalSize: Int!
    archivedBy: User!
  }

  # Report type
  type Report {
    id: ID!
    name: String!
    type: String!
    status: String!
    generatedBy: User!
    createdAt: String!
    scheduleType: String!
  }

  # FileRequest type
  type FileRequest {
    id: ID!
    fileName: String!
    requestedBy: User!
    requestedFrom: User!
    requestedAt: String!
    dueDate: String!
    status: String!
    priority: String!
    message: String
    fileSize: Int
    fileType: String
    uploadedAt: String
  }

  # Form type
  type Form {
    id: ID!
    title: String!
    description: String!
    status: String!
    createdBy: User!
    createdAt: String!
    updatedAt: String!
    submissionCount: Int!
    lastSubmissionAt: String
    category: String!
    isPublic: Boolean!
  }

  # FormSubmission type
  type FormSubmission {
    id: ID!
    formId: ID!
    form: Form!
    submittedBy: User!
    submittedAt: String!
    status: String!
    responseData: String!
    ipAddress: String
    userAgent: String
  }

  # UI Configuration types for SDUI (Level 3)
  type ColumnConfig {
    field: String!
    label: String!
    sortable: Boolean
    formatter: String
    width: Int
    align: String
  }

  type ActionConfig {
    id: String!
    label: String!
    icon: String
    variant: String
  }

  type TableUIConfig {
    columns: [ColumnConfig!]!
    actions: [ActionConfig!]
    bulkActions: [ActionConfig!]
    defaultSort: String
    defaultSortDirection: String
  }

  # Search results
  type SearchResults {
    files: [File!]!
    folders: [Folder!]!
    hubs: [Hub!]!
    totalResults: Int!
  }

  # Input types for filtering
  input ContentFilters {
    ownerId: ID
    type: String
    fromDate: String
    toDate: String
  }

  input HubFilters {
    category: String
    isActive: Boolean
  }

  input ArchiveFilters {
    compressionType: String
    fromDate: String
    toDate: String
    archivedById: ID
  }

  input FileRequestFilters {
    status: String
    priority: String
    requestedById: ID
    requestedFromId: ID
  }

  input FormFilters {
    status: String
    category: String
    createdById: ID
  }

  # Queries
  type Query {
    # User queries
    user(id: ID!): User
    users: [User!]!

    # Content queries
    files(parentId: ID, filters: ContentFilters): [File!]!
    file(id: ID!): File
    folders(parentId: ID, filters: ContentFilters): [Folder!]!
    folder(id: ID!): Folder
    contentItems(parentId: ID, filters: ContentFilters): [ContentItem!]!

    # Hub queries
    hubs(filters: HubFilters): [Hub!]!
    hub(id: ID!): Hub

    # Archive queries
    archives(filters: ArchiveFilters): [Archive!]!
    archive(id: ID!): Archive

    # Report queries
    reports: [Report!]!
    report(id: ID!): Report

    # FileRequest queries
    fileRequests(filters: FileRequestFilters): [FileRequest!]!
    fileRequest(id: ID!): FileRequest

    # Form queries
    forms(filters: FormFilters): [Form!]!
    form(id: ID!): Form

    # FormSubmission queries
    formSubmissions(formId: ID): [FormSubmission!]!
    formSubmission(id: ID!): FormSubmission

    # UI Configuration queries (for SDUI - Level 3)
    formsTableConfig: TableUIConfig!
    formSubmissionsTableConfig: TableUIConfig!

    # Search
    search(query: String!, filters: ContentFilters): SearchResults!
  }

  # Mutations
  type Mutation {
    # File/Folder mutations
    createFolder(name: String!, parentId: ID): Folder!
    renameFile(id: ID!, name: String!): File!
    deleteFile(id: ID!): Boolean!

    # Hub mutations
    createHub(name: String!, description: String!, category: String!): Hub!
    updateHub(id: ID!, name: String, description: String): Hub!

    # Report mutations
    generateReport(name: String!, type: String!): Report!

    # Archive mutations
    restoreArchive(id: ID!, targetPath: String!): File!
    deleteArchive(id: ID!): Boolean!

    # FileRequest mutations
    approveFileRequest(id: ID!): FileRequest!
    rejectFileRequest(id: ID!, reason: String): FileRequest!
    uploadFileForRequest(id: ID!, fileSize: Int!, fileType: String!): FileRequest!

    # Form mutations
    createForm(title: String!, description: String!, category: String!): Form!
    updateForm(id: ID!, title: String, description: String, status: String): Form!
    deleteForm(id: ID!): Boolean!
    submitForm(formId: ID!, responseData: String!): FormSubmission!
  }
`;
