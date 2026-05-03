import { DOCKING_CONFIG } from './constants';
import type { MeasurementResult, DockingThresholds } from './types';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const calculateUndockLead = (headerHeight: number): number =>
  clamp(
    headerHeight * DOCKING_CONFIG.UNDOCK_LEAD_RATIO,
    DOCKING_CONFIG.MIN_UNDOCK_LEAD,
    DOCKING_CONFIG.MAX_UNDOCK_LEAD
  );

const calculateDockLead = (headerHeight: number): number =>
  Math.max(headerHeight - DOCKING_CONFIG.ANTICIPATION, DOCKING_CONFIG.LEAD);

const getHeaderHeight = (header: HTMLElement | null): number =>
  Math.max(
    header?.getBoundingClientRect().height || DOCKING_CONFIG.DEFAULT_HEADER_HEIGHT,
    DOCKING_CONFIG.MIN_HEADER_HEIGHT
  );

const createFallbackMeasurement = (): MeasurementResult => ({
  err: 0,
  dockErr: 0,
  undockErr: 0,
  headerH: DOCKING_CONFIG.DEFAULT_HEADER_HEIGHT,
  dynamicLead: DOCKING_CONFIG.LEAD,
  dockLead: DOCKING_CONFIG.LEAD,
  undockLead: DOCKING_CONFIG.LEAD,
});

export const measureDockingPosition = (
  visualViewportOffset: number
): MeasurementResult => {
  const header = document.getElementById('main-header');
  const slot = document.getElementById('search-hero-slot');

  if (!header || !slot) {
    return createFallbackMeasurement();
  }

  const headerH = getHeaderHeight(header);
  const slotTop = slot.getBoundingClientRect().top;
  const undockLead = calculateUndockLead(headerH);
  const dockLead = calculateDockLead(headerH);

  const delta = slotTop - headerH - visualViewportOffset;
  const dockErr = delta - dockLead;
  const undockErr = delta - undockLead;

  return {
    err: undockErr,
    dockErr,
    undockErr,
    headerH,
    dynamicLead: undockLead,
    dockLead,
    undockLead,
  };
};

export const getDockingThresholds = (): DockingThresholds => ({
  dockThreshold: -(DOCKING_CONFIG.HYSTERESIS / 2 + DOCKING_CONFIG.EPSILON),
  undockThreshold: DOCKING_CONFIG.HYSTERESIS / 2 + DOCKING_CONFIG.EPSILON,
});

export const shouldDock = (
  dockErr: number,
  undockErr: number,
  currentlyDocked: boolean
): boolean => {
  const { dockThreshold, undockThreshold } = getDockingThresholds();

  if (dockErr <= dockThreshold) return true;
  if (undockErr >= undockThreshold) return false;
  return currentlyDocked;
};

export const isNearDockingEdge = (dockErr: number, undockErr: number): boolean =>
  Math.min(Math.abs(dockErr), Math.abs(undockErr)) < DOCKING_CONFIG.BAND;
