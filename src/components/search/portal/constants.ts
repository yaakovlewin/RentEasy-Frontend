export const DOCKING_CONFIG = {
  LEAD: 48,
  HYSTERESIS: 8,
  BAND: 200,
  EPSILON: 0.5,
  MIN_HEADER_HEIGHT: 60,
  DEFAULT_HEADER_HEIGHT: 80,
  ANTICIPATION: 10,
  MIN_UNDOCK_LEAD: 16,
  MAX_UNDOCK_LEAD: 40,
  UNDOCK_LEAD_RATIO: 0.4,
} as const;

export const Z_INDEX = {
  DOCKED: 9999,
  HERO: 10,
} as const;

export const ANIMATION = {
  TRANSITION: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
