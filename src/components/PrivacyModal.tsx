import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
  shopName: string;
  contactEmail: string;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  open,
  onClose,
  shopName,
  contactEmail,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div className="w-full sm:max-w-lg max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-xl border border-[#D4AF37]/25 bg-[#242220] shadow-2xl overflow-hidden">
        <div className="sm:hidden w-10 h-1 bg-[#4D4635] rounded-full mx-auto mt-3 shrink-0" />

        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#D4AF37]/15 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <h2 id="privacy-modal-title" className="font-editorial text-xl font-semibold text-[#F7F4EA]">
              Protección de Datos y Marco Legal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar política legal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#8C857B] hover:text-[#F7F4EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#D0C5AF] leading-relaxed">
          <p className="text-xs font-bold text-[#C5A059]">
            Constitución Política Art. 15 · Ley Estatutaria 1581 de 2012 (Artículos 5, 6, 9 y 12) · Decreto Reglamentario 1377 de 2013 (Colombia)
          </p>
          <p>
            En cumplimiento del régimen general de protección de datos personales de la República de Colombia, <strong className="text-[#F7F4EA]">{shopName}</strong> informa que los datos suministrados en el formulario de reserva (nombre completo, número telefónico o WhatsApp, ubicación de referencia, servicio y horario) serán tratados de manera confidencial, segura y exclusiva para:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Agendar, confirmar y recordar citas con el barbero seleccionado sin cruces de horario.</li>
            <li>Contactar al titular vía WhatsApp respecto a novedades o disponibilidad de su turno.</li>
            <li>Cumplir con las obligaciones administrativas internas del establecimiento.</li>
          </ul>
          <div className="space-y-1.5">
            <h3 className="font-editorial text-base font-semibold text-[#F7F4EA]">
              Derechos del Titular (Habeas Data — Art. 8 Ley 1581 de 2012)
            </h3>
            <p className="text-xs sm:text-sm">
              Tienes derecho a conocer, actualizar, rectificar y solicitar la supresión o revocatoria de autorización de tus datos personales en cualquier momento escribiendo a <strong className="text-[#F7F4EA]">{contactEmail}</strong>.
            </p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-[#D4AF37]/15">
            <h3 className="font-editorial text-base font-semibold text-[#F7F4EA]">
              Propiedad Intelectual y Seguridad del Software
            </h3>
            <p className="text-xs text-[#8C857B] leading-relaxed">
              Software desarrollado por <strong className="text-[#F7F4EA]">Luis Rafael Martinez Angulo</strong>, Tecnólogo en Desarrollo de Software. Todos los derechos reservados (Copyright © y Derechos de Autor conforme a la Ley 23 de 1982 y Decisión Andina 351). Prohibida su reproducción no autorizada, alteración maliciosa o plagio.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#D4AF37]/15 bg-[#1C1B1B] pb-safe shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-lg bg-[#D4AF37] text-[#131313] text-sm font-bold hover:bg-[#F2CA50] transition-colors cursor-pointer"
          >
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
