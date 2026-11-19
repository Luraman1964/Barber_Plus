import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
  User,
  Users,
  X,
} from 'lucide-react';
import { AppointmentRecord, BarberProfile, ShopConfig } from '../types/barber';
import {
  formatCop,
  formatDateSpanish,
  generateTimeSlotsForDate,
  getAvailableBarbersAtSlot,
  getTodayISO,
  isBarberBusyAtSlot,
  isSundayOrHoliday,
  sanitizePhone,
  sanitizeText,
  toWhatsAppInternational,
} from '../utils/security';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  config: ShopConfig;
  appointments: AppointmentRecord[];
  initialBarberId?: string;
  initialServiceId?: string;
  initialDateISO?: string;
  initialTime24?: string;
  onOpenPrivacy: () => void;
  onSubmitBooking: (record: AppointmentRecord) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  config,
  appointments,
  initialBarberId,
  initialServiceId,
  initialDateISO,
  initialTime24,
  onOpenPrivacy,
  onSubmitBooking,
}) => {
  const activeBarbers = useMemo(
    () => config.barbers.filter((b) => b.active),
    [config.barbers]
  );

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(
    initialServiceId || config.services[0]?.id || ''
  );
  const [selectedBarberId, setSelectedBarberId] = useState(
    initialBarberId || 'any'
  );
  const [dateISO, setDateISO] = useState(initialDateISO || getTodayISO());
  const [time24, setTime24] = useState(initialTime24 || '10:30');
  const [notes, setNotes] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdRecord, setCreatedRecord] = useState<AppointmentRecord | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialBarberId) {
      setSelectedBarberId(initialBarberId);
    } else {
      setSelectedBarberId(activeBarbers[0]?.id ?? 'any');
    }
    if (initialServiceId) setSelectedServiceId(initialServiceId);
    if (initialDateISO) setDateISO(initialDateISO);
    if (initialTime24) setTime24(initialTime24);
    setCreatedRecord(null);
    setFormError(null);
  }, [open, initialBarberId, initialServiceId, initialDateISO, initialTime24, activeBarbers]);

  const timeSlots = useMemo(
    () => generateTimeSlotsForDate(dateISO, config.hours),
    [dateISO, config.hours]
  );

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.some((slot) => slot.time24 === time24)) {
      setTime24(timeSlots[0].time24);
    }
  }, [timeSlots, time24]);

  const selectedService =
    config.services.find((s) => s.id === selectedServiceId) ?? config.services[0];

  const availableAtSelectedSlot = useMemo(() => {
    if (!dateISO || !time24) return activeBarbers;
    return getAvailableBarbersAtSlot(appointments, activeBarbers, dateISO, time24);
  }, [appointments, activeBarbers, dateISO, time24]);

  // Resolve either the chosen barber or the first free barber when "Cualquiera disponible" is picked
  const resolvedBarber: BarberProfile | undefined = useMemo(() => {
    if (selectedBarberId === 'any') {
      return availableAtSelectedSlot[0];
    }
    return activeBarbers.find((b) => b.id === selectedBarberId) ?? activeBarbers[0];
  }, [selectedBarberId, availableAtSelectedSlot, activeBarbers]);

  const hasConflict = useMemo(() => {
    if (!dateISO || !time24) return false;
    if (selectedBarberId === 'any') {
      return availableAtSelectedSlot.length === 0;
    }
    if (!resolvedBarber) return true;
    return isBarberBusyAtSlot(appointments, resolvedBarber.id, dateISO, time24);
  }, [appointments, selectedBarberId, availableAtSelectedSlot, resolvedBarber, dateISO, time24]);

  const availableOtherBarbers = useMemo(() => {
    return availableAtSelectedSlot.filter((b) => b.id !== resolvedBarber?.id);
  }, [availableAtSelectedSlot, resolvedBarber]);

  const nextAvailableSlotForBarber = useMemo(() => {
    if (selectedBarberId === 'any') {
      return (
        timeSlots.find(
          (slot) =>
            getAvailableBarbersAtSlot(appointments, activeBarbers, dateISO, slot.time24).length > 0
        ) ?? null
      );
    }
    if (!resolvedBarber) return null;
    return (
      timeSlots.find(
        (slot) => !isBarberBusyAtSlot(appointments, resolvedBarber.id, dateISO, slot.time24)
      ) ?? null
    );
  }, [appointments, activeBarbers, selectedBarberId, resolvedBarber, dateISO, timeSlots]);

  const selectedSlotObj = timeSlots.find((s) => s.time24 === time24) ?? timeSlots[0];
  const isSunHoliday = isSundayOrHoliday(dateISO);

  const buildWhatsAppUrl = (
    barber: BarberProfile | undefined,
    record?: AppointmentRecord
  ): string => {
    if (!barber || !selectedService) return 'https://wa.me/';
    const targetPhone = toWhatsAppInternational(barber.whatsapp);
    const nameTxt = record ? record.customerName : sanitizeText(customerName) || '[Mi nombre]';
    const phoneTxt = record
      ? record.customerPhone
      : sanitizePhone(customerPhone) || '[Mi WhatsApp]';
    const locTxt = record
      ? record.customerLocation
      : sanitizeText(customerLocation) || '[Mi ubicación]';
    const notesTxt = (record?.notes ?? sanitizeText(notes))
      ? `\n• Nota para el barbero: ${record?.notes ?? sanitizeText(notes)}`
      : '';

    const message = [
      `Hola *${barber.name}* (${config.name}), envío mi solicitud de cita:`,
      ``,
      `• *Cliente:* ${nameTxt}`,
      `• *Teléfono / WhatsApp:* ${phoneTxt}`,
      `• *Ubicación:* ${locTxt}`,
      `• *Servicio:* ${selectedService.name} (${formatCop(selectedService.priceCop)})`,
      `• *Fecha:* ${formatDateSpanish(dateISO)}`,
      `• *Hora exacta:* ${selectedSlotObj?.timeLabel ?? time24}`,
      notesTxt,
      ``,
      `_Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012._`,
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  };

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = sanitizeText(customerName, 90);
    const cleanPhone = sanitizePhone(customerPhone);
    const cleanLocation = sanitizeText(customerLocation, 140);
    const cleanNotes = sanitizeText(notes, 300);

    if (!cleanName || cleanName.length < 3) {
      setFormError('Por favor ingresa tu nombre completo (obligatorio).');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      setFormError('Por favor ingresa un número telefónico o WhatsApp válido.');
      return;
    }
    if (!cleanLocation || cleanLocation.length < 3) {
      setFormError('Por favor ingresa tu ubicación (dirección, edificio o barrio).');
      return;
    }
    if (!resolvedBarber || !selectedService || hasConflict) {
      setFormError(
        `No hay disponibilidad en ese horario. Por favor elige otro barbero o cambia la hora.`
      );
      return;
    }
    if (!acceptedPrivacy) {
      setFormError(
        'Debes autorizar el uso de tus datos personales conforme a la Ley 1581 de 2012 de Colombia.'
      );
      return;
    }

    setFormError(null);
    const newRecord: AppointmentRecord = {
      id: `LSB-${Date.now().toString().slice(-5)}`,
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerLocation: cleanLocation,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      priceCop: selectedService.priceCop,
      barberId: resolvedBarber.id,
      barberName: resolvedBarber.name,
      dateISO,
      time24,
      timeLabel: selectedSlotObj?.timeLabel ?? time24,
      notes: cleanNotes || undefined,
      acceptedPrivacyLaw: true,
      privacyTimestamp: new Date().toISOString(),
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
      unreadByBarber: true,
    };

    onSubmitBooking(newRecord);
    setCreatedRecord(newRecord);

    const waLink = buildWhatsAppUrl(resolvedBarber, newRecord);
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
    >
      <div className="w-full sm:max-w-2xl max-h-[93vh] flex flex-col rounded-t-2xl sm:rounded-xl border border-[#D4AF37]/25 bg-[#242220] shadow-2xl overflow-hidden">
        <div className="sm:hidden w-10 h-1 bg-[#4D4635] rounded-full mx-auto mt-3 shrink-0" />

        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[#D4AF37]/15 shrink-0">
          <div>
            <h2 id="booking-title" className="font-editorial text-2xl font-semibold text-[#F7F4EA]">
              {createdRecord ? 'Solicitud Lista — Enviar por WhatsApp' : 'Tu Próxima Cita Comienza Aquí'}
            </h2>
            <p className="text-xs text-[#8C857B] mt-0.5">
              {config.name} · {config.address}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario de cita"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#8C857B] hover:text-[#F7F4EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdRecord ? (
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#F7F4EA]">
                  Solicitud registrada sin cruces ({createdRecord.id})
                </p>
                <p className="text-xs text-[#D0C5AF] leading-relaxed">
                  Importante: La solicitud queda en estado <strong>Pendiente</strong> hasta que{' '}
                  <strong>{createdRecord.barberName}</strong> responda y confirme tu turno por WhatsApp.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[#8C857B]">Barbero asignado:</span>
                <span className="font-semibold text-[#F7F4EA]">{createdRecord.barberName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#8C857B]">Fecha y Hora:</span>
                <span className="font-semibold text-[#F2CA50] tabular-nums">
                  {formatDateSpanish(createdRecord.dateISO)} · {createdRecord.timeLabel}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#8C857B]">Servicio:</span>
                <span className="font-semibold text-[#F7F4EA] text-right">
                  {createdRecord.serviceName} ({formatCop(createdRecord.priceCop)})
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#8C857B]">Ubicación:</span>
                <span className="text-[#D0C5AF] text-right">{createdRecord.customerLocation}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pb-safe">
              <a
                href={buildWhatsAppUrl(
                  config.barbers.find((b) => b.id === createdRecord.barberId),
                  createdRecord
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[48px] rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#131313] font-bold text-sm px-5 inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Enviar ahora a WhatsApp de {createdRecord.barberName}</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] rounded-lg border border-[#D4AF37]/30 bg-[#1C1B1B] hover:bg-[#2A2A2A] text-[#F7F4EA] font-semibold text-sm px-5 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Important Confirmation Notice */}
              <div className="rounded-lg border border-[#D4AF37]/25 bg-[#1C1B1B] px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-[#D0C5AF]">
                <Info className="w-4 h-4 text-[#F2CA50] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#F7F4EA]">Importante:</strong> La solicitud no queda confirmada hasta que el barbero responda y confirme el turno por WhatsApp.
                </span>
              </div>

              {/* Barber & Service Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="modal-barber"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] mb-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Barbero *</span>
                  </label>
                  <select
                    id="modal-barber"
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-sm text-[#F7F4EA] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="any">Cualquiera disponible</option>
                    {activeBarbers.map((barber) => (
                      <option key={barber.id} value={barber.id}>
                        {barber.name} — WhatsApp {barber.whatsapp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="modal-service"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] mb-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Servicio *</span>
                  </label>
                  <select
                    id="modal-service"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-sm text-[#F7F4EA] focus:outline-none focus:border-[#D4AF37]"
                  >
                    {config.services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} ({formatCop(svc.priceCop)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calendar Date & Clock */}
              <div className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label
                      htmlFor="modal-date"
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] mb-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Fecha *</span>
                    </label>
                    <input
                      id="modal-date"
                      type="date"
                      min={getTodayISO()}
                      value={dateISO}
                      onChange={(e) => setDateISO(e.target.value)}
                      required
                      className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-sm text-[#F7F4EA] tabular-nums focus:outline-none focus:border-[#D4AF37] [color-scheme:dark]"
                    />
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs font-semibold text-[#F2CA50] block">
                      {isSunHoliday ? 'Horario Domingo / Festivo' : 'Horario Lunes a Sábado'}
                    </span>
                    <span className="text-xs text-[#8C857B]">
                      {isSunHoliday ? config.hours.sundayLabel : config.hours.weekdayLabel}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Hora exacta *</span>
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-1">
                    {timeSlots.map((slot) => {
                      const busy =
                        selectedBarberId === 'any'
                          ? getAvailableBarbersAtSlot(appointments, activeBarbers, dateISO, slot.time24)
                              .length === 0
                          : resolvedBarber
                            ? isBarberBusyAtSlot(
                                appointments,
                                resolvedBarber.id,
                                dateISO,
                                slot.time24
                              )
                            : false;
                      const isSelected = slot.time24 === time24;
                      return (
                        <button
                          key={slot.time24}
                          type="button"
                          onClick={() => setTime24(slot.time24)}
                          className={`min-h-[42px] px-2 py-1.5 rounded-lg border text-xs font-semibold tabular-nums transition-colors cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? busy
                                ? 'border-[#FFB4AB] bg-[#93000A]/40 text-[#FFB4AB]'
                                : 'border-[#D4AF37] bg-[#D4AF37] text-[#131313]'
                              : busy
                                ? 'border-[#D4AF37]/10 bg-[#181716]/60 text-[#8C857B] line-through'
                                : 'border-[#D4AF37]/20 bg-[#181716] text-[#F7F4EA] hover:border-[#D4AF37]/60'
                          }`}
                        >
                          <span>{slot.timeLabel}</span>
                          {busy && (
                            <span className="text-[9px] font-medium no-underline text-[#FFB4AB]">
                              Ocupado
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {hasConflict && (
                  <div
                    role="alert"
                    className="rounded-lg border border-[#FFB4AB]/40 bg-[#93000A]/30 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#FFB4AB] shrink-0 mt-0.5" />
                      <div className="text-xs text-[#FFDAD6] leading-relaxed">
                        <strong>Sin disponibilidad en esta hora:</strong> Para evitar cruces de citas, elige otro barbero disponible o cambia la hora:
                      </div>
                    </div>

                    {availableOtherBarbers.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2 pl-6">
                        {availableOtherBarbers.map((alt) => (
                          <button
                            key={alt.id}
                            type="button"
                            onClick={() => setSelectedBarberId(alt.id)}
                            className="min-h-[34px] px-3 py-1 rounded-md bg-[#D4AF37] text-[#131313] text-xs font-bold hover:bg-[#F2CA50] transition-colors cursor-pointer"
                          >
                            Elegir a {alt.name}
                          </button>
                        ))}
                      </div>
                    ) : nextAvailableSlotForBarber ? (
                      <div className="flex flex-wrap items-center gap-2 pl-6">
                        <button
                          type="button"
                          onClick={() => setTime24(nextAvailableSlotForBarber.time24)}
                          className="min-h-[34px] px-3 py-1 rounded-md bg-[#D4AF37] text-[#131313] text-xs font-bold hover:bg-[#F2CA50] transition-colors cursor-pointer"
                        >
                          Cambiar a {nextAvailableSlotForBarber.timeLabel}
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Mandatory Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="modal-name"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] mb-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Nombre completo *</span>
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    maxLength={90}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3.5 text-sm text-[#F7F4EA] placeholder:text-[#8C857B]/70 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-phone"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] mb-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp / teléfono *</span>
                  </label>
                  <input
                    id="modal-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Tu número de contacto"
                    className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3.5 text-sm text-[#F7F4EA] tabular-nums placeholder:text-[#8C857B]/70 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="modal-location"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] mb-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Ubicación (dirección, edificio, barrio) *</span>
                  </label>
                  <input
                    id="modal-location"
                    type="text"
                    required
                    maxLength={140}
                    value={customerLocation}
                    onChange={(e) => setCustomerLocation(e.target.value)}
                    placeholder="Barrio, edificio o dirección"
                    className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3.5 text-sm text-[#F7F4EA] placeholder:text-[#8C857B]/70 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-notes"
                    className="block text-xs font-semibold text-[#8C857B] mb-1.5"
                  >
                    Nota para el barbero (opcional)
                  </label>
                  <input
                    id="modal-notes"
                    type="text"
                    maxLength={300}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Cuéntanos algún detalle de tu estilo..."
                    className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3.5 text-sm text-[#F7F4EA] placeholder:text-[#8C857B]/70 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Mandatory Ley 1581 de 2012 Consent */}
              <div className="rounded-lg border border-[#D4AF37]/25 bg-[#181716] p-3.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#D4AF37] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-[#D0C5AF] leading-relaxed">
                    Autorizo el tratamiento de mis datos personales conforme a la{' '}
                    <strong className="text-[#F7F4EA]">
                      Ley Estatutaria 1581 de 2012 (Artículos 5, 6, 9 y 12) y Decreto 1377 de 2013 de Colombia
                    </strong>{' '}
                    para gestionar esta solicitud de cita.{' '}
                    <button
                      type="button"
                      onClick={onOpenPrivacy}
                      className="text-[#D4AF37] underline underline-offset-2 hover:text-[#F2CA50] cursor-pointer"
                    >
                      Política de privacidad
                    </button>
                    .
                  </span>
                </label>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-[#FFDAD6] bg-[#93000A]/35 border border-[#FFB4AB]/40 rounded-lg px-3.5 py-2.5"
                >
                  {formError}
                </p>
              )}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-[#D4AF37]/15 bg-[#1C1B1B] pb-safe shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#8C857B]">
                <Lock className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span>
                  {resolvedBarber
                    ? `WhatsApp destino: ${resolvedBarber.name}`
                    : 'Sin barbero disponible en esta hora'}
                </span>
              </div>

              <button
                type="submit"
                disabled={hasConflict}
                className="w-full sm:w-auto min-h-[48px] px-6 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] disabled:opacity-45 disabled:cursor-not-allowed text-[#131313] font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Enviar solicitud por WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
