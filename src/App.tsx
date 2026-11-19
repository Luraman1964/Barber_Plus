import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  Calendar,
  Clock,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  QrCode,
  Scissors,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  AppTab,
  AppointmentRecord,
  ShopConfig,
} from './types/barber';
import {
  DEFAULT_SHOP_CONFIG,
  createInitialDemoAppointments,
} from './data/defaultConfig';
import {
  formatCop,
  getTodayISO,
  hashPinSha256,
  playBarberAlertChime,
  toWhatsAppInternational,
} from './utils/security';
import { BrandLogo } from './components/BrandLogo';
import { BookingModal } from './components/BookingModal';
import { PrivacyModal } from './components/PrivacyModal';
import { ShareQRModal } from './components/ShareQRModal';
import { TeamTab } from './components/TeamTab';
import { AgendaTab } from './components/AgendaTab';
import { AdminTab } from './components/AdminTab';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const CONFIG_STORAGE_KEY = 'la_santa_barber_config_v2';
const APPOINTMENTS_STORAGE_KEY = 'la_santa_barber_appointments_v2';
const PIN_HASH_STORAGE_KEY = 'la_santa_barber_pin_hash_v1';
const DEFAULT_PIN = '2026';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'inicio';
  });

  const [config, setConfig] = useState<ShopConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as ShopConfig) : DEFAULT_SHOP_CONFIG;
    } catch {
      return DEFAULT_SHOP_CONFIG;
    }
  });

  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      return saved
        ? (JSON.parse(saved) as AppointmentRecord[])
        : createInitialDemoAppointments();
    } catch {
      return createInitialDemoAppointments();
    }
  });

  const [pinHash, setPinHash] = useState<string>('');
  const [defaultPinHash, setDefaultPinHash] = useState<string>('');

  useEffect(() => {
    let active = true;
    hashPinSha256(DEFAULT_PIN).then((defHash) => {
      if (!active) return;
      setDefaultPinHash(defHash);
      try {
        const stored = localStorage.getItem(PIN_HASH_STORAGE_KEY);
        setPinHash(stored || defHash);
      } catch {
        setPinHash(defHash);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveTab('admin');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore storage quota errors
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    } catch {
      // Ignore storage quota errors
    }
  }, [appointments]);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingBarberId, setBookingBarberId] = useState<string | undefined>(undefined);
  const [bookingServiceId, setBookingServiceId] = useState<string | undefined>(undefined);
  const [bookingDateISO, setBookingDateISO] = useState<string | undefined>(undefined);
  const [bookingTime24, setBookingTime24] = useState<string | undefined>(undefined);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [failedGalleryImages, setFailedGalleryImages] = useState<Record<string, boolean>>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  });
  const [toastAlert, setToastAlert] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const barberoParam = params.get('barbero');
    if (barberoParam) {
      const matched = config.barbers.find(
        (b) => b.active && b.id.toLowerCase() === barberoParam.toLowerCase()
      );
      if (matched) {
        setBookingBarberId(matched.id);
        setBookingOpen(true);
      }
    }
  }, [config.barbers]);

  const unreadAlertsCount = useMemo(
    () => appointments.filter((a) => a.unreadByBarber && a.status !== 'Cancelada').length,
    [appointments]
  );

  const openBookingModal = (opts?: {
    barberId?: string;
    serviceId?: string;
    dateISO?: string;
    time24?: string;
  }) => {
    setBookingBarberId(opts?.barberId);
    setBookingServiceId(opts?.serviceId);
    setBookingDateISO(opts?.dateISO ?? getTodayISO());
    setBookingTime24(opts?.time24);
    setBookingOpen(true);
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setToastAlert('Alertas visuales y sonoras activadas dentro de la aplicación.');
      setNotificationsEnabled(true);
      setTimeout(() => setToastAlert(null), 3500);
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotificationsEnabled(true);
      playBarberAlertChime();
      setToastAlert('Notificaciones de citas activadas en este dispositivo.');
    } else {
      setToastAlert('Activa los permisos de notificación en tu navegador para alertas externas.');
    }
    setTimeout(() => setToastAlert(null), 3500);
  };

  const handleNewBooking = (record: AppointmentRecord) => {
    setAppointments((prev) => [record, ...prev]);
    playBarberAlertChime();

    const alertMsg = `Nueva cita para ${record.barberName}: ${record.customerName} (${record.timeLabel})`;
    setToastAlert(alertMsg);
    setTimeout(() => setToastAlert(null), 6000);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`${config.name} — Nueva Cita`, {
          body: `${record.customerName} solicitó ${record.serviceName} con ${record.barberName} el ${record.dateISO} a las ${record.timeLabel}.`,
          icon: '/pwa-192x192.png',
        });
      } catch {
        // Ignore Notification constructor errors
      }
    }
  };

  const handleUpdatePinHash = (nextHash: string) => {
    setPinHash(nextHash);
    try {
      localStorage.setItem(PIN_HASH_STORAGE_KEY, nextHash);
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_SHOP_CONFIG);
    try {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const primaryBarberWhatsApp = config.barbers.find((b) => b.active)?.whatsapp ?? '3045369661';
  const promoWhatsAppUrl = `https://wa.me/${toWhatsAppInternational(
    primaryBarberWhatsApp
  )}?text=${encodeURIComponent(
    `Hola ${config.name}, quisiera consultar por las promociones y disponibilidad especial de la semana.`
  )}`;

  const navItems: { id: AppTab; label: string; mobileLabel: string }[] = [
    { id: 'inicio', label: 'Inicio', mobileLabel: 'Inicio' },
    { id: 'servicios', label: 'Servicios', mobileLabel: 'Servicios' },
    { id: 'equipo', label: 'Nuestro Equipo', mobileLabel: 'Equipo' },
    { id: 'agenda', label: 'Agenda', mobileLabel: 'Agenda' },
    { id: 'admin', label: 'Admin', mobileLabel: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-[#131313] text-[#F7F4EA] flex flex-col">
      <OfflineIndicator />

      {toastAlert && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 right-4 z-50 max-w-sm rounded-lg border border-[#D4AF37] bg-[#24201B] px-4 py-3 text-xs font-medium text-[#F7F4EA] shadow-2xl flex items-center gap-2.5"
        >
          <Bell className="w-4 h-4 text-[#F2CA50] shrink-0" />
          <span>{toastAlert}</span>
        </div>
      )}

      {/* Top Bar Contract: Zone 1 (Animated Logo + Brand) — Zone 2 (Nav Links) — Zone 3 (Primary CTA) */}
      <header className="sticky top-0 z-30 border-b border-[#D4AF37]/15 bg-[#131313]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-3 text-left shrink-0 cursor-pointer"
          >
            <BrandLogo size="sm" />
            <span className="font-editorial text-lg sm:text-xl font-semibold tracking-tight text-[#F7F4EA] whitespace-nowrap">
              {config.name}
            </span>
          </button>

          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#D0C5AF]"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                    active
                      ? 'text-[#F2CA50] border-[#D4AF37]'
                      : 'border-transparent hover:text-[#F7F4EA]'
                  }`}
                >
                  {item.label}
                  {item.id === 'agenda' && unreadAlertsCount > 0 ? ` (${unreadAlertsCount})` : ''}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => openBookingModal()}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#131313] text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reservar ↗
          </button>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-8">
        {activeTab === 'inicio' && (
          <div>
            {/* Hero Section: Minimalist Vintage + 3D Title + Golden Cutting Scissors */}
            <section className="relative overflow-hidden border-b border-[#D4AF37]/15">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.12)_0%,_rgba(19,19,19,0)_62%)] pointer-events-none"
              />

              <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-20 text-center relative z-10 space-y-7">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C5A059]">
                  {config.subtitle}
                </p>

                <div className="relative inline-block py-4 px-2 sm:px-8 select-none">
                  <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-[#F2CA50] title-3d-gold animate-title-3d [text-wrap:balance]">
                    {config.name}
                  </h1>

                  <div
                    aria-hidden="true"
                    className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-[#F2CA50]/65 to-transparent pointer-events-none"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 pointer-events-none z-20 animate-scissors-sweep"
                  >
                    <svg
                      viewBox="0 0 80 48"
                      className="w-16 h-10 sm:w-20 sm:h-12 drop-shadow-[0_4px_12px_rgba(242,202,80,0.55)]"
                      fill="none"
                    >
                      <g className="animate-blade-top">
                        <path
                          d="M24 20L74 14L62 24L24 24Z"
                          fill="url(#goldBlade)"
                          stroke="#FFF3C4"
                          strokeWidth="0.9"
                        />
                        <circle
                          cx="14"
                          cy="14"
                          r="7.5"
                          stroke="#F2CA50"
                          strokeWidth="3"
                          fill="#131313"
                        />
                      </g>
                      <g className="animate-blade-bottom">
                        <path
                          d="M24 28L74 34L62 24L24 24Z"
                          fill="url(#goldBlade)"
                          stroke="#FFF3C4"
                          strokeWidth="0.9"
                        />
                        <circle
                          cx="14"
                          cy="34"
                          r="7.5"
                          stroke="#F2CA50"
                          strokeWidth="3"
                          fill="#131313"
                        />
                      </g>
                      <circle cx="28" cy="24" r="2.3" fill="#FFF7D6" stroke="#8A6D1C" strokeWidth="1" />
                      <defs>
                        <linearGradient id="goldBlade" x1="24" y1="14" x2="74" y2="34" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FFF0B8" />
                          <stop offset="0.5" stopColor="#D4AF37" />
                          <stop offset="1" stopColor="#9A781A" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <p className="font-editorial italic text-xl sm:text-2xl text-[#F7F4EA]/90">
                  Tu estilo. Tu momento.
                </p>

                <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#D0C5AF] leading-relaxed">
                  {config.welcomeText}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => openBookingModal()}
                    className="group min-h-[54px] pl-3 pr-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F2CA50] active:scale-[0.99] text-[#131313] font-bold text-sm sm:text-base inline-flex items-center gap-3 shadow-[0_10px_28px_rgba(212,175,55,0.28)] transition-all cursor-pointer"
                  >
                    <span className="relative w-9 h-9 rounded-full bg-[#131313] text-[#F2CA50] flex items-center justify-center shrink-0">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full border-2 border-dashed border-[#F2CA50]/80 animate-whatsapp-spin"
                      />
                      <MessageCircle className="w-4 h-4 relative z-10" />
                    </span>
                    <span>Agenda tu cita ahora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrOpen(true)}
                    className="min-h-[48px] px-5 py-2.5 rounded-lg border border-[#D4AF37]/30 bg-[#1C1B1B] hover:border-[#D4AF37] text-[#F7F4EA] text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#D4AF37]" />
                    <span>Código QR / Compartir</span>
                  </button>

                  <PWAInstallButton variant="full" />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#D0C5AF]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{config.address}</span>
                  </span>
                  <span aria-hidden="true" className="hidden sm:inline text-[#4D4635]">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{config.hours.weekdayLabel}</span>
                  </span>
                  <span aria-hidden="true" className="hidden sm:inline text-[#4D4635]">·</span>
                  <span>{config.hours.sundayLabel}</span>
                </div>
              </div>
            </section>

            {/* Identity Strip from index_afd16a02.html */}
            <div className="border-b border-[#D4AF37]/12 bg-[#161514]">
              <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="font-bold tracking-[0.08em] text-[#C5A059] uppercase">
                  01. Identidad
                </span>
                <p className="font-editorial italic text-base text-[#F7F4EA] text-center">
                  Tradición en el oficio. Actitud en el resultado.
                </p>
                <span className="font-bold tracking-[0.08em] text-[#8C857B]">EST. 2025</span>
              </div>
            </div>

            {/* Supporting Craft Images */}
            <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16 border-b border-[#D4AF37]/12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div className="space-y-1.5">
                  <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#F7F4EA]">
                    Oficio Tradicional en Cada Detalle
                  </h2>
                  <p className="text-sm text-[#8C857B]">
                    Atención dedicada para caballeros, adultos mayores, jóvenes y niños.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('equipo')}
                  className="text-xs font-semibold text-[#F2CA50] hover:underline underline-offset-4 self-start sm:self-auto cursor-pointer"
                >
                  Conoce al equipo →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.gallery.map((item, idx) => (
                  <article
                    key={item.id}
                    className="group rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-[#242220] overflow-hidden">
                      {!failedGalleryImages[item.id] ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedGalleryImages((prev) => ({ ...prev, [item.id]: true }))
                          }
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#242220] p-4">
                          <Scissors className="w-8 h-8 text-[#D4AF37]/50 mb-2" />
                          <span className="font-editorial text-base text-[#F7F4EA]">{item.title}</span>
                        </div>
                      )}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none overflow-hidden"
                      >
                        <div
                          className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#F2CA50]/15 to-transparent animate-craft-sheen"
                          style={{ animationDelay: `${idx * 1.8}s` }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131313]/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-5 space-y-1.5">
                      <h3 className="font-editorial text-xl font-semibold text-[#F7F4EA]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#D0C5AF] leading-relaxed">{item.caption}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Promociones y Eventos (from index_afd16a02.html) */}
            <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12">
              <div className="rounded-xl border border-[#D4AF37]/25 bg-[#1C1B1B] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#C5A059]">
                    Novedades · Promociones y Eventos
                  </p>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#F7F4EA]">
                    Pregunta por nuestras promociones
                  </h2>
                  <p className="text-sm text-[#D0C5AF] max-w-xl">
                    Consulta en WhatsApp las novedades, paquetes y disponibilidad especial de la semana.
                  </p>
                </div>

                <a
                  href={promoWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-5 py-2.5 rounded-lg border border-[#D4AF37] bg-[#3A2B20] hover:bg-[#4D392A] text-[#F2CA50] text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Consultar promociones</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </section>

            {/* Services Preview + Social Media Union */}
            <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-6 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-editorial text-2xl font-semibold text-[#F7F4EA]">
                      Servicios y Tarifas
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('servicios')}
                      className="text-xs font-semibold text-[#F2CA50] hover:underline underline-offset-4 cursor-pointer"
                    >
                      Ver detalle completo →
                    </button>
                  </div>

                  <div className="divide-y divide-[#D4AF37]/12">
                    {config.services.map((svc) => (
                      <div key={svc.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-editorial text-lg text-[#F7F4EA]">{svc.name}</p>
                          <p className="text-xs text-[#8C857B] truncate">{svc.description}</p>
                        </div>
                        <span className="text-base font-bold text-[#D4AF37] tabular-nums whitespace-nowrap shrink-0">
                          {formatCop(svc.priceCop)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-[#8C857B] leading-relaxed">
                    {config.extraServicesNote}
                  </p>
                </div>

                <div className="lg:col-span-5 rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-6 space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="font-editorial text-2xl font-semibold text-[#F7F4EA]">
                      Nos Vemos en la Barbería
                    </h2>
                    <p className="text-xs text-[#D0C5AF] leading-relaxed">
                      {config.address} · Conéctate desde cualquiera de nuestras redes para agendar al instante.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                    <a
                      href={`https://wa.me/${toWhatsAppInternational(primaryBarberWhatsApp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-4 py-2.5 rounded-lg border border-[#D4AF37]/25 bg-[#181716] hover:border-[#D4AF37] text-xs font-semibold text-[#F7F4EA] flex items-center justify-between transition-colors"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                        <span>WhatsApp Directo</span>
                      </span>
                      <span className="text-[#8C857B]">Abrir ↗</span>
                    </a>

                    <a
                      href={config.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-4 py-2.5 rounded-lg border border-[#D4AF37]/25 bg-[#181716] hover:border-[#D4AF37] text-xs font-semibold text-[#F7F4EA] flex items-center justify-between transition-colors"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Instagram className="w-4 h-4 text-[#D4AF37]" />
                        <span>Instagram @{config.instagramHandle}</span>
                      </span>
                      <span className="text-[#8C857B]">Visitar ↗</span>
                    </a>

                    <a
                      href={config.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-4 py-2.5 rounded-lg border border-[#D4AF37]/25 bg-[#181716] hover:border-[#D4AF37] text-xs font-semibold text-[#F7F4EA] flex items-center justify-between transition-colors"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Share2 className="w-4 h-4 text-[#D4AF37]" />
                        <span>Facebook {config.name}</span>
                      </span>
                      <span className="text-[#8C857B]">Visitar ↗</span>
                    </a>

                    <a
                      href={`mailto:${config.email}?subject=${encodeURIComponent(`Consulta de servicios - ${config.name}`)}`}
                      className="min-h-[44px] px-4 py-2.5 rounded-lg border border-[#D4AF37]/25 bg-[#181716] hover:border-[#D4AF37] text-xs font-semibold text-[#F7F4EA] flex items-center justify-between transition-colors"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#D4AF37]" />
                        <span>{config.email}</span>
                      </span>
                      <span className="text-[#8C857B]">Escribir ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'servicios' && (
          <section aria-labelledby="services-heading" className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#C5A059]">
                Lo Que Hacemos · {config.name}
              </p>
              <h2 id="services-heading" className="font-editorial text-3xl sm:text-4xl font-semibold text-[#F7F4EA]">
                Servicios y Tarifas
              </h2>
              <p className="text-sm text-[#D0C5AF] leading-relaxed">
                Elige tu servicio y reserva en pocos pasos en pesos colombianos (COP).
              </p>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] divide-y divide-[#D4AF37]/15 overflow-hidden">
              {config.services.map((service) => (
                <div
                  key={service.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="font-editorial text-2xl font-semibold text-[#F7F4EA]">
                        {service.name}
                      </h3>
                      <span className="text-xs text-[#8C857B] tabular-nums">
                        {service.durationMinutes} min aprox.
                      </span>
                    </div>
                    <p className="text-sm text-[#D0C5AF] leading-relaxed">{service.description}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                    <span className="text-2xl font-bold text-[#F2CA50] tabular-nums">
                      {formatCop(service.priceCop)}
                    </span>
                    <button
                      type="button"
                      onClick={() => openBookingModal({ serviceId: service.id })}
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F2CA50] text-[#131313] text-xs font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Agendar este servicio</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#1C1B1B] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#F7F4EA]">{config.extraServicesNote}</p>
                <p className="text-xs text-[#8C857B]">
                  {config.hours.weekdayLabel} · {config.hours.sundayLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('equipo')}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[#D4AF37]/35 bg-[#181716] hover:border-[#D4AF37] text-xs font-semibold text-[#F2CA50] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Conoce al equipo
              </button>
            </div>
          </section>
        )}

        {activeTab === 'equipo' && (
          <TeamTab
            barbers={config.barbers}
            onBookWithBarber={(barberId) => openBookingModal({ barberId })}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaTab
            config={config}
            appointments={appointments}
            onBookSlot={(barberId, dateISO, time24) =>
              openBookingModal({ barberId, dateISO, time24 })
            }
            onMarkAllRead={() =>
              setAppointments((prev) => prev.map((a) => ({ ...a, unreadByBarber: false })))
            }
            onEnableNotifications={handleEnableNotifications}
            notificationsEnabled={notificationsEnabled}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTab
            config={config}
            appointments={appointments}
            pinHash={pinHash}
            isDefaultPin={pinHash === defaultPinHash}
            onUpdateConfig={setConfig}
            onUpdatePinHash={handleUpdatePinHash}
            onAddAppointment={(rec) => setAppointments((prev) => [rec, ...prev])}
            onUpdateAppointment={(updated) =>
              setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
            }
            onDeleteAppointment={(id) =>
              setAppointments((prev) => prev.filter((a) => a.id !== id))
            }
            onClearCancelled={() =>
              setAppointments((prev) => prev.filter((a) => a.status !== 'Cancelada'))
            }
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* Floating Rotating WhatsApp CTA */}
      <button
        type="button"
        onClick={() => openBookingModal()}
        aria-label="Agenda tu cita por WhatsApp"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 min-h-[48px] pl-2.5 pr-4 py-2 rounded-xl border border-[#D4AF37] bg-[#1C1B1B]/95 backdrop-blur-md text-[#F2CA50] text-xs font-bold inline-flex items-center gap-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.65)] hover:bg-[#3A2B20] transition-colors cursor-pointer"
      >
        <span className="relative w-7 h-7 rounded-full bg-[#D4AF37] text-[#131313] flex items-center justify-center shrink-0">
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-full border border-dashed border-[#F2CA50] animate-whatsapp-spin"
          />
          <MessageCircle className="w-3.5 h-3.5 relative z-10" />
        </span>
        <span>Agenda tu cita</span>
      </button>

      {/* Footer with Legal & Copyright */}
      <footer className="border-t border-[#D4AF37]/15 bg-[#131313] py-10 px-4 text-center pb-24 md:pb-10">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#D0C5AF]">
            <span className="font-editorial text-base font-semibold text-[#F7F4EA]">
              © 2025–2026 {config.name.toUpperCase()}
            </span>
            <span aria-hidden="true" className="text-[#4D4635]">·</span>
            <span>{config.address}</span>
            <span aria-hidden="true" className="text-[#4D4635]">·</span>
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="inline-flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F2CA50] underline underline-offset-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacidad (Ley 1581 de 2012)</span>
            </button>
          </div>

          <p className="text-xs text-[#8C857B] leading-relaxed max-w-3xl mx-auto">
            Desarrollo de software · <strong className="text-[#D0C5AF]">Luis Rafael Martínez Angulo</strong>, Tecnólogo en Desarrollo de Software. Todos los derechos reservados (Derechos de Autor y Copyright — Ley 23 de 1982, Decisión Andina 351 y normatividad colombiana vigente de protección de datos).
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#D4AF37]/20 bg-[#131313]/95 backdrop-blur-md pb-safe"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            const Icon =
              item.id === 'inicio'
                ? Sparkles
                : item.id === 'servicios'
                  ? Scissors
                  : item.id === 'equipo'
                    ? Users
                    : item.id === 'agenda'
                      ? Calendar
                      : SlidersHorizontal;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors cursor-pointer relative ${
                  active ? 'text-[#F2CA50]' : 'text-[#8C857B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.mobileLabel}</span>
                {item.id === 'agenda' && unreadAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-3 text-[9px] font-bold text-[#131313] bg-[#F2CA50] rounded-full px-1 leading-tight">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        config={config}
        appointments={appointments}
        initialBarberId={bookingBarberId}
        initialServiceId={bookingServiceId}
        initialDateISO={bookingDateISO}
        initialTime24={bookingTime24}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onSubmitBooking={handleNewBooking}
      />

      <ShareQRModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        shopName={config.name}
        barbers={config.barbers}
      />

      <PrivacyModal
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        shopName={config.name}
        contactEmail={config.email}
      />
    </div>
  );
}

export default App;
