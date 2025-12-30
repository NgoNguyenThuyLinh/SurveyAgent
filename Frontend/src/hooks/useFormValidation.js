import { useState } from 'react';

// Simple form validation hook
export function useFormValidation({ initialValues = {}, validations = {} }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    validateField(name);
  };

  const validateField = (fieldName) => {
    const fieldValidations = validations[fieldName];
    if (!fieldValidations) return true;

    const fieldErrors = [];
    const value = values[fieldName];

    // Check each validation rule
    Object.entries(fieldValidations).forEach(([ruleName, rule]) => {
      if (typeof rule === 'function') {
        const error = rule(value);
        if (error) {
          fieldErrors.push(error);
        }
      } else if (typeof rule === 'object' && rule.validate) {
        const error = rule.validate(value);
        if (error) {
          fieldErrors.push(error);
        }
      }
    });

    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }));

    return fieldErrors.length === 0;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validations).forEach(fieldName => {
      const fieldValidations = validations[fieldName];
      const fieldErrors = [];
      const value = values[fieldName];

      Object.entries(fieldValidations).forEach(([ruleName, rule]) => {
        if (typeof rule === 'function') {
          const error = rule(value);
          if (error) {
            fieldErrors.push(error);
            isValid = false;
          }
        } else if (typeof rule === 'object' && rule.validate) {
          const error = rule.validate(value);
          if (error) {
            fieldErrors.push(error);
            isValid = false;
          }
        }
      });

      newErrors[fieldName] = fieldErrors;
      
      // Mark field as touched
      setTouched(prev => ({
        ...prev,
        [fieldName]: true
      }));
    });

    setErrors(newErrors);
    return isValid;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateForm
  };
}

