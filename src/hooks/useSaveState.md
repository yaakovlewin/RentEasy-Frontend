# useSaveState Hook

## Overview

A custom React hook that provides reusable save state management for forms and settings components. This hook eliminates code duplication by centralizing the common save/loading state pattern used across profile components.

## Features

- **Consistent State Management**: Manages `isSaving` and `saveStatus` states
- **Automatic Status Reset**: Auto-resets success/error status after configurable duration (default: 3 seconds)
- **Callback Support**: Optional `onSuccess` and `onError` callbacks
- **TypeScript Support**: Full type safety with TypeScript generics
- **Customizable Durations**: Configure success and error message display times
- **Manual Reset**: Exposed `resetStatus` function for manual control

## Usage

### Basic Example

```typescript
import { useSaveState } from '@/hooks/useSaveState';

function MyComponent() {
  const [settings, setSettings] = useState({ /* ... */ });

  const { isSaving, saveStatus, handleSave } = useSaveState(async () => {
    await api.updateSettings(settings);
  });

  return (
    <div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>

      {saveStatus === 'success' && (
        <div className="text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>Settings saved</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to save</span>
        </div>
      )}
    </div>
  );
}
```

### With Options

```typescript
const { isSaving, saveStatus, handleSave, resetStatus } = useSaveState(
  async () => {
    await api.updatePreferences(preferences);
  },
  {
    successDuration: 5000,  // Show success message for 5 seconds
    errorDuration: 5000,    // Show error message for 5 seconds
    onSuccess: () => {
      console.log('Save successful!');
      // Optionally refresh data or show notification
    },
    onError: (error) => {
      console.error('Save failed:', error);
      // Optionally log to error tracking service
    }
  }
);

// Reset status manually when user changes form
const handleInputChange = (value: string) => {
  setFormValue(value);
  resetStatus();  // Clear any existing success/error messages
};
```

## API

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `saveFunction` | `() => Promise<void>` | Yes | - | Async function that performs the save operation |
| `options` | `UseSaveStateOptions` | No | `{}` | Configuration options |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `successDuration` | `number` | `3000` | Duration in ms to show success status |
| `errorDuration` | `number` | `3000` | Duration in ms to show error status |
| `onSuccess` | `() => void` | - | Callback executed on successful save |
| `onError` | `(error: unknown) => void` | - | Callback executed on save failure |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `isSaving` | `boolean` | Indicates if save operation is in progress |
| `saveStatus` | `'idle' \| 'success' \| 'error'` | Current status of save operation |
| `handleSave` | `() => Promise<void>` | Function to trigger the save operation |
| `resetStatus` | `() => void` | Function to manually reset status to 'idle' |

## Use Cases

### Profile Settings
```typescript
// Regional Preferences
const { isSaving, saveStatus, handleSave } = useSaveState(async () => {
  await api.updatePreferences({ language, currency, timezone });
});
```

### Notification Settings
```typescript
// Email Notifications
const { isSaving, saveStatus, handleSave, resetStatus } = useSaveState(async () => {
  await api.updateNotificationSettings(emailSettings);
});

const handleToggle = (key: string) => {
  setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  resetStatus(); // Clear status when user makes changes
};
```

### Privacy Settings
```typescript
// Profile Visibility
const { isSaving, saveStatus, handleSave } = useSaveState(
  async () => {
    await api.updatePrivacySettings(visibilitySettings);
  },
  {
    onSuccess: () => {
      // Optionally refetch user profile
      refetchProfile();
    },
    onError: (error) => {
      // Log to error tracking
      captureError(error, ErrorSeverity.MEDIUM, ErrorCategory.API);
    }
  }
);
```

## Benefits

### Before (Without Hook)
```typescript
// Duplicated across 11+ components
const [isSaving, setIsSaving] = useState(false);
const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

const handleSave = async () => {
  setIsSaving(true);
  setSaveStatus('idle');

  try {
    await api.updateSettings(settings);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  } catch (error) {
    setSaveStatus('error');
    setTimeout(() => setSaveStatus('idle'), 3000);
  } finally {
    setIsSaving(false);
  }
};

// ~20 lines of duplicated code per component
```

### After (With Hook)
```typescript
// Single line with all functionality
const { isSaving, saveStatus, handleSave } = useSaveState(async () => {
  await api.updateSettings(settings);
});

// ~15 lines saved per component
```

## Migration Guide

### Step 1: Import the Hook
```typescript
import { useSaveState } from '@/hooks/useSaveState';
```

### Step 2: Replace State and Handler
Remove:
```typescript
const [isSaving, setIsSaving] = useState(false);
const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

const handleSave = async () => {
  // ... full implementation
};
```

Replace with:
```typescript
const { isSaving, saveStatus, handleSave } = useSaveState(async () => {
  await api.updateSettings(settings);
});
```

### Step 3: Update Status Resets (if needed)
Replace:
```typescript
setSaveStatus('idle');
```

With:
```typescript
resetStatus();
```

### Step 4: Add Callbacks (optional)
```typescript
const { isSaving, saveStatus, handleSave } = useSaveState(
  async () => {
    await api.updateSettings(settings);
  },
  {
    onSuccess: () => console.log('Saved!'),
    onError: (error) => console.error('Failed:', error)
  }
);
```

## Testing

The hook includes comprehensive tests covering:
- Initial state
- Successful save operations
- Failed save operations
- Callback execution
- Custom durations
- Manual status reset
- Loading state during save

See `__tests__/useSaveState.test.ts` for test examples.

## Components Using This Hook

### Currently Refactored
1. ✅ `PreferencesManager.tsx` - Regional preferences
2. ✅ `EmailNotifications.tsx` - Email notification settings
3. ✅ `ProfileVisibility.tsx` - Profile visibility settings

### Ready for Refactoring (8 components)
4. `AccountSettingsContent.tsx` - Account settings
5. `ActivityPrivacy.tsx` - Activity privacy settings
6. `CookiePreferences.tsx` - Cookie preferences
7. `DataUsagePreferences.tsx` - Data usage settings
8. `MarketingPreferences.tsx` - Marketing preferences
9. `NotificationSchedule.tsx` - Notification schedule
10. `PushNotifications.tsx` - Push notification settings
11. `SMSNotifications.tsx` - SMS notification settings

### Estimated Impact
- **Lines saved per component**: ~15 lines
- **Total lines saved across 11 components**: ~165 lines
- **Code duplication eliminated**: 100%
- **Maintenance improvement**: Single source of truth for save state logic

## Best Practices

1. **Use with async operations**: Hook is designed for async save operations
2. **Reset on form changes**: Call `resetStatus()` when user modifies form to clear old messages
3. **Provide user feedback**: Always show loading, success, and error states in UI
4. **Add callbacks for side effects**: Use `onSuccess` for actions like refetching data
5. **Configure durations**: Adjust `successDuration` and `errorDuration` based on UX needs

## Related Hooks

- `useFormSubmit` - For form submission with validation
- `useAsyncOperation` - For generic async operations with error handling
- `usePersistedState` - For state that persists to localStorage
