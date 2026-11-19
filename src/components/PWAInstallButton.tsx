import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#D4AF37]/40 bg-[#1C1B1B] text-[#F2CA50] hover:border-[#D4AF37] hover:bg-[#3A2B20]/60 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          variant === 'full' ? 'px-5 py-3 text-sm font-semibold min-h-[44px]' : 'px-3.5 py-2 text-xs font-semibold min-h-[40px]'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#D4AF37]/40 bg-[#1C1B1B] text-[#F2CA50] hover:border-[#D4AF37] hover:bg-[#3A2B20]/60 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            variant === 'full' ? 'px-5 py-3 text-sm font-semibold min-h-[44px]' : 'px-3.5 py-2 text-xs font-semibold min-h-[40px]'
          }`}
        >
          <Share className="w-4 h-4 shrink-0" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-xl border border-[#D4AF37]/25 bg-[#242220] p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <h3 id="ios-install-title" className="font-editorial text-xl font-semibold text-[#F7F4EA]">
                  Instalar en iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar instrucciones"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#8C857B] hover:text-[#F7F4EA] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-[#D0C5AF] leading-relaxed">
                <li>1. Toca el botón <strong className="text-[#F7F4EA]">Compartir</strong> en la barra inferior de Safari.</li>
                <li>2. Desliza hacia abajo y selecciona <strong className="text-[#F7F4EA]">Agregar a inicio</strong>.</li>
                <li>3. Confirma tocando <strong className="text-[#F2CA50]">Agregar</strong> para abrir Casa &amp; Navaja como app.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[44px] rounded-lg bg-[#D4AF37] text-[#131313] text-sm font-bold hover:bg-[#F2CA50] transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
