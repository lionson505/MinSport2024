export function transformRequestData(data) {
  // Convert dates to ISO strings
  const transformed = { ...data };
  Object.keys(transformed).forEach(key => {
    if (transformed[key] instanceof Date) {
      transformed[key] = transformed[key].toISOString();
    }
  });
  return transformed;
}

export function transformFormData(data) {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      // Handle array fields (like multiple files)
      data[key].forEach(item => {
        if (item instanceof File) {
          formData.append(key, item);
        } else {
          formData.append(key, JSON.stringify(item));
        }
      });
    } else if (data[key] instanceof File) {
      // Handle single file
      formData.append(key, data[key]);
    } else if (data[key] instanceof Date) {
      // Handle dates
      formData.append(key, data[key].toISOString());
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      // Handle nested objects
      formData.append(key, JSON.stringify(data[key]));
    } else {
      // Handle primitive values
      formData.append(key, data[key]);
    }
  });

  return formData;
} 