import React, { useState } from 'react';
import { Award, MessageCircle, Scissors } from 'lucide-react';
import { BarberProfile } from '../types/barber';
import { formatColombianPhone } from '../utils/security';

interface TeamTabProps {
  barbers: BarberProfile[];
  onBookWithBarber: (barberId: string) => void;
}

export const TeamTab: React.FC<TeamTabProps> = ({ barbers, onBookWithBarber }) => {
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const activeBarbers = barbers.filter((b) => b.active);

  return (
    <section aria-labelledby="team-heading" className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      <div className="max-w-2xl space-y-2.5 mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#C5A059]">
          Profesionales de Confianza
        </p>
        <h2 id="team-heading" className="font-editorial text-3xl sm:text-4xl font-semibold text-[#F7F4EA]">
          Este es Nuestro Equipo
        </h2>
        <p className="text-sm sm:text-base text-[#D0C5AF] leading-relaxed">
          Barberos con más de 5 años de experiencia en cortes para caballeros, niños y niñas, dominio en técnicas de pulido de barba, bigote y diseños artísticos.
        </p>
      </div>

      {activeBarbers.length === 0 ? (
        <div className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-8 text-center text-sm text-[#8C857B]">
          No hay barberos activos en este momento. Activa al menos uno desde el panel de Administración.
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 ${
            activeBarbers.length === 1
              ? 'md:grid-cols-1 max-w-xl mx-auto'
              : activeBarbers.length === 2
                ? 'md:grid-cols-2 max-w-4xl mx-auto'
                : 'md:grid-cols-3'
          } gap-6 lg:gap-8`}
        >
          {activeBarbers.map((barber) => (
            <article
              key={barber.id}
              className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-6 flex flex-col justify-between space-y-6 hover:border-[#D4AF37]/45 transition-colors"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Circular portrait frame */}
                <div className="relative w-36 h-36 rounded-full p-1 border-2 border-[#D4AF37]/60 bg-[#131313] shadow-[0_8px_24px_rgba(0,0,0,0.65)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#242220]">
                    {!failedPhotos[barber.id] && barber.photoUrl ? (
                      <img
                        src={barber.photoUrl}
                        alt={`Foto circular de ${barber.name}`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedPhotos((prev) => ({ ...prev, [barber.id]: true }))
                        }
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#242220]">
                        <Scissors className="w-8 h-8 text-[#D4AF37]/60" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl font-semibold text-[#F7F4EA]">
                    {barber.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#F2CA50] leading-snug">
                    {barber.specialty}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-[#C5A059] font-medium">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="tabular-nums">+{barber.experienceYears} años de experiencia</span>
                </div>

                <p className="text-xs sm:text-sm text-[#D0C5AF] leading-relaxed">
                  {barber.bio}
                </p>

                <blockquote className="rounded-lg bg-[#181716] border border-[#D4AF37]/15 px-4 py-3 text-xs italic text-[#F7F4EA]/90 leading-relaxed">
                  “{barber.positiveMessage}”
                </blockquote>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/15 space-y-2.5 text-center">
                <p className="text-xs font-bold text-[#F2CA50] tracking-wide">
                  ¡Qué esperas, agenda tu cita ya!
                </p>
                <button
                  type="button"
                  onClick={() => onBookWithBarber(barber.id)}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] active:scale-[0.99] text-[#131313] font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="tabular-nums">
                    WhatsApp {formatColombianPhone(barber.whatsapp)}
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
