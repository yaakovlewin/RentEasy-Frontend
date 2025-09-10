/**
 * @fileoverview useMapCore Hook
 * 
 * React hook for managing map state and interactions with performance optimization
 * and error handling following established patterns.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseMapCoreState, MapError } from '../types/MapTypes';

/**
 * Configuration options for useMapCore hook
 */
export interface UseMapCoreOptions {
  onMapLoad?: (map: google.maps.Map) => void;
  onError?: (error: MapError) => void;
  enableAutoRetry?: boolean;
  maxRetries?: number;
}

/**
 * Hook for managing map core functionality
 */
export const useMapCore = (options: UseMapCoreOptions = {}) => {
  const {
    onMapLoad,
    onError,
    enableAutoRetry = true,
    maxRetries = 3
  } = options;

  const [state, setState] = useState<UseMapCoreState>({
    loading: false,
    error: null,
    mapInstance: null,
    isReady: false,
  });

  const retryCountRef = useRef(0);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  /**
   * Handles map loading success
   */
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map;
    retryCountRef.current = 0; // Reset retry count on success

    setState(prev => ({
      ...prev,
      loading: false,
      error: null,
      mapInstance: map,
      isReady: true,
    }));

    onMapLoad?.(map);
  }, [onMapLoad]);

  /**
   * Handles map errors with optional auto-retry
   */
  const handleMapError = useCallback((error: MapError) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error,
      isReady: false,
    }));

    // Auto-retry logic for certain error types
    if (
      enableAutoRetry &&
      retryCountRef.current < maxRetries &&
      (error.category === 'API_LOAD' || error.category === 'GENERAL')
    ) {
      retryCountRef.current++;
      
      // Exponential backoff retry
      const delay = Math.pow(2, retryCountRef.current - 1) * 1000;
      
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
        }));
      }, delay);

      return;
    }

    onError?.(error);
  }, [enableAutoRetry, maxRetries, onError]);

  /**
   * Manually retry map loading
   */
  const retry = useCallback(() => {
    if (state.loading) return;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isReady: false,
    }));

    // Reset retry count on manual retry
    retryCountRef.current = 0;
  }, [state.loading]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Reset the entire map state
   */
  const reset = useCallback(() => {
    mapInstanceRef.current = null;
    retryCountRef.current = 0;

    setState({
      loading: false,
      error: null,
      mapInstance: null,
      isReady: false,
    });
  }, []);

  /**
   * Get map bounds (useful for multiple properties)
   */
  const getBounds = useCallback((): google.maps.LatLngBounds | null => {
    return mapInstanceRef.current?.getBounds() || null;
  }, []);

  /**
   * Center map on specific coordinates
   */
  const centerMap = useCallback((coordinates: google.maps.LatLngLiteral, zoom?: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(coordinates);
      if (zoom !== undefined) {
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, []);

  /**
   * Fit map to bounds
   */
  const fitBounds = useCallback((bounds: google.maps.LatLngBounds) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, []);

  /**
   * Set map zoom level
   */
  const setZoom = useCallback((zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, []);

  /**
   * Check if map is loaded and ready
   */
  const isMapReady = useCallback(() => {
    return state.isReady && mapInstanceRef.current !== null;
  }, [state.isReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mapInstanceRef.current = null;
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    retry,
    clearError,
    reset,
    
    // Map controls
    centerMap,
    fitBounds,
    setZoom,
    getBounds,
    isMapReady,
    
    // Callbacks (for MapCore component)
    handleMapLoad,
    handleMapError,
    
    // Refs for advanced usage
    mapInstanceRef: mapInstanceRef.current,
    retryCount: retryCountRef.current,
  };
};