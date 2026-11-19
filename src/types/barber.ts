export type AppTab = 'inicio' | 'servicios' | 'equipo' | 'agenda' | 'admin';

export type AppointmentStatus = 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';

export interface ServiceItem {
  id: string;
  name: string;
  priceCop: number;
  durationMinutes: number;
  description: string;
}

export interface BarberProfile {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  bio: string;
  positiveMessage: string;
  whatsapp: string; // 10-digit Colombian mobile e.g. 3045369661
  photoUrl: string;
  active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
}

export interface ShopHoursConfig {
  weekdayOpen: string; // HH:mm 24h e.g. "09:00"
  weekdayClose: string; // HH:mm 24h e.g. "20:30"
  weekdayLabel: string;
  sundayOpen: string; // HH:mm 24h e.g. "10:00"
  sundayClose: string; // HH:mm 24h e.g. "18:00"
  sundayLabel: string;
}

export interface ShopConfig {
  name: string;
  subtitle: string;
  welcomeText: string;
  address: string;
  instagramHandle: string;
  instagramUrl: string;
  facebookUrl: string;
  email: string;
  extraServicesNote: string;
  hours: ShopHoursConfig;
  services: ServiceItem[];
  barbers: BarberProfile[];
  gallery: GalleryItem[];
}

export interface AppointmentRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerLocation: string;
  serviceId: string;
  serviceName: string;
  priceCop: number;
  barberId: string;
  barberName: string;
  dateISO: string; // YYYY-MM-DD
  time24: string; // HH:mm
  timeLabel: string; // e.g. "10:30 a. m."
  notes?: string;
  acceptedPrivacyLaw: boolean;
  privacyTimestamp: string;
  status: AppointmentStatus;
  createdAt: string;
  unreadByBarber?: boolean;
}
