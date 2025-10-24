import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client';

/**
 * Apollo Client configuration for Content Platform
 */

/**
 * Create Apollo Client instance
 *
 * @param uri - GraphQL server URI (default: http://localhost:4000/graphql)
 * @param headers - Optional headers to include with requests
 */
export const createApolloClient = (
  uri: string = 'http://localhost:4000/graphql',
  headers?: Record<string, string>
): ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    link: new HttpLink({
      uri,
      headers: headers || {},
    }),
    cache: new InMemoryCache({
      typePolicies: {
        // File type policy
        File: {
          keyFields: ['id'],
        },
        // Folder type policy
        Folder: {
          keyFields: ['id'],
        },
        // Hub type policy
        Hub: {
          keyFields: ['id'],
        },
        // Report type policy
        Report: {
          keyFields: ['id'],
        },
        // User type policy
        User: {
          keyFields: ['id'],
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};

/**
 * Default Apollo Client instance
 * Can be overridden by providing a custom client to ApolloProvider
 */
export const defaultApolloClient = createApolloClient();
