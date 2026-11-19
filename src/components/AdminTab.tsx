import React, { useMemo, useState } from 'react';
import {
  Check,
  Download,
  FileSpreadsheet,
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  AppointmentRecord,
  AppointmentStatus,
  BarberProfile,
  ServiceItem,
  ShopConfig,
} from '../types/barber';
import {
  formatCop,
  formatDateSpanish,
  formatTime24To12,
  getTodayISO,
  hashPinSha256,
  isBarberBusyAtSlot,
  isSafeUrl,
  sanitizePhone,
  sanitizeText,
  sortAppointmentsChronologically,
} from '../utils/security';

interface AdminTabProps {
  config: ShopConfig;
  appointments: AppointmentRecord[];
  pinHash: string;
  isDefaultPin: boolean;
  onUpdateConfig: (next: ShopConfig) => void;
  onUpdatePinHash: (nextHash: string) => void;
  onAddAppointment: (record: AppointmentRecord) => void;
  onUpdateAppointment: (updated: AppointmentRecord) => void;
  onDeleteAppointment: (id: string) => void;
  onClearCancelled: () => void;
  onResetDefaults: () => void;
}

type AdminSubTab = 'gerencia' | 'negocio' | 'servicios' | 'equipo';

export const AdminTab: React.FC<AdminTabProps> = ({
  config,
  appointments,
  pinHash,
  isDefaultPin,
  onUpdateConfig,
  onUpdatePinHash,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onClearCancelled,
  onResetDefaults,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<AdminSubTab>('gerencia');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Owner panel filters (inspired by attached index_afd16a02.html)
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | AppointmentStatus>('all');

  // Manual booking dialog state
  const [manualOpen, setManualOpen] = useState(false);
  const [mName, setMName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mLocation, setMLocation] = useState('Presencial / WhatsApp');
  const [mServiceId, setMServiceId] = useState(config.services[0]?.id ?? '');
  const [mBarberId, setMBarberId] = useState(config.barbers[0]?.id ?? '');
  const [mDate, setMDate] = useState(getTodayISO());
  const [mTime, setMTime] = useState('10:00');

  // Local editable drafts
  const [draftConfig, setDraftConfig] = useState<ShopConfig>(config);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const showFeedback = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  const stats = useMemo(() => {
    const base = filterDate
      ? appointments.filter((a) => a.dateISO === filterDate)
      : appointments;
    return {
      total: base.length,
      pendientes: base.filter((a) => a.status === 'Pendiente').length,
      confirmadas: base.filter((a) => a.status === 'Confirmada').length,
      completadas: base.filter((a) => a.status === 'Completada').length,
      canceladas: base.filter((a) => a.status === 'Cancelada').length,
    };
  }, [appointments, filterDate]);

  const filteredAppointments = useMemo(() => {
    let list = sortAppointmentsChronologically(appointments);
    if (filterDate) {
      list = list.filter((a) => a.dateISO === filterDate);
    }
    if (filterStatus !== 'all') {
      list = list.filter((a) => a.status === filterStatus);
    }
    return list;
  }, [appointments, filterDate, filterStatus]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredHash = await hashPinSha256(pinInput.trim());
    if (enteredHash === pinHash) {
      setDraftConfig(config);
      setUnlocked(true);
      setPinError(null);
      setPinInput('');
    } else {
      setPinError('Clave de administrador incorrecta.');
    }
  };

  const handleSaveShopAndHours = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: ShopConfig = {
      ...draftConfig,
      name: sanitizeText(draftConfig.name, 60) || 'La Santa Barber',
      subtitle: sanitizeText(draftConfig.subtitle, 90),
      welcomeText: sanitizeText(draftConfig.welcomeText, 320),
      address: sanitizeText(draftConfig.address, 120),
      instagramHandle: sanitizeText(draftConfig.instagramHandle, 50),
      instagramUrl: isSafeUrl(draftConfig.instagramUrl)
        ? draftConfig.instagramUrl
        : config.instagramUrl,
      facebookUrl: isSafeUrl(draftConfig.facebookUrl)
        ? draftConfig.facebookUrl
        : config.facebookUrl,
      email: sanitizeText(draftConfig.email, 90),
      extraServicesNote: sanitizeText(draftConfig.extraServicesNote, 240),
    };
    onUpdateConfig(cleaned);
    showFeedback('Datos del negocio y horarios actualizados correctamente.');
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      showFeedback('El nuevo PIN debe tener al menos 4 caracteres.');
      return;
    }
    if (newPin !== confirmPin) {
      showFeedback('Los PIN ingresados no coinciden.');
      return;
    }
    const nextHash = await hashPinSha256(newPin.trim());
    onUpdatePinHash(nextHash);
    setNewPin('');
    setConfirmPin('');
    showFeedback('PIN de administrador actualizado con cifrado SHA-256.');
  };

  const handleAddService = () => {
    const newSvc: ServiceItem = {
      id: `svc-${Date.now()}`,
      name: 'Nuevo Servicio Personalizado',
      priceCop: 25000,
      durationMinutes: 45,
      description: 'Descripción del servicio y detalles incluidos.',
    };
    const next = { ...draftConfig, services: [...draftConfig.services, newSvc] };
    setDraftConfig(next);
    onUpdateConfig(next);
    showFeedback('Servicio agregado.');
  };

  const handleUpdateService = (index: number, patch: Partial<ServiceItem>) => {
    const updated = draftConfig.services.map((s, i) => (i === index ? { ...s, ...patch } : s));
    setDraftConfig({ ...draftConfig, services: updated });
  };

  const handleDeleteService = (id: string) => {
    if (draftConfig.services.length <= 1) {
      showFeedback('Debe existir al menos 1 servicio activo.');
      return;
    }
    const next = {
      ...draftConfig,
      services: draftConfig.services.filter((s) => s.id !== id),
    };
    setDraftConfig(next);
    onUpdateConfig(next);
    showFeedback('Servicio eliminado.');
  };

  const handleAddBarber = () => {
    const newBarber: BarberProfile = {
      id: `barber-${Date.now()}`,
      name: 'Nuevo Barbero',
      specialty: 'Cortes clásicos, fade y arreglo de barba',
      experienceYears: 5,
      bio: 'Barbero profesional enfocado en atención personalizada para caballeros, jóvenes y niños.',
      positiveMessage: 'Tu estilo y comodidad son nuestra prioridad.',
      whatsapp: '3000000000',
      photoUrl: '/src/assets/images/barber_junior_1795107153185.jpg',
      active: true,
    };
    const next = { ...draftConfig, barbers: [...draftConfig.barbers, newBarber] };
    setDraftConfig(next);
    onUpdateConfig(next);
    showFeedback('Barbero agregado al equipo.');
  };

  const handleUpdateBarber = (index: number, patch: Partial<BarberProfile>) => {
    const updated = draftConfig.barbers.map((b, i) => (i === index ? { ...b, ...patch } : b));
    setDraftConfig({ ...draftConfig, barbers: updated });
  };

  const handlePhotoUpload = (index: number, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showFeedback('Solo se permiten archivos de imagen.');
      return;
    }
    if (file.size > 1024 * 1024 * 1.5) {
      showFeedback('La imagen debe pesar menos de 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateBarber(index, { photoUrl: reader.result });
        showFeedback('Foto cargada. Pulsa Guardar Cambios para aplicar.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteBarber = (id: string) => {
    if (draftConfig.barbers.length <= 1) {
      showFeedback('Debe permanecer al menos 1 barbero (modo uso individual).');
      return;
    }
    const next = {
      ...draftConfig,
      barbers: draftConfig.barbers.filter((b) => b.id !== id),
    };
    setDraftConfig(next);
    onUpdateConfig(next);
    showFeedback('Barbero retirado.');
  };

  const handleReassignAppointment = (appt: AppointmentRecord, newBarberId: string) => {
    const targetBarber = config.barbers.find((b) => b.id === newBarberId);
    if (!targetBarber) return;
    const busy = isBarberBusyAtSlot(
      appointments,
      newBarberId,
      appt.dateISO,
      appt.time24,
      appt.id
    );
    if (busy) {
      showFeedback(
        `No se puede reasignar: ${targetBarber.name} ya tiene cita el ${appt.dateISO} a las ${appt.timeLabel}.`
      );
      return;
    }
    onUpdateAppointment({
      ...appt,
      barberId: targetBarber.id,
      barberName: targetBarber.name,
    });
    showFeedback(`Cita ${appt.id} reasignada a ${targetBarber.name} sin cruces.`);
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const svc = config.services.find((s) => s.id === mServiceId) ?? config.services[0];
    const barber = config.barbers.find((b) => b.id === mBarberId) ?? config.barbers[0];
    if (!svc || !barber) return;

    const busy = isBarberBusyAtSlot(appointments, barber.id, mDate, mTime);
    if (busy) {
      showFeedback(
        `Conflicto: ${barber.name} ya tiene una cita registrada el ${mDate} a las ${formatTime24To12(mTime)}.`
      );
      return;
    }

    const record: AppointmentRecord = {
      id: `LSB-${Date.now().toString().slice(-5)}`,
      customerName: sanitizeText(mName, 80) || 'Cliente WhatsApp',
      customerPhone: sanitizePhone(mPhone) || '3000000000',
      customerLocation: sanitizeText(mLocation, 120) || 'Presencial',
      serviceId: svc.id,
      serviceName: svc.name,
      priceCop: svc.priceCop,
      barberId: barber.id,
      barberName: barber.name,
      dateISO: mDate,
      time24: mTime,
      timeLabel: formatTime24To12(mTime),
      acceptedPrivacyLaw: true,
      privacyTimestamp: new Date().toISOString(),
      status: 'Confirmada',
      createdAt: new Date().toISOString(),
      unreadByBarber: false,
    };

    onAddAppointment(record);
    setManualOpen(false);
    setMName('');
    setMPhone('');
    showFeedback(`Cita ${record.id} registrada en la agenda local.`);
  };

  const handleExportCsv = () => {
    const header = ['ID', 'Fecha', 'Hora', 'Cliente', 'Telefono', 'Ubicacion', 'Servicio', 'Valor_COP', 'Barbero', 'Estado'];
    const rows = filteredAppointments.map((a) => [
      a.id,
      a.dateISO,
      a.timeLabel,
      `"${a.customerName.replace(/"/g, '""')}"`,
      a.customerPhone,
      `"${a.customerLocation.replace(/"/g, '""')}"`,
      `"${a.serviceName.replace(/"/g, '""')}"`,
      String(a.priceCop),
      a.barberName,
      a.status,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citas-${config.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      config,
      appointments,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo-${config.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.config?.name && Array.isArray(parsed.config.services) && Array.isArray(parsed.config.barbers)) {
          setDraftConfig(parsed.config);
          onUpdateConfig(parsed.config);
          showFeedback('Configuración restaurada desde respaldo JSON.');
        } else {
          showFeedback('El archivo JSON no tiene el formato válido.');
        }
      } catch {
        showFeedback('Error al leer el archivo de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  if (!unlocked) {
    return (
      <section className="max-w-md mx-auto px-4 py-14 sm:py-20">
        <form
          onSubmit={handleUnlock}
          className="rounded-xl border border-[#D4AF37]/25 bg-[#1C1B1B] p-6 sm:p-8 space-y-5 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#3A2B20] border border-[#D4AF37]/30 flex items-center justify-center text-[#F2CA50]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-semibold text-[#F7F4EA]">
                Panel del Propietario
              </h2>
              <p className="text-xs text-[#8C857B]">
                Ingresa el PIN de administración de este dispositivo.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="admin-pin" className="block text-xs font-semibold text-[#C5A059] mb-1.5">
              PIN
            </label>
            <input
              id="admin-pin"
              type="password"
              inputMode="numeric"
              required
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN de 4 o más dígitos"
              className="w-full min-h-[44px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3.5 text-sm text-[#F7F4EA] focus:outline-none focus:border-[#D4AF37]"
            />
            {isDefaultPin && (
              <p className="mt-2 text-xs text-[#8C857B]">
                PIN inicial de demostración: <strong className="text-[#F2CA50]">2026</strong> (cámbialo al entrar).
              </p>
            )}
          </div>

          {pinError && (
            <p role="alert" className="text-xs text-[#FFDAD6] bg-[#93000A]/35 border border-[#FFB4AB]/40 rounded-lg px-3 py-2">
              {pinError}
            </p>
          )}

          <button
            type="submit"
            className="w-full min-h-[46px] rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#131313] font-bold text-sm transition-colors cursor-pointer"
          >
            Entrar al panel
          </button>
        </form>
      </section>
    );
  }

  return (
    <section aria-labelledby="admin-heading" className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#C5A059]">
            Gestión Local · Plantilla Personalizable
          </p>
          <h2 id="admin-heading" className="font-editorial text-3xl font-semibold text-[#F7F4EA]">
            Panel del Propietario
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setUnlocked(false)}
          className="min-h-[40px] px-4 py-2 rounded-lg border border-[#D4AF37]/30 bg-[#1C1B1B] text-xs font-semibold text-[#D0C5AF] hover:text-[#F7F4EA] self-start sm:self-auto cursor-pointer"
        >
          Salir del panel
        </button>
      </div>

      {saveFeedback && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs font-semibold text-emerald-200 flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#1C1B1B] border border-[#D4AF37]/15 w-fit">
        {(
          [
            { id: 'gerencia', label: 'Control de Citas' },
            { id: 'negocio', label: 'Negocio y Horarios' },
            { id: 'servicios', label: 'Servicios' },
            { id: 'equipo', label: 'Barberos (1 a N)' },
          ] as { id: AdminSubTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`min-h-[40px] px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              subTab === t.id
                ? 'bg-[#3A2B20] text-[#F2CA50]'
                : 'text-[#8C857B] hover:text-[#F7F4EA]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'gerencia' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-[#D4AF37]/20 bg-[#1C1B1B] p-4 flex items-start gap-3 text-xs text-[#D0C5AF]">
            <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <p>
              Esta versión guarda los registros en el navegador de este dispositivo. Las solicitudes de los clientes llegan por WhatsApp; puedes registrar citas recibidas manualmente, reasignar barberos sin cruces de horario o exportar a CSV.
            </p>
          </div>

          {/* Toolbar & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="date"
                aria-label="Filtrar citas por fecha"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="min-h-[40px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-xs text-[#F7F4EA] [color-scheme:dark]"
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={() => setFilterDate('')}
                  className="min-h-[40px] px-3 rounded-lg text-xs text-[#D0C5AF] border border-[#D4AF37]/20 hover:border-[#D4AF37] cursor-pointer"
                >
                  Ver todas las fechas
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportCsv}
                className="min-h-[40px] px-3.5 rounded-lg border border-[#D4AF37]/30 bg-[#1C1B1B] hover:border-[#D4AF37] text-xs font-semibold text-[#F7F4EA] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setManualOpen(true)}
                className="min-h-[40px] px-4 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#131313] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar cita recibida por WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total },
              { label: 'Pendientes', value: stats.pendientes },
              { label: 'Confirmadas', value: stats.confirmadas },
              { label: 'Completadas', value: stats.completadas },
              { label: 'Canceladas', value: stats.canceladas },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[#D4AF37]/15 bg-[#1C1B1B] p-3.5 text-center"
              >
                <p className="text-xl font-bold text-[#F2CA50] tabular-nums">{s.value}</p>
                <p className="text-[11px] text-[#8C857B]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[#1C1B1B] border border-[#D4AF37]/15 w-fit">
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 'Pendiente', label: 'Pendientes' },
                { id: 'Confirmada', label: 'Confirmadas' },
                { id: 'Completada', label: 'Completadas' },
                { id: 'Cancelada', label: 'Canceladas' },
              ] as { id: 'all' | AppointmentStatus; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterStatus(f.id)}
                className={`min-h-[36px] px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === f.id
                    ? 'bg-[#3A2B20] text-[#F2CA50]'
                    : 'text-[#8C857B] hover:text-[#F7F4EA]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="rounded-xl border border-[#D4AF37]/15 bg-[#1C1B1B] p-8 text-center text-sm text-[#8C857B]">
                No hay citas que coincidan con los filtros actuales.
              </div>
            ) : (
              filteredAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-[#F2CA50] tabular-nums">{appt.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#F7F4EA] font-semibold">
                        {formatDateSpanish(appt.dateISO)} · {appt.timeLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#D4AF37] font-semibold tabular-nums">
                        {formatCop(appt.priceCop)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#F7F4EA]">
                      {appt.customerName} ({appt.customerPhone}) — {appt.serviceName}
                    </p>
                    <p className="text-xs text-[#8C857B]">Ubicación: {appt.customerLocation}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <select
                      aria-label={`Reasignar barbero para cita ${appt.id}`}
                      value={appt.barberId}
                      onChange={(e) => handleReassignAppointment(appt, e.target.value)}
                      className="min-h-[40px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-xs text-[#F7F4EA]"
                    >
                      {config.barbers.map((b) => (
                        <option key={b.id} value={b.id}>
                          Barbero: {b.name}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label={`Estado de cita ${appt.id}`}
                      value={appt.status}
                      onChange={(e) =>
                        onUpdateAppointment({
                          ...appt,
                          status: e.target.value as AppointmentStatus,
                          unreadByBarber: false,
                        })
                      }
                      className="min-h-[40px] rounded-lg bg-[#181716] border border-[#D4AF37]/25 px-3 text-xs text-[#F7F4EA]"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="Completada">Completada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => onDeleteAppointment(appt.id)}
                      aria-label={`Eliminar cita ${appt.id}`}
                      className="min-h-[40px] px-3 rounded-lg text-xs text-[#FFB4AB] hover:bg-[#93000A]/25 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {stats.canceladas > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClearCancelled();
                  showFeedback('Citas canceladas eliminadas de este dispositivo.');
                }}
                className="min-h-[40px] px-4 rounded-lg border border-[#FFB4AB]/30 text-xs font-semibold text-[#FFB4AB] hover:bg-[#93000A]/25 cursor-pointer"
              >
                Eliminar canceladas de este dispositivo
              </button>
            </div>
          )}
        </div>
      )}

      {subTab === 'negocio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSaveShopAndHours}
            className="lg:col-span-2 rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-6 space-y-5"
          >
            <h3 className="font-editorial text-xl font-semibold text-[#F7F4EA]">
              Identidad, Redes y Horarios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                  Nombre de la Barbería
                </label>
                <input
                  type="text"
                  value={draftConfig.name}
                  onChange={(e) => setDraftConfig({ ...draftConfig, name: e.target.value })}
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                  Dirección física
                </label>
                <input
                  type="text"
                  value={draftConfig.address}
                  onChange={(e) => setDraftConfig({ ...draftConfig, address: e.target.value })}
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                Texto de bienvenida en portada
              </label>
              <textarea
                rows={3}
                value={draftConfig.welcomeText}
                onChange={(e) => setDraftConfig({ ...draftConfig, welcomeText: e.target.value })}
                className="w-full rounded-lg bg-[#181716] border border-[#D4AF37]/20 p-3 text-sm text-[#F7F4EA]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                  Usuario Instagram
                </label>
                <input
                  type="text"
                  value={draftConfig.instagramHandle}
                  onChange={(e) =>
                    setDraftConfig({ ...draftConfig, instagramHandle: e.target.value })
                  }
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={draftConfig.email}
                  onChange={(e) => setDraftConfig({ ...draftConfig, email: e.target.value })}
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D4AF37]/15">
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                  Etiqueta Lunes a Sábado
                </label>
                <input
                  type="text"
                  value={draftConfig.hours.weekdayLabel}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      hours: { ...draftConfig.hours, weekdayLabel: e.target.value },
                    })
                  }
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                  Etiqueta Domingos y Festivos
                </label>
                <input
                  type="text"
                  value={draftConfig.hours.sundayLabel}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      hours: { ...draftConfig.hours, sundayLabel: e.target.value },
                    })
                  }
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#131313] font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </form>

          <div className="space-y-6">
            <form
              onSubmit={handleChangePin}
              className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-[#F2CA50]">
                <KeyRound className="w-4 h-4" />
                <h3 className="font-editorial text-lg font-semibold text-[#F7F4EA]">
                  Cambiar PIN
                </h3>
              </div>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Nuevo PIN (mín. 4 dígitos)"
                className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
              />
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirmar nuevo PIN"
                className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
              />
              <button
                type="submit"
                className="w-full min-h-[42px] rounded-lg border border-[#D4AF37]/40 bg-[#3A2B20] text-[#F2CA50] text-xs font-bold hover:bg-[#4D392A] cursor-pointer"
              >
                Actualizar PIN
              </button>
            </form>

            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-6 space-y-3">
              <h3 className="font-editorial text-lg font-semibold text-[#F7F4EA]">
                Respaldo y Portabilidad
              </h3>
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full min-h-[42px] rounded-lg border border-[#D4AF37]/30 bg-[#181716] text-xs font-semibold text-[#F7F4EA] inline-flex items-center justify-center gap-2 hover:border-[#D4AF37] cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Exportar Respaldo JSON</span>
              </button>
              <label className="w-full min-h-[42px] rounded-lg border border-[#D4AF37]/30 bg-[#181716] text-xs font-semibold text-[#F7F4EA] inline-flex items-center justify-center gap-2 hover:border-[#D4AF37] cursor-pointer">
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                <span>Importar Respaldo JSON</span>
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => handleImportJson(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  onResetDefaults();
                  showFeedback('Valores iniciales de La Santa Barber restaurados.');
                }}
                className="w-full min-h-[42px] rounded-lg border border-[#FFB4AB]/30 text-xs font-semibold text-[#FFB4AB] inline-flex items-center justify-center gap-2 hover:bg-[#93000A]/25 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Plantilla Base</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'servicios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#D0C5AF]">
              Edita nombres, precios en COP y descripciones de cada servicio.
            </p>
            <button
              type="button"
              onClick={handleAddService}
              className="min-h-[42px] px-4 rounded-lg bg-[#D4AF37] text-[#131313] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#F2CA50] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Servicio</span>
            </button>
          </div>

          <div className="space-y-4">
            {draftConfig.services.map((svc, idx) => (
              <div
                key={svc.id}
                className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-5 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                      Nombre del servicio
                    </label>
                    <input
                      type="text"
                      value={svc.name}
                      onChange={(e) => handleUpdateService(idx, { name: e.target.value })}
                      className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                      Precio (COP)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={svc.priceCop}
                      onChange={(e) =>
                        handleUpdateService(idx, { priceCop: Number(e.target.value) || 0 })
                      }
                      className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA] tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                    Descripción e inclusiones
                  </label>
                  <input
                    type="text"
                    value={svc.description}
                    onChange={(e) => handleUpdateService(idx, { description: e.target.value })}
                    className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateConfig(draftConfig);
                      showFeedback('Servicios actualizados.');
                    }}
                    className="min-h-[40px] px-4 rounded-lg bg-[#3A2B20] text-[#F2CA50] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#4D392A] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Servicios</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(svc.id)}
                    className="min-h-[40px] px-3 rounded-lg text-xs text-[#FFB4AB] hover:bg-[#93000A]/25 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'equipo' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-[#D0C5AF]">
              Configura desde 1 barbero independiente (casa o local propio) hasta un equipo completo.
            </p>
            <button
              type="button"
              onClick={handleAddBarber}
              className="min-h-[42px] px-4 rounded-lg bg-[#D4AF37] text-[#131313] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#F2CA50] self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Barbero</span>
            </button>
          </div>

          <div className="space-y-5">
            {draftConfig.barbers.map((b, idx) => (
              <div
                key={b.id}
                className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.photoUrl}
                      alt={b.name}
                      className="w-14 h-14 rounded-full object-cover border border-[#D4AF37]/50"
                    />
                    <div>
                      <h4 className="font-editorial text-xl text-[#F7F4EA]">{b.name}</h4>
                      <label className="text-xs text-[#D4AF37] underline cursor-pointer">
                        Cambiar foto circular
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(idx, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-[#D0C5AF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={b.active}
                      onChange={(e) => handleUpdateBarber(idx, { active: e.target.checked })}
                      className="w-4 h-4 accent-[#D4AF37]"
                    />
                    <span>Visible para reservas</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#C5A059] mb-1">Nombre</label>
                    <input
                      type="text"
                      value={b.name}
                      onChange={(e) => handleUpdateBarber(idx, { name: e.target.value })}
                      className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                      WhatsApp (10 dígitos)
                    </label>
                    <input
                      type="tel"
                      value={b.whatsapp}
                      onChange={(e) =>
                        handleUpdateBarber(idx, { whatsapp: sanitizePhone(e.target.value) })
                      }
                      className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                      Años de experiencia
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={b.experienceYears}
                      onChange={(e) =>
                        handleUpdateBarber(idx, { experienceYears: Number(e.target.value) || 5 })
                      }
                      className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA] tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                      Especialidad
                    </label>
                    <input
                      type="text"
                      value={b.specialty}
                      onChange={(e) => handleUpdateBarber(idx, { specialty: e.target.value })}
                      className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                      Mensaje positivo
                    </label>
                    <input
                      type="text"
                      value={b.positiveMessage}
                      onChange={(e) =>
                        handleUpdateBarber(idx, { positiveMessage: e.target.value })
                      }
                      className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C5A059] mb-1">
                    Reseña de estudios y trayectoria
                  </label>
                  <textarea
                    rows={2}
                    value={b.bio}
                    onChange={(e) => handleUpdateBarber(idx, { bio: e.target.value })}
                    className="w-full rounded-lg bg-[#181716] border border-[#D4AF37]/20 p-3 text-sm text-[#F7F4EA]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateConfig(draftConfig);
                      showFeedback('Equipo actualizado correctamente.');
                    }}
                    className="min-h-[40px] px-4 rounded-lg bg-[#3A2B20] text-[#F2CA50] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#4D392A] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cambios de Equipo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBarber(b.id)}
                    className="min-h-[40px] px-3 rounded-lg text-xs text-[#FFB4AB] hover:bg-[#93000A]/25 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Barbero</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual WhatsApp Booking Modal */}
      {manualOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-booking-title"
        >
          <form
            onSubmit={handleCreateManualBooking}
            className="w-full max-w-md rounded-xl border border-[#D4AF37]/25 bg-[#242220] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 id="manual-booking-title" className="font-editorial text-xl font-semibold text-[#F7F4EA]">
                Registrar Cita Recibida
              </h3>
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#8C857B] hover:text-[#F7F4EA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">Cliente *</label>
                <input
                  type="text"
                  required
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={mPhone}
                  onChange={(e) => setMPhone(e.target.value)}
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C5A059] mb-1">Ubicación</label>
                <input
                  type="text"
                  value={mLocation}
                  onChange={(e) => setMLocation(e.target.value)}
                  className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-3 text-sm text-[#F7F4EA]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#C5A059] mb-1">Servicio</label>
                  <select
                    value={mServiceId}
                    onChange={(e) => setMServiceId(e.target.value)}
                    className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-2.5 text-xs text-[#F7F4EA]"
                  >
                    {config.services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#C5A059] mb-1">Barbero</label>
                  <select
                    value={mBarberId}
                    onChange={(e) => setMBarberId(e.target.value)}
                    className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-2.5 text-xs text-[#F7F4EA]"
                  >
                    {config.barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#C5A059] mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-2.5 text-xs text-[#F7F4EA] [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#C5A059] mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={mTime}
                    onChange={(e) => setMTime(e.target.value)}
                    className="w-full min-h-[42px] rounded-lg bg-[#181716] border border-[#D4AF37]/20 px-2.5 text-xs text-[#F7F4EA] [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#131313] font-bold text-sm cursor-pointer"
            >
              Guardar cita local
            </button>
          </form>
        </div>
      )}
    </section>
  );
};
