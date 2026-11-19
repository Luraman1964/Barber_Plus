import React, { useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
} from 'lucide-react';
import { AppointmentRecord, ShopConfig } from '../types/barber';
import {
  formatColombianPhone,
  formatCop,
  formatDateSpanish,
  generateTimeSlotsForDate,
  getTodayISO,
  isBarberBusyAtSlot,
  sortAppointmentsChronologically,
  toWhatsAppInternational,
} from '../utils/security';

interface AgendaTabProps {
  config: ShopConfig;
  appointments: AppointmentRecord[];
  onBookSlot: (barberId: string, dateISO: string, time24: string) => void;
  onMarkAllRead: () => void;
  onEnableNotifications: () => void;
  notificationsEnabled: boolean;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({
  config,
  appointments,
  onBookSlot,
  onMarkAllRead,
  onEnableNotifications,
  notificationsEnabled,
}) => {
  const activeBarbers = config.barbers.filter((b) => b.active);
  const [filterBarberId, setFilterBarberId] = useState<string>('todos');
  const [previewDate, setPreviewDate] = useState<string>(getTodayISO());
  const [previewBarberId, setPreviewBarberId] = useState<string>(activeBarbers[0]?.id ?? '');

  const sortedAppointments = useMemo(() => {
    const active = appointments.filter((a) => a.status !== 'Cancelada');
    const filtered =
      filterBarberId === 'todos' ? active : active.filter((a) => a.barberId === filterBarberId);
    return sortAppointmentsChronologically(filtered);
  }, [appointments, filterBarberId]);

  const unreadCount = useMemo(
    () => appointments.filter((a) => a.unreadByBarber && a.status !== 'Cancelada').length,
    [appointments]
  );

  const daySlots = useMemo(
    () => generateTimeSlotsForDate(previewDate, config.hours),
    [previewDate, config.hours]
  );

  const selectedPreviewBarber =
    activeBarbers.find((b) => b.id === previewBarberId) ?? activeBarbers[0];

  return (
    <section aria-labelledby="agenda-heading" className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header & Barber Notification Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#C5A059]">
            Control de Horarios sin Cruces
          </p>
          <h2 id="agenda-heading" className="font-editorial text-3xl sm:text-4xl font-semibold text-[#F7F4EA]">
            Agenda y Disponibilidad
          </h2>
          <p className="text-sm text-[#D0C5AF]">
            Consulta los turnos libres en tiempo real o revisa las citas organizadas cronológicamente por barbero.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onEnableNotifications}
            className={`min-h-[44px] px-4 py-2 rounded-lg border text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              notificationsEnabled
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-[#D4AF37]/30 bg-[#1C1B1B] text-[#F2CA50] hover:border-[#D4AF37]'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>
              {notificationsEnabled ? 'Alertas activas en este dispositivo' : 'Activar alertas de nuevas citas'}
            </span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-[#3A2B20] text-[#F2CA50] text-xs font-semibold inline-flex items-center gap-2 hover:bg-[#4D392A] transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Marcar {unreadCount} alerta(s) leída(s)</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Day & Clock Availability Board */}
      <div className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div>
              <label htmlFor="agenda-date" className="block text-xs font-semibold text-[#C5A059] mb-1.5">
                Consultar día en calendario
              </label>
              <input
                id="agenda-date"
                type="date"
                min={getTodayISO()}
                value={previewDate}
                onChange={(e) => setPreviewDate(e.target.value)}
                className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-sm text-[#F7F4EA] tabular-nums focus:outline-none focus:border-[#D4AF37] [color-scheme:dark]"
              />
            </div>

            <div>
              <label htmlFor="agenda-barber" className="block text-xs font-semibold text-[#C5A059] mb-1.5">
                Barbero
              </label>
              <select
                id="agenda-barber"
                value={selectedPreviewBarber?.id ?? ''}
                onChange={(e) => setPreviewBarberId(e.target.value)}
                className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-sm text-[#F7F4EA] focus:outline-none focus:border-[#D4AF37]"
              >
                {activeBarbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-[#8C857B]">
            Toca cualquier horario <strong className="text-[#F7F4EA]">Disponible</strong> para agendarlo de inmediato.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {daySlots.map((slot) => {
            const busy = selectedPreviewBarber
              ? isBarberBusyAtSlot(appointments, selectedPreviewBarber.id, previewDate, slot.time24)
              : false;
            return (
              <button
                key={slot.time24}
                type="button"
                disabled={busy || !selectedPreviewBarber}
                onClick={() =>
                  selectedPreviewBarber &&
                  onBookSlot(selectedPreviewBarber.id, previewDate, slot.time24)
                }
                className={`min-h-[48px] px-3 py-2 rounded-lg border text-xs font-semibold tabular-nums transition-colors flex flex-col items-center justify-center ${
                  busy
                    ? 'border-[#D4AF37]/10 bg-[#141313] text-[#8C857B] cursor-not-allowed'
                    : 'border-[#D4AF37]/25 bg-[#181716] text-[#F7F4EA] hover:border-[#D4AF37] hover:bg-[#3A2B20]/60 cursor-pointer'
                }`}
              >
                <span>{slot.timeLabel}</span>
                <span className={`text-[10px] mt-0.5 ${busy ? 'text-[#FFB4AB]' : 'text-[#D4AF37]'}`}>
                  {busy ? 'Reservado' : 'Disponible'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Organized Queue of Appointments for Barbers */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-editorial text-2xl font-semibold text-[#F7F4EA]">
            Cola de Reservas Organizadas ({sortedAppointments.length})
          </h3>

          <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#1C1B1B] border border-[#D4AF37]/15">
            <button
              type="button"
              onClick={() => setFilterBarberId('todos')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterBarberId === 'todos'
                  ? 'bg-[#3A2B20] text-[#F2CA50]'
                  : 'text-[#8C857B] hover:text-[#F7F4EA]'
              }`}
            >
              Todos
            </button>
            {activeBarbers.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setFilterBarberId(b.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  filterBarberId === b.id
                    ? 'bg-[#3A2B20] text-[#F2CA50]'
                    : 'text-[#8C857B] hover:text-[#F7F4EA]'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="rounded-xl border border-[#D4AF37]/15 bg-[#1C1B1B] p-8 text-center space-y-3">
            <p className="font-editorial text-xl text-[#F7F4EA]">Sin citas pendientes en esta vista</p>
            <button
              type="button"
              onClick={() =>
                selectedPreviewBarber &&
                onBookSlot(selectedPreviewBarber.id, previewDate, daySlots[0]?.time24 ?? '10:00')
              }
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#D4AF37] text-[#131313] text-xs font-bold inline-flex items-center gap-2 hover:bg-[#F2CA50] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar nueva cita</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAppointments.map((appt) => {
              const barberObj = config.barbers.find((b) => b.id === appt.barberId);
              const clientWaUrl = `https://wa.me/${toWhatsAppInternational(
                appt.customerPhone
              )}?text=${encodeURIComponent(
                `Hola ${appt.customerName}, te escribimos de ${config.name} para confirmar tu cita con ${appt.barberName} el ${formatDateSpanish(
                  appt.dateISO
                )} a las ${appt.timeLabel}.`
              )}`;

              return (
                <article
                  key={appt.id}
                  className={`rounded-xl border p-5 space-y-3 transition-colors ${
                    appt.unreadByBarber
                      ? 'border-[#D4AF37] bg-[#24201B]'
                      : 'border-[#D4AF37]/20 bg-[#1C1B1B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#F2CA50] tabular-nums">{appt.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#D0C5AF]">{appt.status}</span>
                        {appt.unreadByBarber && (
                          <span className="text-[#F2CA50] font-semibold">· Nueva alerta</span>
                        )}
                      </div>
                      <h4 className="font-editorial text-xl font-semibold text-[#F7F4EA] mt-1">
                        {appt.customerName}
                      </h4>
                    </div>

                    <span className="text-sm font-bold text-[#D4AF37] tabular-nums shrink-0">
                      {formatCop(appt.priceCop)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#D0C5AF]">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="tabular-nums capitalize">
                        {formatDateSpanish(appt.dateISO)} · <strong>{appt.timeLabel}</strong>
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span>
                        Barbero: <strong className="text-[#F7F4EA]">{appt.barberName}</strong> · {appt.serviceName}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span>{appt.customerLocation}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="tabular-nums">{formatColombianPhone(appt.customerPhone)}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D4AF37]/15 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#8C857B]">
                      {barberObj ? `WhatsApp barbero: ${formatColombianPhone(barberObj.whatsapp)}` : ''}
                    </span>
                    <a
                      href={clientWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-[#D4AF37]/30 bg-[#181716] hover:border-[#D4AF37] text-[#F2CA50] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Responder al cliente</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
