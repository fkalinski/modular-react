# Content Platform GraphQL Server

Mock GraphQL server for Content Platform development with realistic data.

## Quick Start

```bash
# Install dependencies
npm install

# Start server (production mode)
npm start

# Start server (development mode with auto-reload)
npm run dev
```

Server runs on **http://localhost:4000/graphql**

## Features

- **Mock Data**: Realistic mock data for files, folders, hubs, reports, and form submissions
- **GraphQL Schema**: Complete schema with queries and mutations
- **CORS Enabled**: Configured for local development (ports 3000-3005, 8080)
- **Introspection**: GraphQL Playground available for testing queries
- **Health Check**: `/health` endpoint for monitoring

## GraphQL Schema Overview

### Types

- **User**: User information (id, name, email, avatar)
- **File**: File with metadata (id, name, size, mimeType, owner, dates)
- **Folder**: Folder with children (id, name, itemCount, children)
- **Hub**: Collaboration hub (id, name, description, memberCount, category)
- **Report**: Report metadata (id, name, type, status, schedule)
- **FormSubmission**: Form submission (id, formName, status, responseCount)

### Queries

```graphql
# Files and folders
files(parentId: ID, filters: ContentFilters): [File!]!
folders(parentId: ID, filters: ContentFilters): [Folder!]!
contentItems(parentId: ID, filters: ContentFilters): [ContentItem!]!

# Hubs
hubs(filters: HubFilters): [Hub!]!
hub(id: ID!): Hub

# Reports
reports: [Report!]!
report(id: ID!): Report

# Form submissions (Archives)
formSubmissions: [FormSubmission!]!

# Search
search(query: String!, filters: ContentFilters): SearchResults!

# Users
users: [User!]!
user(id: ID!): User
```

### Mutations

```graphql
# File/Folder operations
createFolder(name: String!, parentId: ID): Folder!
renameFile(id: ID!, name: String!): File!
deleteFile(id: ID!): Boolean!

# Hub operations
createHub(name: String!, description: String!, category: String!): Hub!
updateHub(id: ID!, name: String, description: String): Hub!

# Report generation
generateReport(name: String!, type: String!): Report!
```

## Example Queries

### Get all files in a folder

```graphql
query {
  files(parentId: "folder-1") {
    id
    name
    size
    mimeType
    owner {
      name
      email
    }
    createdAt
  }
}
```

### Get folder with children

```graphql
query {
  folder(id: "folder-1") {
    id
    name
    path
    itemCount
    children {
      ... on File {
        id
        name
        size
        mimeType
      }
      ... on Folder {
        id
        name
        itemCount
      }
    }
  }
}
```

### Search content

```graphql
query {
  search(query: "proposal") {
    totalResults
    files {
      id
      name
      path
    }
    folders {
      id
      name
      path
    }
    hubs {
      id
      name
      description
    }
  }
}
```

### Get all hubs

```graphql
query {
  hubs {
    id
    name
    description
    memberCount
    category
    isActive
  }
}
```

### Get reports

```graphql
query {
  reports {
    id
    name
    type
    status
    generatedBy {
      name
    }
    createdAt
    scheduleType
  }
}
```

## Example Mutations

### Create a folder

```graphql
mutation {
  createFolder(name: "New Folder", parentId: "folder-1") {
    id
    name
    path
    createdAt
  }
}
```

### Rename a file

```graphql
mutation {
  renameFile(id: "file-1", name: "Updated-Proposal.docx") {
    id
    name
    updatedAt
  }
}
```

### Create a hub

```graphql
mutation {
  createHub(
    name: "Sales Team"
    description: "Sales collaboration hub"
    category: "Team"
  ) {
    id
    name
    memberCount
  }
}
```

## Mock Data

The server includes mock data for:

- **4 users**: John Doe, Jane Smith, Bob Johnson, Alice Brown
- **3 folders**: My Documents, Projects, Shared
- **5 files**: Various document types (docx, xlsx, pptx, md, png)
- **4 hubs**: Engineering, Product Launch, Marketing, Design System
- **5 reports**: Sales, Activity, Analytics, Performance, System reports
- **3 form submissions**: Customer Feedback, Employee Survey, Bug Report

## Development

### Adding New Queries

1. Update `src/schema.js` to add new query/mutation definitions
2. Update `src/resolvers.js` to implement resolver logic
3. Add mock data to `src/mockData.js` if needed

### CORS Configuration

Update CORS origins in `src/index.js`:

```javascript
cors({
  origin: ['http://localhost:3000', 'http://your-domain.com'],
  credentials: true,
})
```

## Architecture

```
graphql-server/
├── src/
│   ├── index.js       # Apollo Server setup
│   ├── schema.js      # GraphQL type definitions
│   ├── resolvers.js   # Query/mutation resolvers
│   └── mockData.js    # Mock data store
├── package.json
└── README.md
```

## Integration with Frontend

### Apollo Client Setup

```javascript
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});
```

### Using with React

```javascript
import { useQuery, gql } from '@apollo/client';

const GET_FILES = gql`
  query GetFiles {
    files {
      id
      name
      size
    }
  }
`;

function FilesList() {
  const { loading, error, data } = useQuery(GET_FILES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.files.map(file => (
        <li key={file.id}>{file.name}</li>
      ))}
    </ul>
  );
}
```

## Notes

- Data is stored in memory and resets on server restart
- This is for development/demo purposes only
- For production, connect to a real database
- Consider adding authentication middleware for production use
