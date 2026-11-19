import { AppointmentRecord, BarberProfile, ShopHoursConfig } from '../types/barber';

// Sanitize plain text inputs to strip unsafe angle brackets / control characters
export function sanitizeText(value: string, maxLength = 240): string {
  return value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

// Keep digits only for phone validation
export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 15);
}

export function formatColombianPhone(digits: string): string {
  const clean = sanitizePhone(digits);
  if (clean.length === 10) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  return clean;
}

export function toWhatsAppInternational(phone: string): string {
  const clean = sanitizePhone(phone);
  if (clean.startsWith('57') && clean.length >= 12) return clean;
  if (clean.length === 10) return `57${clean}`;
  return clean;
}

export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  if (url.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Cryptographic SHA-256 hash using Web Crypto API for Admin PIN verification
export async function hashPinSha256(pin: string): Promise<string> {
  const salted = `LaSantaBarber_Salt_2026_${pin}`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const data = new TextEncoder().encode(salted);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback if SubtleCrypto is unavailable in non-secure contexts
  let h = 2166136261;
  for (let i = 0; i < salted.length; i++) {
    h ^= salted.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

// Common Colombian national holidays (MM-DD) for 2026/2027 schedule awareness
const COLOMBIAN_FIXED_HOLIDAYS = new Set([
  '01-01', // Año Nuevo
  '05-01', // Día del Trabajo
  '07-20', // Independencia de Colombia
  '08-07', // Batalla de Boyacá
  '12-08', // Inmaculada Concepción
  '12-25', // Navidad
]);

export function isSundayOrHoliday(dateISO: string): boolean {
  if (!dateISO) return false;
  const [y, m, d] = dateISO.split('-').map(Number);
  if (!y || !m || !d) return false;
  const dateObj = new Date(y, m - 1, d);
  if (dateObj.getDay() === 0) return true; // Domingo
  const mmdd = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return COLOMBIAN_FIXED_HOLIDAYS.has(mmdd);
}

export function formatDateSpanish(dateISO: string): string {
  if (!dateISO) return '';
  const [y, m, d] = dateISO.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

export function formatTime24To12(time24: string): string {
  const [hh, mm] = time24.split(':').map(Number);
  const period = hh >= 12 ? 'p. m.' : 'a. m.';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${String(hour12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${period}`;
}

export interface TimeSlotOption {
  time24: string;
  timeLabel: string;
}

export function generateTimeSlotsForDate(
  dateISO: string,
  hours: ShopHoursConfig
): TimeSlotOption[] {
  const isSunHoliday = isSundayOrHoliday(dateISO);
  const openStr = isSunHoliday ? hours.sundayOpen : hours.weekdayOpen;
  const closeStr = isSunHoliday ? hours.sundayClose : hours.weekdayClose;

  const [openH, openM] = openStr.split(':').map(Number);
  const [closeH, closeM] = closeStr.split(':').map(Number);

  const startMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;

  const slots: TimeSlotOption[] = [];
  for (let mins = startMinutes; mins <= endMinutes - 30; mins += 30) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push({
      time24,
      timeLabel: formatTime24To12(time24),
    });
  }
  return slots;
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isBarberBusyAtSlot(
  appointments: AppointmentRecord[],
  barberId: string,
  dateISO: string,
  time24: string,
  excludeAppointmentId?: string
): boolean {
  return appointments.some(
    (appt) =>
      appt.id !== excludeAppointmentId &&
      appt.status !== 'Cancelada' &&
      appt.barberId === barberId &&
      appt.dateISO === dateISO &&
      appt.time24 === time24
  );
}

export function getAvailableBarbersAtSlot(
  appointments: AppointmentRecord[],
  barbers: BarberProfile[],
  dateISO: string,
  time24: string
): BarberProfile[] {
  return barbers.filter(
    (b) => b.active && !isBarberBusyAtSlot(appointments, b.id, dateISO, time24)
  );
}

export function sortAppointmentsChronologically(
  appointments: AppointmentRecord[]
): AppointmentRecord[] {
  return [...appointments].sort((a, b) => {
    const keyA = `${a.dateISO}T${a.time24}`;
    const keyB = `${b.dateISO}T${b.time24}`;
    return keyA.localeCompare(keyB);
  });
}

// Gentle brass notification chime via Web Audio API when a new appointment arrives
export function playBarberAlertChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.12); // A5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.46);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}
