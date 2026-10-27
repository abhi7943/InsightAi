import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error('InsightAI UI Error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            padding: '32px',
            background: '#ffffff',
            border: '1px solid #eaecf0',
            borderRadius: '20px',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '14px',
              background: '#fef3f2',
              color: '#d92d20',
            }}
          >
            <AlertTriangle size={23} />
          </div>

          <h2
            style={{
              margin: '0 0 8px',
              color: '#101828',
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              margin: '0 0 22px',
              color: '#667085',
              lineHeight: 1.6,
            }}
          >
            InsightAI encountered an unexpected screen error.
            Your saved data is not deleted.
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 0,
              borderRadius: '10px',
              padding: '11px 16px',
              background: '#111827',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={16} />
            Reload InsightAI
          </button>
        </div>
      </div>
    );
  }
}