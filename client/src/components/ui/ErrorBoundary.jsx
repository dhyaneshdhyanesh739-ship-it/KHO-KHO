import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary]', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-court-sand flex items-center justify-center p-6 text-navy-900">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="font-editorial text-2xl font-bold text-navy-900">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected render error occurred. Our automated error boundary caught it:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-xs text-rose-700 overflow-x-auto max-h-40">
              {this.state.error?.message || String(this.state.error)}
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary py-2.5 px-6 text-xs inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
