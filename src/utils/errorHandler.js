export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export function handleAPIError(error) {
  if (error instanceof APIError) {
    return error;
  }

  if (error.response) {
    return new APIError(
      error.response.data.message || 'An error occurred',
      error.response.status,
      error.response.data
    );
  }

  if (error.request) {
    return new APIError(
      'Network error. Please check your connection.',
      0
    );
  }

  return new APIError(
    error.message || 'An error occurred',
    0
  );
}

export function getErrorMessage(error) {
  if (error instanceof APIError) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
} 