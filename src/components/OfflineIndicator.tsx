import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border border-[#D4AF37]/30 bg-[#3A2B20] px-4 py-2 text-xs font-medium text-[#F7F4EA] shadow-xl"
    >
      <WifiOff className="w-4 h-4 text-[#F2CA50] shrink-0" />
      <span>Modo sin conexión — Mostrando catálogo y citas guardadas.</span>
    </div>
  );
};
