import { gql } from '@apollo/client';

/**
 * GraphQL Fragments
 *
 * Fragments define reusable pieces of GraphQL queries.
 * Tabs can extend these fragments with additional fields using fragment composition.
 */

/**
 * User fragment
 */
export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    name
    email
    avatar
  }
`;

/**
 * Base content item fields (shared by Files and Folders)
 */
export const CONTENT_ITEM_BASE_FRAGMENT = gql`
  fragment ContentItemBaseFields on ContentItem {
    id
    name
    type
    path
    parentId
    createdAt
    updatedAt
    owner {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

/**
 * File fragment
 */
export const FILE_FRAGMENT = gql`
  fragment FileFields on File {
    id
    name
    type
    path
    parentId
    createdAt
    updatedAt
    size
    mimeType
    owner {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

/**
 * Folder fragment
 */
export const FOLDER_FRAGMENT = gql`
  fragment FolderFields on Folder {
    id
    name
    type
    path
    parentId
    createdAt
    updatedAt
    itemCount
    owner {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

/**
 * Hub fragment
 */
export const HUB_FRAGMENT = gql`
  fragment HubFields on Hub {
    id
    name
    description
    memberCount
    category
    isActive
    createdAt
    updatedAt
  }
`;

/**
 * Report fragment
 */
export const REPORT_FRAGMENT = gql`
  fragment ReportFields on Report {
    id
    name
    type
    status
    createdAt
    scheduleType
    generatedBy {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

/**
 * Form Submission fragment
 */
export const FORM_SUBMISSION_FRAGMENT = gql`
  fragment FormSubmissionFields on FormSubmission {
    id
    formName
    submittedAt
    status
    responseCount
    submittedBy {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;
