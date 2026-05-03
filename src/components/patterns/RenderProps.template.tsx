/**
 * RENDER PROPS PATTERN TEMPLATE
 *
 * This template demonstrates the Render Props pattern for sharing logic
 * between components without using HOCs or hooks composition.
 *
 * Key Concepts:
 * - Inversion of control through children as function
 * - Reusable stateful logic
 * - Flexible rendering
 * - Type-safe render props
 * - Composable data providers
 *
 * Use Cases:
 * - Data fetching and state management
 * - Form state management
 * - Accessibility helpers
 * - Mouse/keyboard tracking
 * - Animation controllers
 */

import React, { useState, useReducer, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// BASIC RENDER PROPS PATTERN
// =============================================================================

/**
 * Simple render props component
 * Provides mouse position to children
 */
type MousePosition = {
  x: number;
  y: number;
};

type MouseTrackerProps = {
  children: (position: MousePosition) => React.ReactNode;
  className?: string;
};

export const MouseTracker: React.FC<MouseTrackerProps> = ({ children, className }) => {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    setPosition({ x: event.clientX, y: event.clientY });
  }, []);

  return (
    <div onMouseMove={handleMouseMove} className={className}>
      {children(position)}
    </div>
  );
};

// Usage:
/*
<MouseTracker>
  {({ x, y }) => (
    <div>Mouse position: ({x}, {y})</div>
  )}
</MouseTracker>
*/

// =============================================================================
// DATA PROVIDER PATTERN
// =============================================================================

/**
 * Generic data provider with loading and error states
 */
type DataProviderRenderProps<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

type DataProviderProps<T> = {
  fetchData: () => Promise<T>;
  children: (props: DataProviderRenderProps<T>) => React.ReactNode;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

export function DataProvider<T>({
  fetchData,
  children,
  onSuccess,
  onError,
}: DataProviderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchData();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, onSuccess, onError]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return <>{children({ data, isLoading, error, refetch: fetch })}</>;
}

// Usage:
/*
<DataProvider fetchData={() => api.properties.getAll()}>
  {({ data, isLoading, error, refetch }) => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
    if (!data) return null;

    return <PropertyList properties={data} />;
  }}
</DataProvider>
*/

// =============================================================================
// FORM STATE PROVIDER PATTERN
// =============================================================================

/**
 * Form state management with validation
 */
type FormValues = Record<string, any>;
type FormErrors = Record<string, string>;
type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K]) => string | null;
};

type FormStateRenderProps<T extends FormValues> = {
  values: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T) => void;
  handleChange: <K extends keyof T>(field: K) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
};

type FormStateProviderProps<T extends FormValues> = {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void> | void;
  children: (props: FormStateRenderProps<T>) => React.ReactNode;
};

export function FormStateProvider<T extends FormValues>({
  initialValues,
  validationRules = {},
  onSubmit,
  children,
}: FormStateProviderProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate single field
  const validateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]): string | null => {
      const rule = validationRules[field];
      return rule ? rule(value) : null;
    },
    [validationRules]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(values).forEach((field) => {
      const error = validateField(field as keyof T, values[field as keyof T]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Set field value with validation
  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Validate if field has been touched
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error ?? '',
        }));
      }
    },
    [touched, validateField]
  );

  // Set field error
  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Mark field as touched
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Create change handler
  const handleChange = useCallback(
    <K extends keyof T>(field: K) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(field, e.target.value as T[K]);
      },
    [setValue]
  );

  // Create blur handler
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setFieldTouched(field);
      const error = validateField(field, values[field]);
      if (error) {
        setError(field, error);
      }
    },
    [setFieldTouched, validateField, values, setError]
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      // Validate
      if (!validateForm()) {
        return;
      }

      // Submit
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return (
    <>
      {children({
        values,
        errors,
        touched,
        isValid,
        isSubmitting,
        setValue,
        setError,
        setTouched: setFieldTouched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
      })}
    </>
  );
}

