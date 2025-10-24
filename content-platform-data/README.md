# @content-platform/data

Shared data access layer with GraphQL client, fragments, queries, and React hooks.

## Overview

This package provides a unified data access layer for the Content Platform using **Apollo Client** and **GraphQL**. It includes:

- ✅ Pre-configured Apollo Client
- ✅ Reusable GraphQL fragments
- ✅ Typed queries and mutations
- ✅ React hooks for easy data fetching
- ✅ Shared caching across tabs

## Installation

```bash
npm install @content-platform/data @apollo/client graphql
```

## Quick Start

### 1. Wrap App with ApolloProvider

```tsx
import { ApolloProvider } from '@apollo/client';
import { defaultApolloClient } from '@content-platform/data';

function Shell() {
  return (
    <ApolloProvider client={defaultApolloClient}>
      <App />
    </ApolloProvider>
  );
}
```

### 2. Use Data Hooks in Components

```tsx
import { useFiles } from '@content-platform/data';

function FilesTab() {
  const { data, loading, error } = useFiles();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.files.map(file => (
        <li key={file.id}>{file.name} - {file.size} bytes</li>
      ))}
    </ul>
  );
}
```

## API Reference

### Client

#### `createApolloClient(uri, headers)`

Create a custom Apollo Client instance.

```tsx
import { createApolloClient } from '@content-platform/data';

const client = createApolloClient('http://your-server.com/graphql', {
  'Authorization': 'Bearer token',
});
```

#### `defaultApolloClient`

Pre-configured client pointing to `http://localhost:4000/graphql`.

```tsx
import { ApolloProvider } from '@apollo/client';
import { defaultApolloClient } from '@content-platform/data';

<ApolloProvider client={defaultApolloClient}>
  <App />
</ApolloProvider>
```

### Hooks

All hooks return Apollo's standard result object with `{ data, loading, error, refetch }`.

#### Files

```tsx
import { useFiles, useFile } from '@content-platform/data';

// Get all files in a folder
const { data, loading } = useFiles(parentId, filters);

// Get single file
const { data, loading } = useFile(fileId);
```

#### Folders

```tsx
import { useFolders, useFolder } from '@content-platform/data';

// Get all folders
const { data, loading } = useFolders(parentId, filters);

// Get single folder with children
const { data, loading } = useFolder(folderId);
```

#### Content Items

```tsx
import { useContentItems } from '@content-platform/data';

// Get files AND folders together
const { data, loading } = useContentItems(parentId, filters);
```

#### Hubs

```tsx
import { useHubs, useHub } from '@content-platform/data';

// Get all hubs
const { data, loading } = useHubs(filters);

// Get single hub
const { data, loading } = useHub(hubId);
```

#### Reports

```tsx
import { useReports, useReport } from '@content-platform/data';

// Get all reports
const { data, loading } = useReports();

// Get single report
const { data, loading } = useReport(reportId);
```

#### Form Submissions

```tsx
import { useFormSubmissions, useFormSubmission } from '@content-platform/data';

// Get all submissions
const { data, loading } = useFormSubmissions();

// Get single submission
const { data, loading } = useFormSubmission(submissionId);
```

#### Search

```tsx
import { useSearch } from '@content-platform/data';

const { data, loading } = useSearch(query, filters);

// Returns: { totalResults, files[], folders[], hubs[] }
```

### Mutations

#### Create Folder

```tsx
import { useCreateFolder } from '@content-platform/data';

function CreateFolderButton() {
  const [createFolder, { loading }] = useCreateFolder();

  const handleCreate = async () => {
    const result = await createFolder({
      variables: {
        name: 'New Folder',
        parentId: 'folder-1',
      },
    });
    console.log('Created:', result.data.createFolder);
  };

  return <button onClick={handleCreate} disabled={loading}>Create Folder</button>;
}
```

#### Rename File

```tsx
import { useRenameFile } from '@content-platform/data';

const [renameFile] = useRenameFile();

await renameFile({
  variables: { id: 'file-1', name: 'NewName.pdf' },
});
```

#### Delete File

```tsx
import { useDeleteFile } from '@content-platform/data';

const [deleteFile] = useDeleteFile();

await deleteFile({
  variables: { id: 'file-1' },
  // Refetch files list after deletion
  refetchQueries: ['GetFiles'],
});
```

#### Create Hub

```tsx
import { useCreateHub } from '@content-platform/data';

const [createHub] = useCreateHub();

await createHub({
  variables: {
    name: 'New Hub',
    description: 'Hub description',
    category: 'Team',
  },
});
```

## Fragments

Fragments are reusable pieces of queries. You can extend them for custom fields.

### Available Fragments

```graphql
# User
fragment UserFields on User {
  id
  name
  email
  avatar
}

# File
fragment FileFields on File {
  id
  name
  type
  path
  size
  mimeType
  owner { ...UserFields }
  createdAt
  updatedAt
}

# Folder
fragment FolderFields on Folder {
  id
  name
  type
  path
  itemCount
  owner { ...UserFields }
  createdAt
  updatedAt
}

# Hub
fragment HubFields on Hub {
  id
  name
  description
  memberCount
  category
  isActive
}

# Report
fragment ReportFields on Report {
  id
  name
  type
  status
  generatedBy { ...UserFields }
  createdAt
  scheduleType
}
```

