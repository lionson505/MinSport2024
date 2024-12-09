import { useState } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useToast } from '../../contexts/ToastContext';
import { locations } from '../../data/locations';

const validationRules = {
  name: {
    required: true,
    minLength: 3
  },
  domain: {
    required: true
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
  legalRepresentativeName: {
    required: true
  },
  legalRepresentativeGender: {
    required: true
  },
  legalRepresentativeEmail: {
    required: true,
    email: true
  },
  legalRepresentativePhone: {
    required: true
  }
};

function InstitutionForm({ institution, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const initialValues = {
    name: '',
    domain: '',
    category: 'EXCELLENCE SCHOOL',
    location: {
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: ''
    },
    legalRepresentativeName: '',
    legalRepresentativeGender: 'Male',
    legalRepresentativeEmail: '',
    legalRepresentativePhone: '',
    ...institution
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    resetForm
  } = useFormValidation(initialValues, validationRules);

  const categories = ['EXCELLENCE SCHOOL', 'REGULAR SCHOOL', 'SPECIAL SCHOOL'];
  const genders = ['Male', 'Female'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(values);
      showToast('Institution saved successfully');
      resetForm();
    } catch (error) {
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

  const inputClasses = (error, touched) => `
    w-full px-4 py-2.5 rounded-lg border text-sm
    ${error && touched ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
    focus:outline-none focus:ring-2 transition-colors
  `;

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className={inputClasses(errors.name, touched.name)}
                    placeholder="Enter institution name"
                  />
                  {errors.name && touched.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Domain */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Domain
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={values.domain}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClasses(errors.domain, touched.domain)}
                    placeholder="Enter domain"
                  />
                  {errors.domain && touched.domain && (
                    <p className="text-sm text-red-500">{errors.domain}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                    className={inputClasses()}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className={inputClasses(errors.location?.province, touched.location?.province)}
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
                    className={inputClasses(errors.location?.district, touched.location?.district)}
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
                    className={inputClasses(errors.location?.sector, touched.location?.sector)}
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
                    className={inputClasses(errors.location?.cell, touched.location?.cell)}
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
                    className={inputClasses(errors.location?.village, touched.location?.village)}
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

            {/* Legal Representative Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Representative Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Legal Representative Name
                  </label>
                  <input
                    type="text"
                    name="legalRepresentativeName"
                    value={values.legalRepresentativeName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClasses(errors.legalRepresentativeName, touched.legalRepresentativeName)}
                    placeholder="Enter legal representative name"
                  />
                  {errors.legalRepresentativeName && touched.legalRepresentativeName && (
                    <p className="text-sm text-red-500">{errors.legalRepresentativeName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Legal Representative Gender
                  </label>
                  <select
                    name="legalRepresentativeGender"
                    value={values.legalRepresentativeGender}
                    onChange={handleChange}
                    className={inputClasses()}
                  >
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Legal Representative Email
                  </label>
                  <input
                    type="email"
                    name="legalRepresentativeEmail"
                    value={values.legalRepresentativeEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClasses(errors.legalRepresentativeEmail, touched.legalRepresentativeEmail)}
                    placeholder="Enter legal representative email"
                  />
                  {errors.legalRepresentativeEmail && touched.legalRepresentativeEmail && (
                    <p className="text-sm text-red-500">{errors.legalRepresentativeEmail}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Legal Representative Phone
                  </label>
                  <input
                    type="text"
                    name="legalRepresentativePhone"
                    value={values.legalRepresentativePhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClasses(errors.legalRepresentativePhone, touched.legalRepresentativePhone)}
                    placeholder="Enter legal representative phone"
                  />
                  {errors.legalRepresentativePhone && touched.legalRepresentativePhone && (
                    <p className="text-sm text-red-500">{errors.legalRepresentativePhone}</p>
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
