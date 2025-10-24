import React, { useState, useEffect } from 'react';
import { usePlatform, subscribeToEvent } from '@platform/context';

/**
 * Example tab using Tab Contract v2
 * Demonstrates:
 * - Platform Context integration
 * - Event Bus subscription
 * - Lifecycle hooks
 * - Filter contributions
 */
const SearchResultsTab: React.FC = () => {
  const platformContext = usePlatform();
  const [results, setResults] = useState<any[]>([]);
  const [lastSearch, setLastSearch] = useState('');

  // Subscribe to platform events
  useEffect(() => {
    // Subscribe to search events
    const unsubscribeSearch = subscribeToEvent('search:submitted', (data) => {
      console.log('[SearchResultsTab] Search submitted:', data.query);
      performSearch(data.query);
    });

    // Subscribe to file selection events
    const unsubscribeFile = subscribeToEvent('file:selected', (data) => {
      console.log('[SearchResultsTab] File selected:', data.fileName);
    });

    // Subscribe to navigation events
    const unsubscribeNav = subscribeToEvent('navigation:changed', (data) => {
      console.log('[SearchResultsTab] Navigation changed:', data.path);
    });

    return () => {
      unsubscribeSearch();
      unsubscribeFile();
      unsubscribeNav();
    };
  }, []);

  // React to search query changes from Platform Context
  useEffect(() => {
    if (platformContext && platformContext.search.query !== lastSearch) {
      setLastSearch(platformContext.search.query);
      if (platformContext.search.query) {
        performSearch(platformContext.search.query);
      } else {
        setResults([]);
      }
    }
  }, [platformContext?.search.query]);

  const performSearch = (query: string) => {
    // Simulate search results
    const mockResults = [
      { id: '1', title: `Result for "${query}" - Document 1`, type: 'document', relevance: 95 },
      { id: '2', title: `Result for "${query}" - Folder 1`, type: 'folder', relevance: 87 },
      { id: '3', title: `Result for "${query}" - Image 1`, type: 'image', relevance: 82 },
      { id: '4', title: `Result for "${query}" - Video 1`, type: 'video', relevance: 78 },
      { id: '5', title: `Result for "${query}" - Document 2`, type: 'document', relevance: 73 },
    ];

    // Apply filters if available
    let filtered = mockResults;
    if (platformContext?.search.filters.length > 0) {
      filtered = mockResults.filter((result) => {
        return platformContext.search.filters.every((filter) => {
          if (filter.key === 'type') {
            return result.type === filter.value;
          }
          if (filter.key === 'minRelevance') {
            return result.relevance >= parseInt(filter.value as string);
          }
          return true;
        });
      });
    }

    setResults(filtered);
  };

  const handleResultClick = (result: any) => {
    if (platformContext) {
      // Toggle selection
      platformContext.selection.toggleSelection(result.id);
    }
  };

  const handleClearFilters = () => {
    if (platformContext) {
      platformContext.search.clearAll();
    }
  };

  const containerStyles: React.CSSProperties = {
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: '20px',
  };

  const filtersBarStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const filterBadgeStyles: React.CSSProperties = {
    padding: '4px 12px',
    backgroundColor: '#e3f2fd',
    color: '#0061d5',
    borderRadius: '12px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const resultCardStyles = (isSelected: boolean): React.CSSProperties => ({
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
    border: `1px solid ${isSelected ? '#0061d5' : '#e2e2e2'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const resultTitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#222222',
    marginBottom: '4px',
  };

  const resultMetaStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#767676',
    display: 'flex',
    gap: '12px',
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#767676',
  };

  const activeFilters = platformContext?.search.filters || [];
  const selectedIds = platformContext?.selection.selectedIds || [];

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
          Search Results
        </h2>
        {platformContext && (
          <p style={{ margin: 0, color: '#767676', fontSize: '13px' }}>
            {results.length > 0
              ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${platformContext.search.query}"`
              : platformContext.search.query
              ? 'No results found'
              : 'Enter a search query to see results'}
          </p>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div style={filtersBarStyles}>
          <span style={{ fontSize: '13px', color: '#767676' }}>Active filters:</span>
          {activeFilters.map((filter, idx) => (
            <div key={idx} style={filterBadgeStyles}>
              {filter.label}: {filter.value}
              <button
                onClick={() => platformContext?.search.removeFilter(filter.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0061d5',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '14px',
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={handleClearFilters}
            style={{
              padding: '4px 12px',
              background: 'none',
              border: '1px solid #e2e2e2',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              color: '#767676',
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {results.length > 0 ? (
        <div>
          {results.map((result) => {
            const isSelected = selectedIds.includes(result.id);
            return (
              <div
                key={result.id}
                style={resultCardStyles(isSelected)}
                onClick={() => handleResultClick(result)}
              >
                <div style={resultTitleStyles}>{result.title}</div>
                <div style={resultMetaStyles}>
                  <span>Type: {result.type}</span>
                  <span>Relevance: {result.relevance}%</span>
                  {isSelected && <span style={{ color: '#0061d5' }}>✓ Selected</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : platformContext?.search.query ? (
        <div style={emptyStateStyles}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ margin: '0 0 8px 0' }}>No results found</h3>
          <p style={{ margin: 0 }}>Try adjusting your search query or filters</p>
        </div>
      ) : (
        <div style={emptyStateStyles}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Start searching</h3>
          <p style={{ margin: 0 }}>Use the search bar above to find content</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsTab;
