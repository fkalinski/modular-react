import { gql } from '@apollo/client';
import {
  FILE_FRAGMENT,
  FOLDER_FRAGMENT,
  HUB_FRAGMENT,
  REPORT_FRAGMENT,
  FORM_SUBMISSION_FRAGMENT,
  USER_FRAGMENT,
} from './fragments';

/**
 * GraphQL Queries
 */

// User queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// File queries
export const GET_FILES = gql`
  query GetFiles($parentId: ID, $filters: ContentFilters) {
    files(parentId: $parentId, filters: $filters) {
      ...FileFields
    }
  }
  ${FILE_FRAGMENT}
`;

export const GET_FILE = gql`
  query GetFile($id: ID!) {
    file(id: $id) {
      ...FileFields
    }
  }
  ${FILE_FRAGMENT}
`;

// Folder queries
export const GET_FOLDERS = gql`
  query GetFolders($parentId: ID, $filters: ContentFilters) {
    folders(parentId: $parentId, filters: $filters) {
      ...FolderFields
    }
  }
  ${FOLDER_FRAGMENT}
`;

export const GET_FOLDER = gql`
  query GetFolder($id: ID!) {
    folder(id: $id) {
      ...FolderFields
      children {
        ... on File {
          ...FileFields
        }
        ... on Folder {
          ...FolderFields
        }
      }
    }
  }
  ${FOLDER_FRAGMENT}
  ${FILE_FRAGMENT}
`;

// Content items (files + folders)
export const GET_CONTENT_ITEMS = gql`
  query GetContentItems($parentId: ID, $filters: ContentFilters) {
    contentItems(parentId: $parentId, filters: $filters) {
      ... on File {
        ...FileFields
      }
      ... on Folder {
        ...FolderFields
      }
    }
  }
  ${FILE_FRAGMENT}
  ${FOLDER_FRAGMENT}
`;

// Hub queries
export const GET_HUBS = gql`
  query GetHubs($filters: HubFilters) {
    hubs(filters: $filters) {
      ...HubFields
    }
  }
  ${HUB_FRAGMENT}
`;

export const GET_HUB = gql`
  query GetHub($id: ID!) {
    hub(id: $id) {
      ...HubFields
    }
  }
  ${HUB_FRAGMENT}
`;

// Report queries
export const GET_REPORTS = gql`
  query GetReports {
    reports {
      ...ReportFields
    }
  }
  ${REPORT_FRAGMENT}
`;

export const GET_REPORT = gql`
  query GetReport($id: ID!) {
    report(id: $id) {
      ...ReportFields
    }
  }
  ${REPORT_FRAGMENT}
`;

// Form submission queries
export const GET_FORM_SUBMISSIONS = gql`
  query GetFormSubmissions {
    formSubmissions {
      ...FormSubmissionFields
    }
  }
  ${FORM_SUBMISSION_FRAGMENT}
`;

export const GET_FORM_SUBMISSION = gql`
  query GetFormSubmission($id: ID!) {
    formSubmission(id: $id) {
      ...FormSubmissionFields
    }
  }
  ${FORM_SUBMISSION_FRAGMENT}
`;

// Search query
export const SEARCH_CONTENT = gql`
  query SearchContent($query: String!, $filters: ContentFilters) {
    search(query: $query, filters: $filters) {
      totalResults
      files {
        ...FileFields
      }
      folders {
        ...FolderFields
      }
      hubs {
        ...HubFields
      }
    }
  }
  ${FILE_FRAGMENT}
  ${FOLDER_FRAGMENT}
  ${HUB_FRAGMENT}
`;

/**
 * GraphQL Mutations
 */

// File/Folder mutations
export const CREATE_FOLDER = gql`
  mutation CreateFolder($name: String!, $parentId: ID) {
    createFolder(name: $name, parentId: $parentId) {
      ...FolderFields
    }
  }
  ${FOLDER_FRAGMENT}
`;

export const RENAME_FILE = gql`
  mutation RenameFile($id: ID!, $name: String!) {
    renameFile(id: $id, name: $name) {
      ...FileFields
    }
  }
  ${FILE_FRAGMENT}
`;

export const DELETE_FILE = gql`
  mutation DeleteFile($id: ID!) {
    deleteFile(id: $id)
  }
`;

// Hub mutations
export const CREATE_HUB = gql`
  mutation CreateHub($name: String!, $description: String!, $category: String!) {
    createHub(name: $name, description: $description, category: $category) {
      ...HubFields
    }
  }
  ${HUB_FRAGMENT}
`;

export const UPDATE_HUB = gql`
  mutation UpdateHub($id: ID!, $name: String, $description: String) {
    updateHub(id: $id, name: $name, description: $description) {
      ...HubFields
    }
  }
  ${HUB_FRAGMENT}
`;

// Report mutation
export const GENERATE_REPORT = gql`
  mutation GenerateReport($name: String!, $type: String!) {
    generateReport(name: $name, type: $type) {
      ...ReportFields
    }
  }
  ${REPORT_FRAGMENT}
`;
