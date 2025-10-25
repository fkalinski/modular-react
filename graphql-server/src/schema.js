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

  # Form Submission type (Archives)
  type FormSubmission {
    id: ID!
    formName: String!
    submittedBy: User!
    submittedAt: String!
    status: String!
    responseCount: Int!
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

    # Form submission queries (Archives)
    formSubmissions: [FormSubmission!]!
    formSubmission(id: ID!): FormSubmission

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
  }
`;
