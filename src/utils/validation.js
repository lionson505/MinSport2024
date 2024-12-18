export const validateInfrastructureForm = (formData) => {
  const errors = {};

  // Basic Information
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  if (!formData.subCategory) {
    errors.subCategory = 'Sub Category is required';
  }

  if (!formData.type) {
    errors.type = 'Type/Level is required';
  }

  if (!formData.capacity) {
    errors.capacity = 'Capacity is required';
  } else if (isNaN(formData.capacity) || formData.capacity <= 0) {
    errors.capacity = 'Capacity must be a positive number';
  }

  // Location
  if (!formData.location.province) {
    errors['location.province'] = 'Province is required';
  }

  if (!formData.location.district) {
    errors['location.district'] = 'District is required';
  }

  // Coordinates
  if (!formData.coordinates.latitude) {
    errors['coordinates.latitude'] = 'Latitude is required';
  } else if (isNaN(formData.coordinates.latitude)) {
    errors['coordinates.latitude'] = 'Invalid latitude format';
  }

  if (!formData.coordinates.longitude) {
    errors['coordinates.longitude'] = 'Longitude is required';
  } else if (isNaN(formData.coordinates.longitude)) {
    errors['coordinates.longitude'] = 'Invalid longitude format';
  }

  // Plot Area
  if (!formData.plotArea) {
    errors.plotArea = 'Plot area is required';
  } else if (isNaN(formData.plotArea) || formData.plotArea <= 0) {
    errors.plotArea = 'Plot area must be a positive number';
  }

  // Legal Representative
  if (!formData.legalRepresentative.name?.trim()) {
    errors['legalRepresentative.name'] = 'Legal representative name is required';
  }

  if (!formData.legalRepresentative.email?.trim()) {
    errors['legalRepresentative.email'] = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.legalRepresentative.email)) {
    errors['legalRepresentative.email'] = 'Invalid email format';
  }

  if (!formData.legalRepresentative.phone?.trim()) {
    errors['legalRepresentative.phone'] = 'Phone number is required';
  } else if (!/^\+?[0-9]{10,}$/.test(formData.legalRepresentative.phone)) {
    errors['legalRepresentative.phone'] = 'Invalid phone number format';
  }

  return errors;
}; 