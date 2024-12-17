export function transformResponseData(data) {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => transformResponseData(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const transformed = { ...data };
    Object.keys(transformed).forEach(key => {
      // Convert ISO date strings to Date objects
      if (typeof transformed[key] === 'string' && isISODate(transformed[key])) {
        transformed[key] = new Date(transformed[key]);
      }
      // Transform nested objects/arrays
      else if (typeof transformed[key] === 'object' && transformed[key] !== null) {
        transformed[key] = transformResponseData(transformed[key]);
      }
    });
    return transformed;
  }

  return data;
}

function isISODate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d) && d.toISOString() === str;
}

export function normalizeResponseErrors(error) {
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection.',
      errors: {}
    };
  }

  const { data, status } = error.response;

  // Handle validation errors (typically 400)
  if (status === 400 && data.errors) {
    return {
      message: 'Validation error',
      errors: data.errors
    };
  }

  // Handle unauthorized errors (401)
  if (status === 401) {
    return {
      message: 'Please login to continue',
      errors: {}
    };
  }

  // Handle forbidden errors (403)
  if (status === 403) {
    return {
      message: 'You do not have permission to perform this action',
      errors: {}
    };
  }

  // Handle not found errors (404)
  if (status === 404) {
    return {
      message: 'The requested resource was not found',
      errors: {}
    };
  }

  // Handle server errors (500)
  if (status >= 500) {
    return {
      message: 'An unexpected error occurred. Please try again later.',
      errors: {}
    };
  }

  // Handle any other errors
  return {
    message: data.message || 'An unexpected error occurred',
    errors: data.errors || {}
  };
} 