/**
 * Enhanced useForm Hook with Either-Based Validation
 *
 * Integrates functional validation with React state management.
 * Combines existing useFormSubmit hook with Either-based validation system.
 *
 * Features:
 * - Type-safe field validation
 * - Real-time validation on blur/change
 * - Field-level error tracking
 * - Form-level submission handling
 * - Integration with existing Result monad patterns
 *
 * @example
 * ```typescript
 * const loginForm = useForm({
 *   initialValues: { email: '', password: '' },
 *   validators: {
 *     email: composeValidators(required('Email'), validateEmail),
 *     password: composeValidators(required('Password'), minLength(8, 'Password'))
 *   },
 *   onSubmit: async (values) => {
 *     await api.auth.login(values.email, values.password);
 *   }
 * });
 *
 * <form onSubmit={loginForm.handleSubmit}>
 *   <input {...loginForm.register('email')} />
 *   {loginForm.errors.email && <FormError message={loginForm.errors.email} />}
 * </form>
 * ```
 */

import { useState, useCallback, FormEvent, ChangeEvent, FocusEvent } from 'react';
import { isLeft } from '@/lib/api/functional/either';
import {
  type Validator,
  type FieldErrors,
  validateFields,
  getFieldErrors,
  hasFieldError,
  getFirstErrors,
} from '@/lib/utils/functional/validation';
import { useFormSubmit } from './useFormSubmit';

/**
 * Form configuration options
 */
export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validators?: Partial<Record<keyof T, Validator<T[keyof T]>>>;
  onSubmit: (values: T) => Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

/**
 * Form state and handlers
 */
export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: FieldErrors<T>;
  touched: Record<keyof T, boolean>;
  isValidating: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;

  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: keyof T) => (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, errors: string[]) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  clearErrors: () => void;

  register: (field: keyof T) => {
    name: string;
    value: T[keyof T];
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };

  getFieldError: (field: keyof T) => string | undefined;
  hasError: (field: keyof T) => boolean;
  isTouched: (field: keyof T) => boolean;
}

/**
 * Enhanced form hook with Either-based validation
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validators = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
  resetOnSubmit = false,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isValidating, setIsValidating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { isLoading: isSubmitting, handleSubmit: submitForm } = useFormSubmit(async () => {
    const isValid = validateForm();
    if (isValid) {
      await onSubmit(values);
      if (resetOnSubmit) {
        resetForm();
      }
    } else {
      throw new Error('Form validation failed');
    }
  });

  const validateField = useCallback(
    (field: keyof T): boolean => {
      const validator = validators[field];
      if (!validator) {
        return true;
      }

      setIsValidating(true);
      const result = validator(values[field]);
      setIsValidating(false);

      if (isLeft(result)) {
        setErrors(prev => ({ ...prev, [field]: result.left }));
        return false;
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      }
    },
    [validators, values]
  );

  const validateForm = useCallback((): boolean => {
    if (Object.keys(validators).length === 0) {
      return true;
    }

    setIsValidating(true);
    const result = validateFields(validators as any)(values);
    setIsValidating(false);

    if (isLeft(result)) {
      setErrors(result.left);
      return false;
    } else {
      setErrors({});
      return true;
    }
  }, [validators, values]);

  const handleChange = useCallback(
    (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value as T[keyof T];
      setValues(prev => ({ ...prev, [field]: newValue }));
      setIsDirty(true);

      if (validateOnChange && validators[field]) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, validators, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTouched(prev => ({ ...prev, [field]: true }));

      if (validateOnBlur && validators[field]) {
        validateField(field);
      }
    },
    [validateOnBlur, validators, validateField]
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      submitForm();
    },
    [values, submitForm]
  );

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = useCallback((field: keyof T, fieldErrors: string[]) => {
    setErrors(prev => ({ ...prev, [field]: fieldErrors }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
    setIsDirty(false);
  }, [initialValues]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const register = useCallback(
    (field: keyof T) => ({
      name: String(field),
      value: values[field],
      onChange: handleChange(field),
      onBlur: handleBlur(field),
    }),
    [values, handleChange, handleBlur]
  );

  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      const fieldErrors = getFieldErrors(errors, field);
      return fieldErrors.length > 0 ? fieldErrors[0] : undefined;
    },
    [errors]
  );

  const hasError = useCallback(
    (field: keyof T): boolean => hasFieldError(errors, field) && !!touched[field],
    [errors, touched]
  );

  const isTouched = useCallback(
    (field: keyof T): boolean => !!touched[field],
    [touched]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValidating,
    isSubmitting,
    isValid,
    isDirty,

    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    clearErrors,

    register,
    getFieldError,
    hasError,
    isTouched,
  };
}

/**
 * Simpler form hook for basic use cases (just validation, no submission)
 *
 * @example
 * ```typescript
 * const form = useFormValidation({
 *   initialValues: { email: '' },
 *   validators: { email: validateEmail }
 * });
 * ```
 */
export function useFormValidation<T extends Record<string, any>>(options: {
  initialValues: T;
  validators?: Partial<Record<keyof T, Validator<T[keyof T]>>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}) {
  return useForm({
    ...options,
    onSubmit: async () => {},
  });
}
