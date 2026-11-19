import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, QrCode, Share2, X } from 'lucide-react';
import { BarberProfile } from '../types/barber';

interface ShareQRModalProps {
  open: boolean;
  onClose: () => void;
  shopName: string;
  barbers: BarberProfile[];
}

export const ShareQRModal: React.FC<ShareQRModalProps> = ({
  open,
  onClose,
  shopName,
  barbers,
}) => {
  const [selectedBarberId, setSelectedBarberId] = useState<string>('general');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const shareUrl = React.useMemo(() => {
    if (typeof window === 'undefined') return 'https://lasantabarber.app';
    const base = `${window.location.origin}${window.location.pathname}`;
    if (selectedBarberId === 'general') return base;
    return `${base}?barbero=${encodeURIComponent(selectedBarberId)}`;
  }, [selectedBarberId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#131313',
        light: '#F7F4EA',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [open, shareUrl]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shopName,
          text: `Agenda tu cita en ${shopName} de forma rápida desde tu celular:`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-${shopName.toLowerCase().replace(/\s+/g, '-')}-${selectedBarberId}.png`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border border-[#D4AF37]/25 bg-[#242220] shadow-2xl overflow-hidden">
        <div className="sm:hidden w-10 h-1 bg-[#4D4635] rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#D4AF37]/15">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <h2 id="qr-modal-title" className="font-editorial text-xl font-semibold text-[#F7F4EA]">
              Compartir por Link y QR
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar código QR"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#8C857B] hover:text-[#F7F4EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label
              htmlFor="qr-target-select"
              className="block text-xs font-semibold text-[#D0C5AF] mb-1.5"
            >
              Destino del enlace / código QR
            </label>
            <select
              id="qr-target-select"
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-sm text-[#F7F4EA] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="general">Portada principal de {shopName}</option>
              {barbers
                .filter((b) => b.active)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    Reserva directa con {b.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#181716] p-5">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR para abrir ${shopName}`}
                className="w-52 h-52 rounded-lg border-4 border-[#F7F4EA]"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-[#8C857B]">
                Generando código QR...
              </div>
            )}
            <p className="mt-3 text-xs text-center text-[#8C857B] max-w-xs">
              Escanea desde la cámara de cualquier celular Android o iOS para abrir la PWA sin descargas pesadas.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/20 bg-[#181716] px-3 py-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              aria-label="Enlace directo de la aplicación"
              className="flex-1 bg-transparent text-xs text-[#D0C5AF] focus:outline-none truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[36px] px-3 rounded-md bg-[#3A2B20] text-[#F2CA50] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#4D392A] transition-colors shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-safe">
            <button
              type="button"
              onClick={handleDownloadQR}
              disabled={!qrDataUrl}
              className="min-h-[44px] rounded-lg border border-[#D4AF37]/30 bg-[#1C1B1B] hover:border-[#D4AF37] text-[#F7F4EA] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Descargar QR</span>
            </button>
            <button
              type="button"
              onClick={handleNativeShare}
              className="min-h-[44px] rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#131313] text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar Enlace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
