import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-950/90 border border-amber-600/50 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div>
        <p className="font-semibold text-amber-100">Offline Field Mode Active</p>
        <p className="text-[10px] text-amber-300/80 flex items-center gap-1">
          <Database className="w-3 h-3" /> Cached star charts and celestial encyclopedia ready
        </p>
      </div>
    </div>
  );
};