// Usage:
/*
<FormStateProvider
  initialValues={{ email: '', password: '' }}
  validationRules={{
    email: (value) => (!value ? 'Required' : !value.includes('@') ? 'Invalid email' : null),
    password: (value) => (!value ? 'Required' : value.length < 8 ? 'Too short' : null),
  }}
  onSubmit={async (values) => {
    await api.auth.login(values.email, values.password);
  }}
>
  {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={values.password}
        onChange={handleChange('password')}
        onBlur={handleBlur('password')}
      />
      {touched.password && errors.password && <span>{errors.password}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )}
</FormStateProvider>
*/

// =============================================================================
// LIST MANAGER PATTERN
// =============================================================================

/**
 * Generic list management with CRUD operations
 */
type ListItem = {
  id: string;
  [key: string]: any;
};

type ListManagerRenderProps<T extends ListItem> = {
  items: T[];
  selectedItems: Set<string>;
  add: (item: T) => void;
  update: (id: string, updates: Partial<T>) => void;
  remove: (id: string) => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  filter: (predicate: (item: T) => boolean) => void;
  sort: (compareFn: (a: T, b: T) => number) => void;
  reset: () => void;
};

type ListManagerProps<T extends ListItem> = {
  initialItems?: T[];
  children: (props: ListManagerRenderProps<T>) => React.ReactNode;
  onChange?: (items: T[]) => void;
};

export function ListManager<T extends ListItem>({
  initialItems = [],
  children,
  onChange,
}: ListManagerProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Notify parent of changes
  useEffect(() => {
    onChange?.(items);
  }, [items, onChange]);

  // Add item
  const add = useCallback((item: T) => {
    setItems((prev) => [...prev, item]);
  }, []);

  // Update item
  const update = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Remove item
  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Select item
  const select = useCallback((id: string) => {
    setSelectedItems((prev) => new Set(prev).add(id));
  }, []);

  // Deselect item
  const deselect = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Toggle selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Select all
  const selectAll = useCallback(() => {
    setSelectedItems(new Set(items.map((item) => item.id)));
  }, [items]);

  // Deselect all
  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Filter items
  const filter = useCallback((predicate: (item: T) => boolean) => {
    setItems((prev) => prev.filter(predicate));
  }, []);

  // Sort items
  const sort = useCallback((compareFn: (a: T, b: T) => number) => {
    setItems((prev) => [...prev].sort(compareFn));
  }, []);

  // Reset to initial
  const reset = useCallback(() => {
    setItems(initialItems);
    setSelectedItems(new Set());
  }, [initialItems]);

  return (
    <>
      {children({
        items,
        selectedItems,
        add,
        update,
        remove,
        select,
        deselect,
        toggleSelect,
        selectAll,
        deselectAll,
        filter,
        sort,
        reset,
      })}
    </>
  );
}

// Usage:
/*
<ListManager<Property> initialItems={properties}>
  {({ items, selectedItems, toggleSelect, remove }) => (
    <div>
      {items.map((property) => (
        <div key={property.id}>
          <input
            type="checkbox"
            checked={selectedItems.has(property.id)}
            onChange={() => toggleSelect(property.id)}
          />
          <span>{property.title}</span>
          <button onClick={() => remove(property.id)}>Delete</button>
        </div>
      ))}
    </div>
  )}
</ListManager>
*/

// =============================================================================
// TOGGLE STATE PATTERN
// =============================================================================

/**
 * Simple toggle state provider
 */
type ToggleRenderProps = {
  isOn: boolean;
  toggle: () => void;
  setOn: () => void;
  setOff: () => void;
};

type ToggleProps = {
  initialState?: boolean;
  children: (props: ToggleRenderProps) => React.ReactNode;
  onChange?: (isOn: boolean) => void;
};