### Extending Fragments

```tsx
import { gql } from '@apollo/client';
import { FILE_FRAGMENT } from '@content-platform/data';

// Extend base fragment with custom fields
const EXTENDED_FILE_QUERY = gql`
  query GetFilesWithCustomFields {
    files {
      ...FileFields
      # Add custom fields here
      customMetadata
      thumbnailUrl
    }
  }
  ${FILE_FRAGMENT}
`;
```

## Advanced Usage

### Custom Queries

```tsx
import { gql, useQuery } from '@apollo/client';
import { FILE_FRAGMENT } from '@content-platform/data';

const CUSTOM_QUERY = gql`
  query GetRecentFiles {
    files(filters: { fromDate: "2024-01-01" }) {
      ...FileFields
    }
  }
  ${FILE_FRAGMENT}
`;

function RecentFiles() {
  const { data, loading } = useQuery(CUSTOM_QUERY);
  return <div>...</div>;
}
```

### Optimistic Updates

```tsx
import { useRenameFile } from '@content-platform/data';

const [renameFile] = useRenameFile({
  optimisticResponse: (variables) => ({
    renameFile: {
      __typename: 'File',
      id: variables.id,
      name: variables.name,
      updatedAt: new Date().toISOString(),
    },
  }),
});
```

### Cache Updates

```tsx
import { useDeleteFile, GET_FILES } from '@content-platform/data';

const [deleteFile] = useDeleteFile({
  update(cache, { data }) {
    // Read cache
    const existing = cache.readQuery({ query: GET_FILES });

    // Write updated cache
    cache.writeQuery({
      query: GET_FILES,
      data: {
        files: existing.files.filter(f => f.id !== data.deleteFile),
      },
    });
  },
});
```

### Polling

```tsx
import { useFiles } from '@content-platform/data';

// Poll every 5 seconds
const { data } = useFiles(null, null, {
  pollInterval: 5000,
});
```

### Manual Refetch

```tsx
import { useFiles } from '@content-platform/data';

const { data, refetch } = useFiles();

// Refetch on button click
<button onClick={() => refetch()}>Refresh</button>
```

## Integration with Platform Context

You can combine GraphQL data fetching with platform state management:

```tsx
import { useSearch as usePlatformSearch } from '@platform/context';
import { useSearch as useGraphQLSearch } from '@content-platform/data';

function SearchResults() {
  // Get search query from platform context
  const { query } = usePlatformSearch();

  // Fetch results from GraphQL
  const { data, loading } = useGraphQLSearch(query);

  return <div>Results: {data?.search.totalResults}</div>;
}
```

## Integration with Redux

```tsx
import { useReduxSearch } from '@platform/shared-state';
import { useSearch as useGraphQLSearch } from '@content-platform/data';

function SearchResults() {
  // Get search query from Redux
  const { query } = useReduxSearch();

  // Fetch results from GraphQL
  const { data, loading } = useGraphQLSearch(query);

  // Update Redux with results
  const { updateResults } = useReduxSearch();
  useEffect(() => {
    if (data?.search) {
      updateResults({
        files: data.search.files.length,
        folders: data.search.folders.length,
        hubs: data.search.hubs.length,
        total: data.search.totalResults,
      });
    }
  }, [data]);

  return <div>Results: {data?.search.totalResults}</div>;
}
```

## Module Federation

Share Apollo Client across federated modules:

### Shell webpack.config.js

```javascript
new ModuleFederationPlugin({
  name: 'shell',
  shared: {
    '@apollo/client': { singleton: true, requiredVersion: '^3.8.0' },
    'graphql': { singleton: true },
    '@content-platform/data': { singleton: true },
  },
})
```

### Tab webpack.config.js

```javascript
new ModuleFederationPlugin({
  name: 'files_tab',
  shared: {
    '@apollo/client': { singleton: true },
    'graphql': { singleton: true },
    '@content-platform/data': { singleton: true },
  },
})
```

## Testing

### Mocking Queries

```tsx
import { MockedProvider } from '@apollo/client/testing';
import { GET_FILES } from '@content-platform/data';

const mocks = [
  {
    request: {
      query: GET_FILES,
    },
    result: {
      data: {
        files: [
          { id: '1', name: 'test.pdf', size: 1024 },
        ],
      },
    },
  },
];

test('renders files', async () => {
  render(
    <MockedProvider mocks={mocks}>
      <FilesTab />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });
});
```

## Architecture

```
@content-platform/data
├── client.ts          # Apollo Client configuration
├── fragments.ts       # Reusable GraphQL fragments
├── queries.ts         # Queries and mutations
├── hooks.ts           # React hooks for data fetching
└── index.ts           # Public API
```

## GraphQL Server

This package connects to a GraphQL server. For development, use the included mock server:

```bash
cd graphql-server
npm install
npm start
```

Server runs at `http://localhost:4000/graphql`.

## License

MIT
