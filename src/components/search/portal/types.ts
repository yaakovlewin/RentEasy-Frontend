export interface SearchBarPortalProps {
  heroVariant?: 'hero' | 'compact';
  headerVariant?: 'header' | 'compact';
  className?: string;
}

export interface MeasurementResult {
  err: number;
  dockErr: number;
  undockErr: number;
  headerH: number;
  dynamicLead: number;
  dockLead: number;
  undockLead: number;
}

export interface DebugInfo {
  err: number;
  minErr: number;
  maxErr: number;
  dockCount: number;
}

export interface DockingThresholds {
  dockThreshold: number;
  undockThreshold: number;
}