export const Toggle: React.FC<ToggleProps> = ({
  initialState = false,
  children,
  onChange,
}) => {
  const [isOn, setIsOn] = useState(initialState);

  const toggle = useCallback(() => {
    setIsOn((prev) => {
      const newState = !prev;
      onChange?.(newState);
      return newState;
    });
  }, [onChange]);

  const setOn = useCallback(() => {
    setIsOn(true);
    onChange?.(true);
  }, [onChange]);

  const setOff = useCallback(() => {
    setIsOn(false);
    onChange?.(false);
  }, [onChange]);

  return <>{children({ isOn, toggle, setOn, setOff })}</>;
};

// Usage:
/*
<Toggle>
  {({ isOn, toggle }) => (
    <div>
      <button onClick={toggle}>
        {isOn ? 'Turn Off' : 'Turn On'}
      </button>
      {isOn && <div>Content visible when on</div>}
    </div>
  )}
</Toggle>
*/

// =============================================================================
// PAGINATION PROVIDER PATTERN
// =============================================================================

/**
 * Pagination state management
 */
type PaginationRenderProps<T> = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  currentItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type PaginationProviderProps<T> = {
  items: T[];
  initialPageSize?: number;
  children: (props: PaginationRenderProps<T>) => React.ReactNode;
};

export function PaginationProvider<T>({
  items,
  initialPageSize = 10,
  children,
}: PaginationProviderProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(items.length / pageSize);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <>
      {children({
        currentPage,
        totalPages,
        pageSize,
        currentItems,
        goToPage,
        nextPage,
        prevPage,
        setPageSize,
        hasNextPage,
        hasPrevPage,
      })}
    </>
  );
}

// Usage:
/*
<PaginationProvider items={properties} initialPageSize={12}>
  {({ currentItems, currentPage, totalPages, nextPage, prevPage, hasNextPage, hasPrevPage }) => (
    <div>
      <PropertyGrid properties={currentItems} />

      <div className="pagination">
        <button onClick={prevPage} disabled={!hasPrevPage}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={!hasNextPage}>
          Next
        </button>
      </div>
    </div>
  )}
</PaginationProvider>
*/

// =============================================================================
// COMPOUND RENDER PROPS PATTERN
// =============================================================================

/**
 * Example: Settings section with render props for flexible customization
 */
type SettingsSectionRenderProps<T> = {
  settings: T;
  updateSetting: <K extends keyof T>(key: K, value: T[K]) => void;
  resetSettings: () => void;
  hasChanges: boolean;
  saveSettings: () => Promise<void>;
  isSaving: boolean;
};

type SettingsSectionProps<T> = {
  initialSettings: T;
  onSave: (settings: T) => Promise<void>;
  children: (props: SettingsSectionRenderProps<T>) => React.ReactNode;
};

export function SettingsSection<T extends Record<string, any>>({
  initialSettings,
  onSave,
  children,
}: SettingsSectionProps<T>) {
  const [settings, setSettings] = useState<T>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initialSettings),
    [settings, initialSettings]
  );

  const updateSetting = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
    } finally {
      setIsSaving(false);
    }
  }, [settings, onSave]);

  return (
    <>
      {children({
        settings,
        updateSetting,
        resetSettings,
        hasChanges,
        saveSettings,
        isSaving,
      })}
    </>
  );
}

// Usage:
/*
<SettingsSection
  initialSettings={{ emailNotifications: true, pushNotifications: false }}
  onSave={async (settings) => await api.updateSettings(settings)}
>
  {({ settings, updateSetting, hasChanges, saveSettings, isSaving }) => (
    <div>
      <Switch
        checked={settings.emailNotifications}
        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
      />

      <Switch
        checked={settings.pushNotifications}
        onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
      />

      {hasChanges && (
        <button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  )}
</SettingsSection>
*/

export default {
  MouseTracker,
  DataProvider,
  FormStateProvider,
  ListManager,
  Toggle,
  PaginationProvider,
  SettingsSection,
};
