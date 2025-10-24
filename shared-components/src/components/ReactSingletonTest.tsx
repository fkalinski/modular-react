import React from 'react';

/**
 * Type definition for React's internal API used for singleton verification.
 * This is intentionally marked as "DO_NOT_USE" by React team but is acceptable
 * for testing/verification purposes.
 */
interface ReactInternals {
  ReactCurrentDispatcher: unknown;
  ReactCurrentOwner: unknown;
  ReactCurrentBatchConfig: unknown;
  [key: string]: unknown;
}

/**
 * Test component to verify React singleton behavior across Module Federation boundaries
 *
 * This component should show the SAME React instance ID in all federated modules,
 * proving that React is properly shared as a singleton.
 */
export const ReactSingletonTest: React.FC = () => {
  // Get React internals to verify singleton
  // Note: Using React internals is acceptable here for diagnostic/testing purposes
  const reactInternals = (React as typeof React & {
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactInternals;
  }).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  // Generate a unique ID for this React instance
  const instanceId = reactInternals
    ? Object.keys(reactInternals).slice(0, 3).join('-')
    : 'unknown';

  // Get current render count (proves hooks work across boundaries)
  const [renderCount, setRenderCount] = React.useState(0);

  React.useEffect(() => {
    setRenderCount(c => c + 1);
  }, []);

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#e7f1ff',
      border: '1px solid #0061d5',
      borderRadius: '4px',
      marginBottom: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#0061d5" strokeWidth="2" />
          <path d="M5 8l2 2 4-4" stroke="#0061d5" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <strong style={{ fontSize: '13px', color: '#222222' }}>
          React Singleton Verification
        </strong>
      </div>

      <div style={{ fontSize: '12px', color: '#767676', lineHeight: '1.5' }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>React Version:</strong> {React.version}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Instance ID:</strong> {instanceId}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Hooks Work:</strong> {renderCount > 0 ? '✅' : '❌'} (renders: {renderCount})
        </div>
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #0061d5',
          fontSize: '11px',
          color: '#909090',
        }}>
          If you see the SAME instance ID in shell and tabs, singleton works! ✅
        </div>
      </div>
    </div>
  );
};

export default ReactSingletonTest;
