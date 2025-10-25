/**
 * Field Enricher System
 *
 * Allows tabs to register data transformation functions that run after
 * GraphQL data is fetched. Enrichers can add computed fields, transform
 * values, or combine multiple fields into new ones.
 */

export type EnricherFunction<T = any, R = any> = (
  value: T,
  row: any,
  allData: any[]
) => R;

export interface FieldEnricher<T = any, R = any> {
  /** Unique identifier for this enricher */
  id: string;
  /** The field path to enrich (e.g., 'owner.name', 'size') */
  field: string;
  /** The enrichment function */
  enrich: EnricherFunction<T, R>;
  /** Optional: only apply to specific types */
  types?: string[];
  /** Optional: dependencies on other enrichers (run order) */
  dependencies?: string[];
}

export interface EnrichmentResult<T = any> {
  /** The enriched data */
  data: T[];
  /** Enrichers that were applied */
  appliedEnrichers: string[];
  /** Any errors that occurred during enrichment */
  errors?: Array<{ enricherId: string; error: Error }>;
}

/**
 * Enricher Registry
 * Manages registration and application of field enrichers
 */
export class EnricherRegistry {
  private enrichers: Map<string, FieldEnricher> = new Map();

  /**
   * Register a field enricher
   */
  register(enricher: FieldEnricher): void {
    if (this.enrichers.has(enricher.id)) {
      console.warn(`Enricher ${enricher.id} is already registered. Overwriting.`);
    }
    this.enrichers.set(enricher.id, enricher);
  }

  /**
   * Unregister an enricher
   */
  unregister(enricherId: string): void {
    this.enrichers.delete(enricherId);
  }

  /**
   * Get an enricher by ID
   */
  get(enricherId: string): FieldEnricher | undefined {
    return this.enrichers.get(enricherId);
  }

  /**
   * Get all enrichers for a specific field
   */
  getEnrichersForField(field: string, typeName?: string): FieldEnricher[] {
    return Array.from(this.enrichers.values()).filter((enricher) => {
      const fieldMatches = enricher.field === field;
      const typeMatches = !enricher.types || !typeName || enricher.types.includes(typeName);
      return fieldMatches && typeMatches;
    });
  }

