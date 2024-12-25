import { useState, useCallback } from 'react';

export function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback((fieldValues = values) => {
    let tempErrors = {};
    Object.keys(fieldValues).forEach(key => {
      const value = fieldValues[key];
      const rules = validationRules[key];
      
      if (rules?.required && !value) {
        tempErrors[key] = 'This field is required';
      }
      
      if (rules?.minLength && value.length < rules.minLength) {
        tempErrors[key] = `Minimum ${rules.minLength} characters required`;
      }
      
      if (rules?.pattern && !rules.pattern.test(value)) {
        tempErrors[key] = rules.message || 'Invalid format';
      }
      
      if (rules?.custom) {
        const customError = rules.custom(value, fieldValues);
        if (customError) {
          tempErrors[key] = customError;
        }
      }
    });
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }, [validationRules, values]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validate({ [name]: value });
    }
  }, [touched, validate]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validate({ [name]: values[name] });
  }, [validate, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    resetForm,
    setValues
  };
} 