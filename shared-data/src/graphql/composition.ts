import { DocumentNode, gql } from '@apollo/client';

/**
 * Query Fragment Composition System
 *
 * Allows tabs to extend base queries with their own fragments,
 * enabling a data-driven architecture where tabs define what data
 * they need without implementing the UI.
 */

export interface QueryFragment {
  /** Unique identifier for this fragment */
  id: string;
  /** The GraphQL fragment definition */
  fragment: DocumentNode;
  /** The type this fragment applies to (e.g., 'File', 'Archive') */
  on: string;
  /** Optional dependencies on other fragments */
  dependencies?: string[];
}

export interface ComposedQuery {
  /** The composed query document */
  query: DocumentNode;
  /** All fragments included in the query */
  fragments: QueryFragment[];
}

/**
 * Fragment Registry
 * Manages registration and composition of GraphQL fragments from multiple tabs
 */
export class FragmentRegistry {
  private fragments: Map<string, QueryFragment> = new Map();

  /**
   * Register a query fragment
   */
  register(fragment: QueryFragment): void {
    if (this.fragments.has(fragment.id)) {
      console.warn(`Fragment ${fragment.id} is already registered. Overwriting.`);
    }
    this.fragments.set(fragment.id, fragment);
  }

  /**
   * Unregister a query fragment
   */
  unregister(fragmentId: string): void {
    this.fragments.delete(fragmentId);
  }

  /**
   * Get a fragment by ID
   */
  get(fragmentId: string): QueryFragment | undefined {
    return this.fragments.get(fragmentId);
  }

  /**
   * Get all fragments for a specific type
   */
  getFragmentsForType(typeName: string): QueryFragment[] {
    return Array.from(this.fragments.values()).filter(
      (fragment) => fragment.on === typeName
    );
  }

  /**
   * Compose a query with all registered fragments for a type
   */
  composeQuery(
    baseQuery: DocumentNode,
    typeName: string,
    fragmentIds?: string[]
  ): ComposedQuery {
    // Get fragments to include
    let fragmentsToInclude: QueryFragment[];

    if (fragmentIds) {
      // Use specific fragments
      fragmentsToInclude = fragmentIds
        .map((id) => this.fragments.get(id))
        .filter((f): f is QueryFragment => f !== undefined);
    } else {
      // Use all fragments for this type
      fragmentsToInclude = this.getFragmentsForType(typeName);
    }

    // Resolve dependencies
    const resolvedFragments = this.resolveDependencies(fragmentsToInclude);

    // Build the composed query
    const fragmentDefinitions = resolvedFragments
      .map((f) => f.fragment)
      .join('\n');

    // Extract the query string from baseQuery
    const baseQueryStr = baseQuery.loc?.source.body || '';

    // Combine fragments with base query
    const composedQueryStr = `
      ${fragmentDefinitions}
      ${baseQueryStr}
    `;

    return {
      query: gql(composedQueryStr),
      fragments: resolvedFragments,
    };
  }

  /**
   * Resolve fragment dependencies to ensure correct order
   */
  private resolveDependencies(fragments: QueryFragment[]): QueryFragment[] {
    const resolved: QueryFragment[] = [];
    const visited = new Set<string>();

    const resolve = (fragment: QueryFragment) => {
      if (visited.has(fragment.id)) {
        return;
      }

      // Resolve dependencies first
      if (fragment.dependencies) {
        for (const depId of fragment.dependencies) {
          const dep = this.fragments.get(depId);
          if (dep) {
            resolve(dep);
          }
        }
      }

      visited.add(fragment.id);
      resolved.push(fragment);
    };

    fragments.forEach(resolve);
    return resolved;
  }

  /**
   * Clear all registered fragments
   */
  clear(): void {
    this.fragments.clear();
  }

  /**
   * Get all registered fragment IDs
   */
  getFragmentIds(): string[] {
    return Array.from(this.fragments.keys());
  }
}

/**
 * Global fragment registry instance
 */
export const fragmentRegistry = new FragmentRegistry();

/**
 * Helper function to create a query fragment
 */
export function createFragment(
  id: string,
  on: string,
  fields: string,
  dependencies?: string[]
): QueryFragment {
  const fragmentName = id.replace(/[^a-zA-Z0-9]/g, '_') + 'Fields';

  const fragment = gql`
    fragment ${fragmentName} on ${on} {
      ${fields}
    }
  `;

  return {
    id,
    fragment,
    on,
    dependencies,
  };
}

/**
 * Helper function to register a fragment from a tab
 */
export function registerTabFragment(
  tabId: string,
  typeName: string,
  fields: string,
  dependencies?: string[]
): void {
  const fragment = createFragment(
    `${tabId}_${typeName}`,
    typeName,
    fields,
    dependencies
  );

  fragmentRegistry.register(fragment);
}

/**
 * Example usage:
 *
 * // In Archives tab plugin
 * registerTabFragment('archives', 'Archive', `
 *   archiveDate
 *   compressionType
 *   originalLocation
 *   compressedSize
 *   originalSize
 *   archivedBy {
 *     id
 *     name
 *   }
 * `);
 *
 * // In shell, compose the query
 * const { query } = fragmentRegistry.composeQuery(
 *   BASE_ARCHIVES_QUERY,
 *   'Archive',
 *   ['archives_Archive']
 * );
 *
 * // Use the composed query
 * const { data } = useQuery(query, { variables: { filters } });
 */
