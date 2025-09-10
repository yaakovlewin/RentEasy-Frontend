'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const validationMessageVariants = cva(
  'flex items-start gap-2 text-sm transition-all duration-200 animate-slide-down',
  {
    variants: {
      variant: {
        error: 'text-red-600',
        warning: 'text-yellow-600',
        success: 'text-green-600',
        info: 'text-blue-600'
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base'
      }
    },
    defaultVariants: {
      variant: 'error',
      size: 'default'
    }
  }
)

interface ValidationMessageProps extends VariantProps<typeof validationMessageVariants> {
  message: string
  className?: string
  showIcon?: boolean
  icon?: React.ReactNode
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  message,
  variant = 'error',
  size = 'default',
  className,
  showIcon = true,
  icon
}) => {
  const icons = {
    error: <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />,
    success: <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />,
    info: <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
  }

  const displayIcon = icon || (variant && icons[variant])

  return (
    <div className={cn(validationMessageVariants({ variant, size }), className)}>
      {showIcon && displayIcon}
      <span className="leading-relaxed">{message}</span>
    </div>
  )
}

// Field wrapper with validation state
interface FormFieldProps {
  children: React.ReactNode
  label?: string
  error?: string
  warning?: string
  success?: string
  info?: string
  required?: boolean
  className?: string
  labelClassName?: string
  description?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  warning,
  success,
  info,
  required,
  className,
  labelClassName,
  description
}) => {
  const fieldId = React.useId()
  
  // Determine field state
  const hasError = Boolean(error)
  const hasWarning = Boolean(warning) && !hasError
  const hasSuccess = Boolean(success) && !hasError && !hasWarning
  const hasInfo = Boolean(info) && !hasError && !hasWarning && !hasSuccess

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label 
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium transition-colors',
            hasError ? 'text-red-700' : 'text-gray-700',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-invalid': hasError,
          'aria-describedby': error ? `${fieldId}-error` : undefined
        })}
      </div>
      
      {/* Validation Messages */}
      <div className="min-h-[20px]">
        {error && (
          <ValidationMessage
            id={`${fieldId}-error`}
            message={error}
            variant="error"
            role="alert"
          />
        )}
        {warning && !error && (
          <ValidationMessage
            message={warning}
            variant="warning"
          />
        )}
        {success && !error && !warning && (
          <ValidationMessage
            message={success}
            variant="success"
          />
        )}
        {info && !error && !warning && !success && (
          <ValidationMessage
            message={info}
            variant="info"
          />
        )}
      </div>
    </div>
  )
}

// Multi-field validation summary
interface ValidationSummaryProps {
  errors: Record<string, string>
  title?: string
  className?: string
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  title = 'Please fix the following errors:',
  className
}) => {
  const errorEntries = Object.entries(errors).filter(([, error]) => error)
  
  if (errorEntries.length === 0) return null

  return (
    <div className={cn(
      'p-4 border border-red-200 bg-red-50 rounded-xl',
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-800 mb-2">{title}</h3>
          <ul className="space-y-1">
            {errorEntries.map(([field, error]) => (
              <li key={field} className="text-sm text-red-700">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Inline validation hook
export const useFormValidation = <T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: T[keyof T]) => string | null>
) => {
  const [values, setValues] = React.useState<T>(initialValues)
  const [errors, setErrors] = React.useState<Record<keyof T, string>>({} as Record<keyof T, string>)
  const [touched, setTouched] = React.useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  const validateField = React.useCallback((field: keyof T, value: T[keyof T]) => {
    const rule = validationRules[field]
    return rule ? rule(value) : null
  }, [validationRules])

  const setValue = React.useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Validate if field has been touched
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error || '' }))
    }
  }, [validateField, touched])

  const setTouched = React.useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate on blur
    const error = validateField(field, values[field])
    setErrors(prev => ({ ...prev, [field]: error || '' }))
  }, [validateField, values])

  const validateAll = React.useCallback(() => {
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>
    let isValid = true

    Object.keys(values).forEach(field => {
      const error = validateField(field as keyof T, values[field])
      newErrors[field as keyof T] = error || ''
      if (error) isValid = false
    })

    setErrors(newErrors)
    setTouched(Object.keys(values).reduce((acc, field) => {
      acc[field as keyof T] = true
      return acc
    }, {} as Record<keyof T, boolean>))

    return isValid
  }, [values, validateField])

  const reset = React.useCallback(() => {
    setValues(initialValues)
    setErrors({} as Record<keyof T, string>)
    setTouched({} as Record<keyof T, boolean>)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched: setTouched,
    validateAll,
    reset,
    isValid: Object.values(errors).every(error => !error)
  }
}

// Field validation rules library
export const validationRules = {
  required: (message = 'This field is required') => (value: unknown) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message
    }
    return null
  },

  email: (message = 'Please enter a valid email address') => (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message
    }
    return null
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`
    }
    return null
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`
    }
    return null
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (value && !regex.test(value)) {
      return message
    }
    return null
  },

  number: (message = 'Must be a valid number') => (value: unknown) => {
    if (value && isNaN(Number(value))) {
      return message
    }
    return null
  },

  min: (min: number, message?: string) => (value: unknown) => {
    const num = Number(value)
    if (!isNaN(num) && num < min) {
      return message || `Must be at least ${min}`
    }
    return null
  },

  max: (max: number, message?: string) => (value: unknown) => {
    const num = Number(value)
    if (!isNaN(num) && num > max) {
      return message || `Must be no more than ${max}`
    }
    return null
  },

  custom: (validator: (value: unknown) => boolean, message: string) => (value: unknown) => {
    if (value && !validator(value)) {
      return message
    }
    return null
  }
}

// Compose multiple validation rules
export const composeValidators = (...validators: Array<(value: unknown) => string | null>) => {
  return (value: unknown) => {
    for (const validator of validators) {
      const error = validator(value)
      if (error) return error
    }
    return null
  }
}