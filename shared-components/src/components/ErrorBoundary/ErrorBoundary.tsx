import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /**
   * Name of the component or module being wrapped
   * Used for better error messages
   */
  componentName?: string;
  /**
   * Fallback UI to show when error occurs
   */
  fallback?: ReactNode;
  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Whether to show error details in the UI
   * Should be false in production
   */
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches errors in child components and displays a fallback UI.
 * Particularly useful for wrapping federated modules to prevent
 * one module from crashing the entire app.
 *
 * @example
 * <ErrorBoundary
 *   componentName="Files Tab"
 *   onError={(error, info) => logToService(error, info)}
 * >
 *   <FilesTab />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: '#f7f7f8',
            border: '1px solid #e2e2e2',
            borderRadius: '4px',
            margin: '20px',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
              color: '#d32f2f',
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: 600,
              color: '#222222',
            }}
          >
            {this.props.componentName
              ? `${this.props.componentName} failed to load`
              : 'Something went wrong'}
          </h2>
          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: '#767676',
            }}
          >
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>

          {this.props.showDetails && this.state.error && (
            <details
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e2e2',
                borderRadius: '4px',
                textAlign: 'left',
                maxWidth: '600px',
                margin: '24px auto 0',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: '#0061d5',
                }}
              >
                Error Details
              </summary>
              <pre
                style={{
                  fontSize: '12px',
                  color: '#d32f2f',
                  overflow: 'auto',
                  backgroundColor: '#fef2f2',
                  padding: '12px',
                  borderRadius: '4px',
                  margin: '8px 0',
                }}
              >
                {this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <pre
                  style={{
                    fontSize: '11px',
                    color: '#767676',
                    overflow: 'auto',
                    backgroundColor: '#f7f7f8',
                    padding: '12px',
                    borderRadius: '4px',
                    margin: '8px 0',
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#0061d5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0052b4';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#0061d5';
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with ErrorBoundary
 *
 * @example
 * const SafeFilesTab = withErrorBoundary(FilesTab, { componentName: 'Files Tab' });
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...options}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
