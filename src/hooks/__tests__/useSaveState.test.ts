import { renderHook, act, waitFor } from '@testing-library/react';
import { useSaveState } from '../useSaveState';

describe('useSaveState', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useSaveState(async () => {})
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveStatus).toBe('idle');
    expect(typeof result.current.handleSave).toBe('function');
    expect(typeof result.current.resetStatus).toBe('function');
  });

  it('should handle successful save operation', async () => {
    const mockSaveFunction = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useSaveState(mockSaveFunction));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveStatus).toBe('success');

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.saveStatus).toBe('idle');
    });
  });

  it('should handle save operation with error', async () => {
    const mockError = new Error('Save failed');
    const mockSaveFunction = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useSaveState(mockSaveFunction));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockSaveFunction).toHaveBeenCalledTimes(1);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveStatus).toBe('error');

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.saveStatus).toBe('idle');
    });
  });

  it('should call onSuccess callback on successful save', async () => {
    const mockOnSuccess = jest.fn();
    const mockSaveFunction = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useSaveState(mockSaveFunction, { onSuccess: mockOnSuccess })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should call onError callback on failed save', async () => {
    const mockError = new Error('Save failed');
    const mockOnError = jest.fn();
    const mockSaveFunction = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useSaveState(mockSaveFunction, { onError: mockOnError })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it('should respect custom success duration', async () => {
    const mockSaveFunction = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useSaveState(mockSaveFunction, { successDuration: 5000 })
    );

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.saveStatus).toBe('success');

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.saveStatus).toBe('success');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(result.current.saveStatus).toBe('idle');
    });
  });

  it('should allow manual status reset', () => {
    const mockSaveFunction = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useSaveState(mockSaveFunction));

    act(() => {
      result.current.resetStatus();
    });

    expect(result.current.saveStatus).toBe('idle');
  });

  it('should set isSaving to true during save operation', async () => {
    let resolvePromise: () => void;
    const mockSaveFunction = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useSaveState(mockSaveFunction));

    act(() => {
      result.current.handleSave();
    });

    expect(result.current.isSaving).toBe(true);
    expect(result.current.saveStatus).toBe('idle');

    await act(async () => {
      resolvePromise!();
      await Promise.resolve();
    });

    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveStatus).toBe('success');
  });
});
