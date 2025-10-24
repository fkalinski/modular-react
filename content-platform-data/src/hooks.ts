import { useQuery, useMutation, QueryHookOptions, MutationHookOptions } from '@apollo/client';
import {
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

/**
 * Custom hooks for data fetching
 *
 * These hooks wrap Apollo's useQuery and useMutation with typed queries.
 */

// File hooks
export const useFiles = (parentId?: string, filters?: any, options?: QueryHookOptions) => {
  return useQuery(GET_FILES, {
    variables: { parentId, filters },
    ...options,
  });
};

export const useFile = (id: string, options?: QueryHookOptions) => {
  return useQuery(GET_FILE, {
    variables: { id },
    ...options,
  });
};

// Folder hooks
export const useFolders = (parentId?: string, filters?: any, options?: QueryHookOptions) => {
  return useQuery(GET_FOLDERS, {
    variables: { parentId, filters },
    ...options,
  });
};

export const useFolder = (id: string, options?: QueryHookOptions) => {
  return useQuery(GET_FOLDER, {
    variables: { id },
    ...options,
  });
};

// Content items hook (files + folders)
export const useContentItems = (parentId?: string, filters?: any, options?: QueryHookOptions) => {
  return useQuery(GET_CONTENT_ITEMS, {
    variables: { parentId, filters },
    ...options,
  });
};

// Hub hooks
export const useHubs = (filters?: any, options?: QueryHookOptions) => {
  return useQuery(GET_HUBS, {
    variables: { filters },
    ...options,
  });
};

export const useHub = (id: string, options?: QueryHookOptions) => {
  return useQuery(GET_HUB, {
    variables: { id },
    ...options,
  });
};

// Report hooks
export const useReports = (options?: QueryHookOptions) => {
  return useQuery(GET_REPORTS, options);
};

export const useReport = (id: string, options?: QueryHookOptions) => {
  return useQuery(GET_REPORT, {
    variables: { id },
    ...options,
  });
};

// Form submission hooks
export const useFormSubmissions = (options?: QueryHookOptions) => {
  return useQuery(GET_FORM_SUBMISSIONS, options);
};

export const useFormSubmission = (id: string, options?: QueryHookOptions) => {
  return useQuery(GET_FORM_SUBMISSION, {
    variables: { id },
    ...options,
  });
};

// Search hook
export const useSearch = (query: string, filters?: any, options?: QueryHookOptions) => {
  return useQuery(SEARCH_CONTENT, {
    variables: { query, filters },
    skip: !query, // Don't run query if search is empty
    ...options,
  });
};

/**
 * Mutation hooks
 */

// Folder mutations
export const useCreateFolder = (options?: MutationHookOptions) => {
  return useMutation(CREATE_FOLDER, options);
};

// File mutations
export const useRenameFile = (options?: MutationHookOptions) => {
  return useMutation(RENAME_FILE, options);
};

export const useDeleteFile = (options?: MutationHookOptions) => {
  return useMutation(DELETE_FILE, options);
};

// Hub mutations
export const useCreateHub = (options?: MutationHookOptions) => {
  return useMutation(CREATE_HUB, options);
};

export const useUpdateHub = (options?: MutationHookOptions) => {
  return useMutation(UPDATE_HUB, options);
};

// Report mutation
export const useGenerateReport = (options?: MutationHookOptions) => {
  return useMutation(GENERATE_REPORT, options);
};
