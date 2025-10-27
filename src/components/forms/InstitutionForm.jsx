import { useState, useEffect } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useToast } from '../../contexts/ToastContext';
import { locations } from '../../data/locations';

const validationRules = {
  name: {
    required: true,
    minLength: 3
  },
  category: {
    required: true
  },
  location: {
    required: true,
    fields: {
      province: { required: true },
      district: { required: true },
      sector: { required: true },
      cell: { required: true },
      village: { required: true }
    }
  },
  SchoolRepresentativeName: {
    required: true
  },
  SchoolRepresentativeGender: {
    required: true
  },
  SchoolRepresentativeEmail: {
    required: true,
    email: true
  },
  SchoolRepresentativePhone: {
    required: true
  }
};

function InstitutionForm({ institution, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const initialValues = {
    name: '',
    category: '',
    location: {
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: ''
    },
    SchoolRepresentativeName: '',
    SchoolRepresentativeGender: '',
    SchoolRepresentativeEmail: '',
    SchoolRepresentativePhone: '',
    // New fields
    sportsDisciplines: [], // string[]
    sections: {}, // { [discipline: string]: string[] }
    ...institution
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    resetForm,
    setValues
  } = useFormValidation(initialValues, validationRules);

  const categories = ['District Center Of Excellence', 'Regional Center Of Excellence', 'National Center Of Excellence'];
  const genders = ['Female', 'Male'];

  // Keep form in sync when editing existing institution
  useEffect(() => {
    if (institution) {
      // Transform API data structure to form structure
      const transformedInstitution = {
        name: institution.name || '',
        category: institution.category || '',
        location: {
          province: institution.location_province || institution.location?.province || '',
          district: institution.location_district || institution.location?.district || '',
          sector: institution.location_sector || institution.location?.sector || '',
          cell: institution.location_cell || institution.location?.cell || '',
          village: institution.location_village || institution.location?.village || '',
        },
        SchoolRepresentativeName: institution.legalRepresentativeName || institution.SchoolRepresentativeName || '',
        SchoolRepresentativeGender: institution.legalRepresentativeGender || institution.SchoolRepresentativeGender || '',
        SchoolRepresentativeEmail: institution.legalRepresentativeEmail || institution.SchoolRepresentativeEmail || '',
        SchoolRepresentativePhone: institution.legalRepresentativePhone || institution.SchoolRepresentativePhone || '',
        sportsDisciplines: institution.sportsDisciplines || [],
        sections: institution.sections || {},
      };

      setValues(transformedInstitution);
    }
  }, [institution, setValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the highlighted errors', 'error');
      return;
    }

    // Extra nested validation for location
    const { province, district, sector, cell, village } = values.location || {};
    if (!province || !district || !sector || !cell || !village) {
      showToast('Please complete all location fields (province, district, sector, cell, village)', 'error');
      return;
    }

    // Ensure submit handler exists
    if (typeof onSubmit !== 'function') {
      console.error('InstitutionForm: onSubmit prop is not a function');
      showToast('Internal error: submit handler missing', 'error');
      return;
    }

    setLoading(true);
    try {
      console.debug('InstitutionForm: submitting values', values);
      // Transform payload to API expected shape
      const payload = {
        name: values.name,
        category: values.category,
        // Transform nested location object to flat structure for API
        location_province: values.location.province,
        location_district: values.location.district,
        location_sector: values.location.sector,
        location_cell: values.location.cell,
        location_village: values.location.village,
        // Transform SchoolRepresentative fields to legalRepresentative fields for API
        legalRepresentativeName: values.SchoolRepresentativeName,
        legalRepresentativeGender: values.SchoolRepresentativeGender,
        legalRepresentativeEmail: values.SchoolRepresentativeEmail,
        legalRepresentativePhone: values.SchoolRepresentativePhone,
        sportsDisciplines: values.sportsDisciplines,
        sections: values.sections,
      };
      await onSubmit(payload);
      showToast('Institution saved successfully');
      resetForm();
      if (onCancel) onCancel();
    } catch (error) {
      console.error('InstitutionForm: submit error', error);
      showToast('Failed to save institution', 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    const locationKey = name.split('.')[1];
    const updatedLocation = { ...values.location, [locationKey]: value };

    if (locationKey === 'province') {
      updatedLocation.district = '';
      updatedLocation.sector = '';
      updatedLocation.cell = '';
      updatedLocation.village = '';
    } else if (locationKey === 'district') {
      updatedLocation.sector = '';
      updatedLocation.cell = '';
      updatedLocation.village = '';
    } else if (locationKey === 'sector') {
      updatedLocation.cell = '';
      updatedLocation.village = '';
    } else if (locationKey === 'cell') {
      updatedLocation.village = '';
    }

    handleChange({ target: { name: 'location', value: updatedLocation } });
  };

  const inputClassName = "h-12 w-full px-4 border border-gray-300 rounded-md";

  // Sports discipline options
  const disciplineOptions = [
    'Football',
    'Volleyball',
    'Basketball',
    'Handball',
    'Cycling',
    'Athletics',
    'Sitting Volleyball',
    'Goalball'
  ];

  const genderSections = ['Male', 'Female'];
  const isMixedOnly = (d) => ['Cycling', 'Goalball', 'Athletics'].includes(d);

  const handleDisciplineToggle = (discipline) => {
    const already = values.sportsDisciplines.includes(discipline);
    const selected = already
      ? values.sportsDisciplines.filter((d) => d !== discipline)
      : [...values.sportsDisciplines, discipline];

    const nextSections = { ...values.sections };
    // Cleanup removed discipline sections
    Object.keys(nextSections).forEach((key) => {
      if (!selected.includes(key)) delete nextSections[key];
    });
    // Initialize for newly added
    if (!already && !nextSections[discipline]) {
      nextSections[discipline] = isMixedOnly(discipline) ? ['Mixed'] : [];
    }

    handleChange({ target: { name: 'sportsDisciplines', value: selected } });
    handleChange({ target: { name: 'sections', value: nextSections } });
  };

  const handleSectionToggle = (discipline, section) => {
    const current = values.sections[discipline] || [];
    let updated;
    if (current.includes(section)) {
      updated = current.filter((s) => s !== section);
    } else {
      updated = [...current, section];
    }
    const next = { ...values.sections, [discipline]: updated };
    handleChange({ target: { name: 'sections', value: next } });
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Institution Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    placeholder="Enter institution name"
                  />
                  {errors.name && touched.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Domain removed as requested */}

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Levels
                  </label>
                  <select
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select Level</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                {/* Sports Discipline */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Sports Discipline
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {disciplineOptions.map((d) => (
                      <label key={d} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={values.sportsDisciplines.includes(d)}
                          onChange={() => handleDisciplineToggle(d)}
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sections/Teams per discipline */}
                {values.sportsDisciplines?.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Sections / Teams
                    </label>
                    <div className="space-y-2">
                      {values.sportsDisciplines.map((d) => (
                        <div key={d} className="border rounded-md p-3">
                          <div className="font-medium text-gray-800 mb-2">{d}</div>
                          {isMixedOnly(d) ? (
                            <div className="text-sm text-gray-600">
                              Mixed
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              {genderSections.map((g) => (
                                <label key={g} className="inline-flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={(values.sections[d] || []).includes(g)}
                                    onChange={() => handleSectionToggle(d, g)}
                                  />
                                  <span>{g}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Details</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Province */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Province
                  </label>
                  <select
                    name="location.province"
                    value={values.location?.province || ''}
                    onChange={handleLocationChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                  >
                    <option value="">Select Province</option>
                    {locations.provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <select
                    name="location.district"
                    value={values.location?.district || ''}
                    onChange={handleLocationChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    disabled={!values.location.province}
                  >
                    <option value="">Select District</option>
                    {locations.districts[values.location.province]?.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sector */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Sector
                  </label>
                  <select
                    name="location.sector"
                    value={values.location?.sector || ''}
                    onChange={handleLocationChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    disabled={!values.location.district}
                  >
                    <option value="">Select Sector</option>
                    {locations.sectors[values.location.district]?.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cell */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Cell
                  </label>
                  <select
                    name="location.cell"
                    value={values.location?.cell || ''}
                    onChange={handleLocationChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    disabled={!values.location.sector}
                  >
                    <option value="">Select Cell</option>
                    {locations.cells[values.location.sector]?.map((cell) => (
                      <option key={cell} value={cell}>
                        {cell}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Village */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Village
                  </label>
                  <select
                    name="location.village"
                    value={values.location?.village || ''}
                    onChange={handleLocationChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    disabled={!values.location.cell}
                  >
                    <option value="">Select Village</option>
                    {locations.villages[values.location.cell]?.map((village) => (
                      <option key={village} value={village}>
                        {village}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* School Representative Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">School Representative Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    School Representative Name
                  </label>
                  <input
                    type="text"
                    name="SchoolRepresentativeName"
                    value={values.SchoolRepresentativeName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    placeholder="Enter School representative name"
                  />
                  {errors.SchoolRepresentativeName && touched.SchoolRepresentativeName && (
                    <p className="text-sm text-red-500">{errors.SchoolRepresentativeName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    School Representative Gender
                  </label>
                  <select
                    name="SchoolRepresentativeGender"
                    value={values.SchoolRepresentativeGender}
                    onChange={handleChange}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select Gender</option>
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                  {errors.SchoolRepresentativeGender && (
                    <p className="text-sm text-red-500">{errors.SchoolRepresentativeGender}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    School Representative Email
                  </label>
                  <input
                    type="email"
                    name="SchoolRepresentativeEmail"
                    value={values.SchoolRepresentativeEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    placeholder="Enter School representative email"
                  />
                  {errors.SchoolRepresentativeEmail && touched.SchoolRepresentativeEmail && (
                    <p className="text-sm text-red-500">{errors.SchoolRepresentativeEmail}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    School Representative Phone
                  </label>
                  <input
                    type="text"
                    name="SchoolRepresentativePhone"
                    value={values.SchoolRepresentativePhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClassName}
                    placeholder="Enter School representative phone"
                  />
                  {errors.SchoolRepresentativePhone && touched.SchoolRepresentativePhone && (
                    <p className="text-sm text-red-500">{errors.SchoolRepresentativePhone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 px-6 py-4 bg-gray-50 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Saving...' : 'Save Institution'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InstitutionForm;
