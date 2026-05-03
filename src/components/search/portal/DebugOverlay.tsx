import { DOCKING_CONFIG } from './constants';
import { measureDockingPosition, getDockingThresholds } from './measurements';
import type { DebugInfo } from './types';

interface DebugOverlayProps {
  isDocked: boolean;
  debugInfo: DebugInfo;
}

const roundToDecimal = (value: number, decimals: number = 1): number =>
  Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);

export const DebugOverlay = ({ isDocked, debugInfo }: DebugOverlayProps) => {
  const { dockLead, undockLead } = measureDockingPosition(0);
  const { dockThreshold, undockThreshold } = getDockingThresholds();

  return (
    <div
      className="fixed top-4 right-4 bg-black/90 text-white text-xs font-mono p-3 rounded-lg z-[100] backdrop-blur-sm border border-white/20"
      style={{ minWidth: '200px' }}
    >
      <div className="text-green-400 font-bold mb-2">🔧 Search Bar Debug</div>
      <div className="space-y-1">
        <div>
          Status:{' '}
          <span className={isDocked ? 'text-blue-400' : 'text-yellow-400'}>
            {isDocked ? '⚓ DOCKED' : '🌊 HERO'}
          </span>
        </div>
        <div>
          Current Err: <span className="text-cyan-400">{debugInfo.err}px</span>
        </div>
        <div>
          Min Err: <span className="text-red-400">{debugInfo.minErr}px</span>
        </div>
        <div>
          Max Err: <span className="text-green-400">{debugInfo.maxErr}px</span>
        </div>
        <div>
          Dock Count: <span className="text-purple-400">{debugInfo.dockCount}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-white/20 text-gray-300">
          <div>
            Static LEAD: {DOCKING_CONFIG.LEAD}px | HYST: {DOCKING_CONFIG.HYSTERESIS}px | EPS:{' '}
            {DOCKING_CONFIG.EPSILON}px
          </div>
          <div className="text-cyan-300">
            Undock Lead: {roundToDecimal(undockLead || DOCKING_CONFIG.LEAD)}px
          </div>
          <div className="text-orange-300">
            Dock Lead: {roundToDecimal(dockLead || DOCKING_CONFIG.LEAD)}px (aggressive)
          </div>
          <div>
            Dock Trigger: {dockThreshold}px | Undock Trigger: {undockThreshold}px
          </div>
        </div>
      </div>
    </div>
  );
};