  /**
   * Apply all registered enrichers to a dataset
   */
  enrich<T = any>(
    data: T[],
    typeName?: string,
    enricherIds?: string[]
  ): EnrichmentResult<T> {
    if (data.length === 0) {
      return { data, appliedEnrichers: [] };
    }

    // Get enrichers to apply
    let enrichersToApply: FieldEnricher[];

    if (enricherIds) {
      // Use specific enrichers
      enrichersToApply = enricherIds
        .map((id) => this.enrichers.get(id))
        .filter((e): e is FieldEnricher => e !== undefined);
    } else {
      // Use all enrichers, filtered by type if provided
      enrichersToApply = Array.from(this.enrichers.values()).filter((enricher) => {
        return !enricher.types || !typeName || enricher.types.includes(typeName);
      });
    }

    // Resolve dependencies to determine execution order
    const orderedEnrichers = this.resolveDependencies(enrichersToApply);

    // Apply enrichers
    let enrichedData = [...data];
    const appliedEnrichers: string[] = [];
    const errors: Array<{ enricherId: string; error: Error }> = [];

    for (const enricher of orderedEnrichers) {
      try {
        enrichedData = enrichedData.map((row) => {
          try {
            const value = this.getNestedValue(row, enricher.field);
            const enrichedValue = enricher.enrich(value, row, enrichedData);

            // Set the enriched value back into the row
            return this.setNestedValue(row, enricher.field, enrichedValue);
          } catch (error) {
            console.error(`Error applying enricher ${enricher.id} to row:`, error);
            return row;
          }
        });

        appliedEnrichers.push(enricher.id);
      } catch (error) {
        console.error(`Error applying enricher ${enricher.id}:`, error);
        errors.push({
          enricherId: enricher.id,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    return {
      data: enrichedData,
      appliedEnrichers,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Resolve enricher dependencies to ensure correct execution order
   */
  private resolveDependencies(enrichers: FieldEnricher[]): FieldEnricher[] {
    const resolved: FieldEnricher[] = [];
    const visited = new Set<string>();

    const resolve = (enricher: FieldEnricher) => {
      if (visited.has(enricher.id)) {
        return;
      }

      // Resolve dependencies first
      if (enricher.dependencies) {
        for (const depId of enricher.dependencies) {
          const dep = this.enrichers.get(depId);
          if (dep) {
            resolve(dep);
          }
        }
      }

      visited.add(enricher.id);
      resolved.push(enricher);
    };

    enrichers.forEach(resolve);
    return resolved;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[part];
    }, obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): any {
    const parts = path.split('.');
    const newObj = { ...obj };
    let current: any = newObj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === null || current[part] === undefined) {
        current[part] = {};
      } else {
        current[part] = { ...current[part] };
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
    return newObj;
  }

  /**
   * Clear all registered enrichers
   */
  clear(): void {
    this.enrichers.clear();
  }

  /**
   * Get all registered enricher IDs
   */
  getEnricherIds(): string[] {
    return Array.from(this.enrichers.keys());
  }
}

/**
 * Global enricher registry instance
 */
export const enricherRegistry = new EnricherRegistry();

/**
 * Helper function to create a simple field enricher
 */
export function createEnricher<T = any, R = any>(
  id: string,
  field: string,
  enrich: EnricherFunction<T, R>,
  options?: {
    types?: string[];
    dependencies?: string[];
  }
): FieldEnricher<T, R> {
  return {
    id,
    field,
    enrich,
    types: options?.types,
    dependencies: options?.dependencies,
  };
}

/**
 * Helper function to register an enricher from a tab
 */
export function registerTabEnricher<T = any, R = any>(
  tabId: string,
  field: string,
  enrich: EnricherFunction<T, R>,
  options?: {
    types?: string[];
    dependencies?: string[];
  }
): void {
  const enricher = createEnricher(
    `${tabId}_${field}`,
    field,
    enrich,
    options
  );

  enricherRegistry.register(enricher);
}

/**
 * Common enricher factories
 */
export const enrichers = {
  /**
   * Add a computed field based on other fields
   */
  computed: <T = any>(
    field: string,
    compute: (row: any) => T
  ): EnricherFunction<any, T> => {
    return (_value, row) => compute(row);
  },

  /**
   * Format a field using a formatter function
   */
  format: <T = any, R = any>(
    formatter: (value: T) => R
  ): EnricherFunction<T, R> => {
    return (value) => (value !== null && value !== undefined ? formatter(value) : value);
  },

  /**
   * Add a suffix to a field
   */
  suffix: (suffix: string): EnricherFunction<string, string> => {
    return (value) => (value ? `${value}${suffix}` : value);
  },

  /**
   * Add a prefix to a field
   */
  prefix: (prefix: string): EnricherFunction<string, string> => {
    return (value) => (value ? `${prefix}${value}` : value);
  },

  /**
   * Map a field value using a lookup table
   */
  map: <T = any, R = any>(
    mapping: Record<string, R>,
    defaultValue?: R
  ): EnricherFunction<T, R> => {
    return (value) => {
      const key = String(value);
      return mapping[key] ?? defaultValue ?? value;
    };
  },
};

/**
 * Example usage:
 *
 * // In Archives tab plugin
 * registerTabEnricher('archives', 'compressionRatio', enrichers.computed((row) => {
 *   return ((row.originalSize - row.compressedSize) / row.originalSize * 100).toFixed(1);
 * }), { types: ['Archive'] });
 *
 * registerTabEnricher('archives', 'status', enrichers.map({
 *   'ZIP': 'Compressed',
 *   'GZIP': 'Compressed',
 *   'TAR': 'Archived',
 *   'NONE': 'Uncompressed',
 * }), { types: ['Archive'] });
 *
 * // In component, apply enrichers
 * const result = enricherRegistry.enrich(data, 'Archive');
 * const enrichedData = result.data;
 */
