/**
 * @content-platform/data
 *
 * Shared data access layer with GraphQL client, queries, and hooks
 *
 * Usage:
 * 1. Wrap app with ApolloProvider
 * 2. Use hooks in components (useFiles, useHubs, etc.)
 * 3. Extend fragments for custom fields
 */

// Export client
export { createApolloClient, defaultApolloClient } from './client';

// Export fragments
export {
  USER_FRAGMENT,
  CONTENT_ITEM_BASE_FRAGMENT,
  FILE_FRAGMENT,
  FOLDER_FRAGMENT,
  HUB_FRAGMENT,
  REPORT_FRAGMENT,
  FORM_SUBMISSION_FRAGMENT,
} from './fragments';

// Export queries
export {
  GET_USERS,
  GET_USER,
  GET_FILES,
  GET_FILE,
  GET_FOLDERS,
  GET_FOLDER,
  GET_CONTENT_ITEMS,
  GET_HUBS,
  GET_HUB,
  GET_REPORTS,
  GET_REPORT,
  GET_FORM_SUBMISSIONS,
  GET_FORM_SUBMISSION,
  SEARCH_CONTENT,
  CREATE_FOLDER,
  RENAME_FILE,
  DELETE_FILE,
  CREATE_HUB,
  UPDATE_HUB,
  GENERATE_REPORT,
} from './queries';

// Export hooks
export {
  useFiles,
  useFile,
  useFolders,
  useFolder,
  useContentItems,
  useHubs,
  useHub,
  useReports,
  useReport,
  useFormSubmissions,
  useFormSubmission,
  useSearch,
  useCreateFolder,
  useRenameFile,
  useDeleteFile,
  useCreateHub,
  useUpdateHub,
  useGenerateReport,
} from './hooks';
