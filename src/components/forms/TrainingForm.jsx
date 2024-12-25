import { useState } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useToast } from '../../contexts/ToastContext';

const validationRules = {
  title: {
    required: true,
    minLength: 3
  },
  period: {
    required: true,
    pattern: /^\d{2}\/\d{2}\/\d{2}- \d{2}\/\d{2}\/\d{2}$/,
    message: 'Use format: DD/MM/YY-DD/MM/YY'
  },
  organiser: {
    required: true
  },
  participants: {
    required: true,
    pattern: /^\d+$/,
    message: 'Must be a number'
  }
};

function TrainingForm({ training, onSubmit, onCancel }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    resetForm
  } = useFormValidation(
    training || {
      title: '',
      period: '',
      organiser: 'MINISPORTS',
      participants: '',
      status: 'On going'
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(values);
      showToast('Training saved successfully');
      resetForm();
    } catch (error) {
      showToast('Failed to save training', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Training Title
          </label>
          <input
            type="text"
            name="title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.title && touched.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[#E2E7F0] focus:ring-[#4318FF]'
            } focus:outline-none focus:ring-2`}
            placeholder="Enter training title"
          />
          {errors.title && touched.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Training Period
          </label>
          <input
            type="text"
            name="period"
            value={values.period}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.period && touched.period
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[#E2E7F0] focus:ring-[#4318FF]'
            } focus:outline-none focus:ring-2`}
            placeholder="DD/MM/YY-DD/MM/YY"
          />
          {errors.period && touched.period && (
            <p className="mt-1 text-sm text-red-500">{errors.period}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Training Organiser
          </label>
          <input
            type="text"
            name="organiser"
            value={values.organiser}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.organiser && touched.organiser
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[#E2E7F0] focus:ring-[#4318FF]'
            } focus:outline-none focus:ring-2`}
          />
          {errors.organiser && touched.organiser && (
            <p className="mt-1 text-sm text-red-500">{errors.organiser}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Participants
          </label>
          <input
            type="text"
            name="participants"
            value={values.participants}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.participants && touched.participants
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[#E2E7F0] focus:ring-[#4318FF]'
            } focus:outline-none focus:ring-2`}
            placeholder="Number of participants"
          />
          {errors.participants && touched.participants && (
            <p className="mt-1 text-sm text-red-500">{errors.participants}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Status
          </label>
          <select
            name="status"
            value={values.status}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-[#E2E7F0] focus:outline-none focus:ring-2 focus:ring-[#4318FF]"
          >
            <option value="On going">On going</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-[#E2E7F0] text-[#A3AED0] hover:bg-[#F4F7FE]"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-[#4318FF] text-white hover:bg-[#3311CC] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default TrainingForm; 