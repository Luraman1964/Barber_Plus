export type ServiceCategory = 'todos' | 'corte' | 'barba' | 'ritual';

export interface BarbershopService {
  id: string;
  name: string;
  category: Exclude<ServiceCategory, 'todos'>;
  durationMinutes: number;
  priceCop: number;
  description: string;
}

export type BarberStatus = 'Disponible' | 'En servicio' | 'Fuera de turno';

export interface Barber {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
  specialties: string[];
  status: BarberStatus;
  nextSlot: string;
  portraitUrl: string;
  whatsappPhone: string;
}

export interface BookingRecord {
  id: string;
  serviceIds: string[];
  serviceNames: string[];
  totalPriceCop: number;
  totalDurationMinutes: number;
  barberId: string;
  barberName: string;
  dateLabel: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  createdAt: string;
}

export const BARBERSHOP_INFO = {
  name: 'Casa & Navaja',
  subtitle: 'Barbería de Autor',
  address: 'Calle 85 # 12-48, Zona T, Bogotá',
  hours: 'Mar – Sáb 9:00 a. m. – 8:00 p. m. · Dom 10:00 a. m. – 5:00 p. m.',
  whatsappNumber: '573001234567',
  heroImage: '/src/assets/images/hero_barbershop_1795106567058.jpg',
};

export const SERVICES: BarbershopService[] = [
  {
    id: 'corte-autor',
    name: 'Corte Clásico de Autor',
    category: 'corte',
    durationMinutes: 45,
    priceCop: 55000,
    description: 'Diagnóstico capilar, corte a tijera y máquina, lavado con tónico de cedro y peinado final.',
  },
  {
    id: 'fade-precision',
    name: 'Degradado de Precisión (Skin Fade)',
    category: 'corte',
    durationMinutes: 45,
    priceCop: 60000,
    description: 'Desvanecido limpio con navaja, perfilado de contornos y acabado mate natural.',
  },
  {
    id: 'ritual-barba',
    name: 'Ritual de Barba & Toalla Caliente',
    category: 'barba',
    durationMinutes: 35,
    priceCop: 45000,
    description: 'Perfilado tradicional con navaja, doble toalla caliente con eucalipto y aceite de sándalo.',
  },
  {
    id: 'afeitado-clasico',
    name: 'Afeitado Tradicional a Navaja',
    category: 'barba',
    durationMinutes: 40,
    priceCop: 48000,
    description: 'Espuma tibia de brocha de tejón, doble pasada a navaja y bálsamo calmante post-afeitado.',
  },
  {
    id: 'experiencia-cofradia',
    name: 'Experiencia Casa & Navaja',
    category: 'ritual',
    durationMinutes: 80,
    priceCop: 92000,
    description: 'Corte de autor completo, ritual de barba con toalla caliente, mascarilla purificante y bebida de cortesía.',
  },
  {
    id: 'camuflaje-canas',
    name: 'Matización Natural de Canas',
    category: 'ritual',
    durationMinutes: 30,
    priceCop: 50000,
    description: 'Tono progresivo sin amoníaco que difumina canas conservando un aspecto sobrio y natural.',
  },
];

export const BARBERS: Barber[] = [
  {
    id: 'mateo',
    name: 'Mateo Restrepo',
    role: 'Maestro Barbero Fundador',
    experienceYears: 12,
    specialties: ['Corte a tijera', 'Barba esculpida', 'Afeitado clásico'],
    status: 'Disponible',
    nextSlot: 'Hoy, 11:30 a. m.',
    portraitUrl: '/src/assets/images/barber_mateo_1795106580388.jpg',
    whatsappPhone: '573001234567',
  },
  {
    id: 'santiago',
    name: 'Santiago Ospina',
    role: 'Especialista en Precisión',
    experienceYears: 7,
    specialties: ['Skin Fade', 'Diseño de contornos', 'Texturizado'],
    status: 'En servicio',
    nextSlot: 'Hoy, 2:00 p. m.',
    portraitUrl: '/src/assets/images/barber_santiago_1795106579063.jpg',
    whatsappPhone: '573001234567',
  },
  {
    id: 'carlos',
    name: 'Carlos Mendoza',
    role: 'Barbero Tradicional Senior',
    experienceYears: 16,
    specialties: ['Ritual de toalla caliente', 'Corte ejecutivo', 'Navaja libre'],
    status: 'Fuera de turno',
    nextSlot: 'Mañana, 9:30 a. m.',
    portraitUrl: '/src/assets/images/barber_carlos_1795106580226.jpg',
    whatsappPhone: '573001234567',
  },
];

export const TIME_SLOTS = [
  '09:30 a. m.',
  '10:30 a. m.',
  '11:30 a. m.',
  '01:00 p. m.',
  '02:00 p. m.',
  '03:30 p. m.',
  '04:30 p. m.',
  '06:00 p. m.',
  '07:00 p. m.',
];

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getUpcomingDays(count = 7): { id: string; dayShort: string; dayNumber: string; fullLabel: string }[] {
  const days: { id: string; dayShort: string; dayNumber: string; fullLabel: string }[] = [];
  const today = new Date();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayShort = i === 0 ? 'Hoy' : i === 1 ? 'Mañ' : dayNames[d.getDay()];
    const dayNumber = String(d.getDate()).padStart(2, '0');
    const fullLabel = `${dayNames[d.getDay()]} ${d.getDate()} de ${monthNames[d.getMonth()]}`;
    days.push({
      id: d.toISOString().slice(0, 10),
      dayShort,
      dayNumber,
      fullLabel,
    });
  }
  return days;
}
