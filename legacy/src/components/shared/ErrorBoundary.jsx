import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { createPageUrl } from "@/utils";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Send error to monitoring service (implement your error tracking here)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, send to error tracking service
    // e.g., Sentry, LogRocket, etc.
    try {
      const errorData = {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      console.error('Error logged:', errorData);
      
      // Example: Send to your backend
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   body: JSON.stringify(errorData),
      //   headers: { 'Content-Type': 'application/json' }
      // });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = createPageUrl('Home');
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-2 border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-900">Something went wrong</CardTitle>
                  <p className="text-sm text-red-700 mt-1">
                    We're sorry, but an unexpected error occurred.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User-friendly message */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">What happened?</h3>
                <p className="text-sm text-red-800">
                  The application encountered an unexpected error and couldn't complete your request. 
                  This has been automatically logged and our team will investigate.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={this.handleReset}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Tips */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What can you do?</h4>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Click "Try Again" to continue where you left off</li>
                  <li>If the error persists, try reloading the page</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try using a different browser</li>
                  <li>Contact support if the issue continues</li>
                </ul>
              </div>

              {/* Error count warning */}
              {errorCount > 2 && (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 inline mr-2" />
                  <span className="text-sm text-yellow-800 font-semibold">
                    Multiple errors detected. Consider reloading the page or contacting support.
                  </span>
                </div>
              )}

              {/* Technical details (development only) */}
              {isDevelopment && error && (
                <details className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-gray-900 mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-semibold text-gray-700 text-sm mb-1">Error Message:</h5>
                      <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                        {error.toString()}
                      </pre>
                    </div>
                    {error.stack && (
                      <div>
                        <h5 className="font-semibold text-gray-700 text-sm mb-1">Stack Trace:</h5>
                        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-48 overflow-y-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <h5 className="font-semibold text-gray-700 text-sm mb-1">Component Stack:</h5>
                        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-48 overflow-y-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Support contact */}
              <div className="text-center text-sm text-gray-600">
                <p>Need help? Contact support at{' '}
                  <a href="mailto:support@abrinsight.ca" className="text-teal-600 hover:underline">
                    support@abrinsight.ca
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;