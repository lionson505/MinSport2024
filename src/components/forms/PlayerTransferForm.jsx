import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import toast from 'react-hot-toast';

const PlayerTransferForm = ({ initialData, onSubmit, onzCancel, isSubmitting }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = React.useState({
    federation: initialData?.federation || '',
    clubFrom: initialData?.clubFrom || '',
    playerStaff: initialData?.playerStaff || '',
    clubTo: initialData?.clubTo || '',
    transferDate: {
      month: initialData?.transferDate?.month || '',
      year: initialData?.transferDate?.year || ''
    },
    comments: initialData?.comments || '',
    transferType: initialData?.transferType || 'permanent', // permanent or loan
    transferFee: initialData?.transferFee || '',
    contractDuration: initialData?.contractDuration || '',
    status: initialData?.status || 'pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await onSubmit(formData);
      if (response) {
        toast.success('Transfer request submitted successfully!');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit transfer request. Please try again.');
    }
  };

  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-200' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClasses = `block text-sm font-medium mb-1 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;

  // Generate months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years array (current year + 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Federation Selection */}
      <div>
        <label htmlFor="federation" className={labelClasses}>Federation</label>
        <select
          id="federation"
          name="federation"
          value={formData.federation}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="">Select Federation</option>
          <option value="FERWAFA">FERWAFA</option>
          <option value="FERWABA">FERWABA</option>
          <option value="FRVB">FRVB</option>
        </select>
      </div>

      {/* Club From */}
      <div>
        <label htmlFor="clubFrom" className={labelClasses}>Club From</label>
        <select
          id="clubFrom"
          name="clubFrom"
          value={formData.clubFrom}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="">Select Club</option>
          <option value="APR FC">APR FC</option>
          <option value="Rayon Sports">Rayon Sports</option>
          <option value="Police FC">Police FC</option>
        </select>
      </div>

      {/* Player/Staff Selection */}
      <div>
        <label htmlFor="playerStaff" className={labelClasses}>Player/Staff</label>
        <select
          id="playerStaff"
          name="playerStaff"
          value={formData.playerStaff}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="">Select Player/Staff</option>
          {/* Options will be populated based on selected club */}
        </select>
      </div>

      {/* Club To */}
      <div>
        <label htmlFor="clubTo" className={labelClasses}>Club To</label>
        <select
          id="clubTo"
          name="clubTo"
          value={formData.clubTo}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="">Select Club</option>
          <option value="APR FC">APR FC</option>
          <option value="Rayon Sports">Rayon Sports</option>
          <option value="Police FC">Police FC</option>
        </select>
      </div>

      {/* Transfer Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="transferDate.month" className={labelClasses}>Month</label>
          <select
            id="transferDate.month"
            name="transferDate.month"
            value={formData.transferDate.month}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Month</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="transferDate.year" className={labelClasses}>Year</label>
          <select
            id="transferDate.year"
            name="transferDate.year"
            value={formData.transferDate.year}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transfer Type */}
      <div>
        <label htmlFor="transferType" className={labelClasses}>Transfer Type</label>
        <select
          id="transferType"
          name="transferType"
          value={formData.transferType}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="permanent">Permanent Transfer</option>
          <option value="loan">Loan</option>
        </select>
      </div>

      {/* Contract Duration (if loan) */}
      {formData.transferType === 'loan' && (
        <div>
          <label htmlFor="contractDuration" className={labelClasses}>Loan Duration (months)</label>
          <input
            type="number"
            id="contractDuration"
            name="contractDuration"
            value={formData.contractDuration}
            onChange={handleChange}
            className={inputClasses}
            min="1"
            max="24"
            required
          />
        </div>
      )}

      {/* Transfer Fee */}
      <div>
        <label htmlFor="transferFee" className={labelClasses}>Transfer Fee (RWF)</label>
        <input
          type="number"
          id="transferFee"
          name="transferFee"
          value={formData.transferFee}
          onChange={handleChange}
          className={inputClasses}
          min="0"
        />
      </div>

      {/* Additional Comments */}
      <div>
        <label htmlFor="comments" className={labelClasses}>Additional Comments</label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          rows={4}
          className={inputClasses}
          placeholder="Enter any additional comments or notes about the transfer..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⌛</span>
              <span>Processing...</span>
            </>
          ) : (
            <span>Submit Transfer</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default PlayerTransferForm; 