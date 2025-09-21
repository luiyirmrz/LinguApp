/**
 * Custom hook for input validation using the InputValidationService
 * Provides real-time validation and sanitization
 */

import { useState, useCallback, useMemo } from 'react';
import { inputValidationService, ValidationRule, ValidationResult } from '@/services/security/inputValidationService';

export interface UseInputValidationOptions {
  rules: ValidationRule;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  sanitize?: boolean;
}

export interface UseInputValidationReturn {
  value: any;
  setValue: (value: any) => void;
  error: string | null;
  isValid: boolean;
  isDirty: boolean;
  sanitizedValue: any;
  validate: () => ValidationResult;
  reset: () => void;
  onBlur: () => void;
  onChange: (value: any) => void;
}

/**
 * Hook for validating a single input field
 */
export function useInputValidation(
  initialValue: any = '',
  options: UseInputValidationOptions
): UseInputValidationReturn {
  const {
    rules,
    validateOnChange = false,
    validateOnBlur = true,
    sanitize = true,
  } = options;

  const [value, setValueState] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);

  const validate = useCallback((): ValidationResult => {
    const result = inputValidationService.validateValue(value, rules);
    setLastValidation(result);
    return result;
  }, [value, rules]);

  const setValue = useCallback((newValue: any) => {
    setValueState(newValue);
    setIsDirty(true);
    
    if (validateOnChange) {
      validate();
    }
  }, [validateOnChange, validate]);

  const onChange = useCallback((newValue: any) => {
    setValue(newValue);
  }, [setValue]);

  const onBlur = useCallback(() => {
    if (validateOnBlur) {
      validate();
    }
  }, [validateOnBlur, validate]);

  const reset = useCallback(() => {
    setValueState(initialValue);
    setIsDirty(false);
    setLastValidation(null);
  }, [initialValue]);

  const error = useMemo(() => {
    if (!isDirty && !lastValidation) return null;
    return lastValidation?.errors[0] || null;
  }, [isDirty, lastValidation]);

  const isValid = useMemo(() => {
    if (!isDirty && !lastValidation) return true;
    return lastValidation?.isValid ?? true;
  }, [isDirty, lastValidation]);

  const sanitizedValue = useMemo(() => {
    return lastValidation?.sanitizedValue ?? value;
  }, [lastValidation, value]);

  return {
    value,
    setValue,
    error,
    isValid,
    isDirty,
    sanitizedValue,
    validate,
    reset,
    onBlur,
    onChange,
  };
}

/**
 * Hook for validating multiple form fields
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>);
  const [isDirty, setIsDirty] = useState(false);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validateField = useCallback((field: keyof T, value: any): ValidationResult => {
    const rule = validationRules[field];
    return inputValidationService.validateValue(value, rule);
  }, [validationRules]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
    let isValid = true;

    for (const field of Object.keys(validationRules) as Array<keyof T>) {
      const result = validateField(field, values[field]);
      newErrors[field] = result.errors[0] || null;
      if (!result.isValid) {
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Validate field on change
    const result = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: result.errors[0] || null }));
  }, [validateField]);

  const setTouchedField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string | null>);
    setIsDirty(false);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => error === null);
  }, [errors]);

  const sanitizedValues = useMemo(() => {
    const sanitized: Partial<T> = {};
    for (const field of Object.keys(validationRules) as Array<keyof T>) {
      const result = validateField(field, values[field]);
      sanitized[field] = result.sanitizedValue;
    }
    return sanitized as T;
  }, [values, validateField, validationRules]);

  return {
    values,
    errors,
    isValid,
    isDirty,
    touched,
    setValue,
    setTouchedField,
    validateAll,
    reset,
    sanitizedValues,
  };
}

/**
 * Hook for validating email input
 */
export function useEmailValidation(initialValue: string = '') {
  return useInputValidation(initialValue, {
    rules: {
      required: true,
      maxLength: 254,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      sanitize: true,
    },
    validateOnBlur: true,
  });
}

/**
 * Hook for validating password input
 */
export function usePasswordValidation(initialValue: string = '') {
  return useInputValidation(initialValue, {
    rules: {
      required: true,
      minLength: 8,
      maxLength: 128,
      custom: (value) => {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordPattern.test(value)) {
          return 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character';
        }
        return true;
      },
    },
    validateOnBlur: true,
  });
}

/**
 * Hook for validating username input
 */
export function useUsernameValidation(initialValue: string = '') {
  return useInputValidation(initialValue, {
    rules: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_-]{3,20}$/,
      sanitize: true,
    },
    validateOnBlur: true,
  });
}
