export const reportError = (error, context = {}) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Report:', {
      error,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }

  // You could also send to an error reporting service
  // like Sentry, LogRocket, etc.
}; 