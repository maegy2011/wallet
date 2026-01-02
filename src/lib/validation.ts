import { useState } from 'react';
import { errorHandler } from './errorHandler';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  static validate(data: Record<string, any>, rules: ValidationRules): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      const fieldErrors: string[] = [];

      // Required validation
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field} is required`);
        continue;
      }

      // Skip other validations if field is empty and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Type-specific validations
      if (typeof value === 'string') {
        // Min length
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(`${field} must be at least ${rule.minLength} characters long`);
        }

        // Max length
        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(`${field} must not exceed ${rule.maxLength} characters`);
        }

        // Email validation
        if (rule.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            fieldErrors.push(`${field} must be a valid email address`);
          }
        }

        // Phone validation
        if (rule.phone) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            fieldErrors.push(`${field} must be a valid phone number`);
          }
        }

        // URL validation
        if (rule.url) {
          try {
            new URL(value);
          } catch {
            fieldErrors.push(`${field} must be a valid URL`);
          }
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(`${field} format is invalid`);
        }
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          fieldErrors.push(customError);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors.join(', ');
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Common validation rules
  static rules = {
    email: {
      required: true,
      email: true,
      maxLength: 255
    } as ValidationRule,

    password: {
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      custom: (value: string) => {
        if (!/(?=.*[a-z])/.test(value)) {
          return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(value)) {
          return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(value)) {
          return 'Password must contain at least one number';
        }
        return null;
      }
    } as ValidationRule,

    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\u0600-\u06FF]+$/
    } as ValidationRule,

    phone: {
      required: true,
      phone: true
    } as ValidationRule,

    subject: {
      required: true,
      minLength: 3,
      maxLength: 200
    } as ValidationRule,

    message: {
      required: true,
      minLength: 10,
      maxLength: 1000
    } as ValidationRule
  };
}

// React hook for form validation
export function useValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (field: string, value: any) => {
    const fieldRules = { [field]: rules[field] };
    const result = FormValidator.validate({ [field]: value }, fieldRules);
    
    setErrors(prev => ({
      ...prev,
      [field]: result.errors[field] || ''
    }));

    return !result.errors[field];
  };

  const validateForm = () => {
    const result = FormValidator.validate(values, rules);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result.isValid;
  };

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, values[field]);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
  };

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm
  };
}