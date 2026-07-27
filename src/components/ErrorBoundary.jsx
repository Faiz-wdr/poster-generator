import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', minHeight: '100vh', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#F8FAFC',
          padding: 24, textAlign: 'center', fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: 8, color: '#0F172A', fontWeight: 800 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748B', marginBottom: 20, maxWidth: 440, fontSize: '0.95rem' }}>
            An unexpected error occurred while loading this view. Please refresh to reload your dashboard.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', background: '#7C3AED', color: '#FFFFFF',
              border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
