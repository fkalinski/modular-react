import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider, gql } from '@apollo/client';

// Create Apollo Client instance
export function createApolloClient(uri: string = 'http://localhost:4000/graphql') {
  return new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}

// Base GraphQL fragments
export const CONTENT_ITEM_FIELDS = gql`
  fragment ContentItemFields on ContentItem {
    id
    name
    createdAt
    updatedAt
    type
  }
`;

// Base queries
export const GET_CONTENT_ITEMS = gql`
  ${CONTENT_ITEM_FIELDS}
  query GetContentItems($filters: FilterInput) {
    contentItems(filters: $filters) {
      ...ContentItemFields
    }
  }
`;

// Export Apollo components
export { ApolloProvider, gql };
export type { ApolloClient };
