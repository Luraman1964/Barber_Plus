import { AppointmentRecord, ShopConfig } from '../types/barber';

export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  name: 'La Santa Barber',
  subtitle: 'BARBERÍA · ESTILO · TRADICIÓN · EST. 2025',
  welcomeText:
    'Espacio elegante de relajación y estilo masculino. Un lugar para renovar tu imagen, disfrutar el ritual y salir con el estilo que te representa.',
  address: 'Calle 38 No. 44 – 42, Calle Vieja',
  instagramHandle: 'la_santa.barber_',
  instagramUrl: 'https://www.instagram.com/la_santa.barber_/',
  facebookUrl: 'https://www.facebook.com/search/top?q=La%20Santa%20Barber',
  email: 'neiker_2532@icloud.com',
  extraServicesNote:
    'Se manejan precios similares o iguales para niños y jóvenes. Los demás servicios y tarifas se consultan directamente con la administración.',
  hours: {
    weekdayOpen: '09:00',
    weekdayClose: '20:30',
    weekdayLabel: 'Lun–Sáb · 9:00 a. m. – 8:30 p. m.',
    sundayOpen: '10:00',
    sundayClose: '18:00',
    sundayLabel: 'Domingos y festivos · 10:00 a. m. – 6:00 p. m.',
  },
  services: [
    {
      id: 'corte-normal',
      name: 'Corte de cabello normal caballero',
      priceCop: 22000,
      durationMinutes: 40,
      description:
        'Incluye el pulido y arreglo de cejas. Acabado clásico o moderno (tarifa similar para niños y jóvenes).',
    },
    {
      id: 'corte-barba',
      name: 'Corte Caballero con Barba',
      priceCop: 27000,
      durationMinutes: 55,
      description:
        'Corte completo de cabello acompañado de perfilado, rebaje y cuidado tradicional de barba y bigote.',
    },
    {
      id: 'corte-especial',
      name: 'Cortes especiales con diseños personalizados',
      priceCop: 30000,
      durationMinutes: 60,
      description:
        'Cortes artísticos con diseños personalizados, skin fade de alta precisión y definición a navaja.',
    },
  ],
  barbers: [
    {
      id: 'junior',
      name: 'Junior',
      specialty: 'Especialista en cortes con estilo, arte en tu cabello',
      experienceYears: 6,
      bio: 'Más de 5 años de experiencia en cortes masculinos, niños y niñas, con dominio en estilos urbanos, clásicos y pulido de barba y bigote.',
      positiveMessage:
        'Cada visita es una oportunidad para renovar tu confianza con un estilo único.',
      whatsapp: '3045369661',
      photoUrl: '/src/assets/images/barber_junior_1795107153185.jpg',
      active: true,
    },
    {
      id: 'gabriel',
      name: 'Gabriel',
      specialty: 'Barbero profesional especialista en cortes con estilo y artísticos, corte de barba y fade',
      experienceYears: 7,
      bio: 'Más de 5 años de trayectoria en peluquería masculina, juvenil e infantil. Formación en degradados fade, diseños artísticos y barba.',
      positiveMessage:
        'El buen gusto y la precisión en cada línea hablan por ti antes de decir una palabra.',
      whatsapp: '3001100102',
      photoUrl: '/src/assets/images/barber_gabriel_1795107153793.jpg',
      active: true,
    },
    {
      id: 'esteban',
      name: 'Esteban',
      specialty: 'Maestro experto con la navaja, cortes precisos de barba y bigote, cortes de cabello con estilo',
      experienceYears: 8,
      bio: 'Más de 5 años perfeccionando el oficio tradicional a navaja libre, cortes para caballero, niños y niñas, y pulido de barba y bigote.',
      positiveMessage:
        'Tómate un respiro de la rutina; aquí cuidamos cada detalle con calma y respeto.',
      whatsapp: '3502885169',
      photoUrl: '/src/assets/images/barber_esteban_1795107152754.jpg',
      active: true,
    },
  ],
  gallery: [
    {
      id: 'craft-corte',
      title: 'Corte Clásico & Juvenil',
      caption: 'Atención paciente y detallista para caballeros, adultos mayores, jóvenes y niños.',
      imageUrl: '/src/assets/images/gallery_haircut_craft_1795107153231.jpg',
    },
    {
      id: 'craft-barba',
      title: 'Pulido de Barba a Navaja',
      caption: 'Precisión tradicional, simetría y cuidado para barba y bigote.',
      imageUrl: '/src/assets/images/gallery_beard_ritual_1795107153532.jpg',
    },
    {
      id: 'craft-diseno',
      title: 'Fade & Diseños Personalizados',
      caption: 'Degradados limpios y líneas artísticas adaptadas a tu estilo.',
      imageUrl: '/src/assets/images/gallery_artistic_design_1795107152968.jpg',
    },
  ],
};

export function createInitialDemoAppointments(): AppointmentRecord[] {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayISO = `${yyyy}-${mm}-${dd}`;

  return [
    {
      id: 'LSB-101',
      customerName: 'Andrés Salcedo',
      customerPhone: '3014528890',
      customerLocation: 'Calle Vieja, Edificio Alcázar',
      serviceId: 'corte-barba',
      serviceName: 'Corte Caballero con Barba',
      priceCop: 27000,
      barberId: 'junior',
      barberName: 'Junior',
      dateISO: todayISO,
      time24: '10:30',
      timeLabel: '10:30 a. m.',
      acceptedPrivacyLaw: true,
      privacyTimestamp: new Date().toISOString(),
      status: 'Confirmada',
      createdAt: new Date().toISOString(),
      unreadByBarber: false,
    },
    {
      id: 'LSB-102',
      customerName: 'Julián Torres',
      customerPhone: '3127784412',
      customerLocation: 'Calle 38, Casa 14',
      serviceId: 'corte-especial',
      serviceName: 'Cortes especiales con diseños personalizados',
      priceCop: 30000,
      barberId: 'gabriel',
      barberName: 'Gabriel',
      dateISO: todayISO,
      time24: '15:00',
      timeLabel: '03:00 p. m.',
      acceptedPrivacyLaw: true,
      privacyTimestamp: new Date().toISOString(),
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
      unreadByBarber: true,
    },
  ];
}
