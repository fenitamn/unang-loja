// Data dummy untuk Fase 1. Pada Fase 2, tarif & pemandu dipindahkan ke Supabase.

export type ServiceKey =
  | "pemanduan"
  | "penitipan"
  | "antarDekat"
  | "antarLintas"
  | "fleksibel"
  | "mystery";

export type MysteryTheme = "situs" | "senja";

export type PaymentMethodKey = "bca" | "bsi" | "gopay" | "ovo" | "dana";

export type ZoneKey = "dekat" | "lintas";

export interface Service {
  key: ServiceKey;
  price: number;
  unit: "perBooking" | "perSuitcaseDay" | "perTrip";
  emoji: string;
}

export const SERVICES: Service[] = [
  { key: "pemanduan", price: 300_000, unit: "perBooking", emoji: "🧭" },
  { key: "penitipan", price: 25_000, unit: "perSuitcaseDay", emoji: "🧳" },
  { key: "antarDekat", price: 75_000, unit: "perTrip", emoji: "🛺" },
  { key: "antarLintas", price: 150_000, unit: "perTrip", emoji: "🚗" },
  { key: "fleksibel", price: 350_000, unit: "perBooking", emoji: "🌊" },
  { key: "mystery", price: 350_000, unit: "perBooking", emoji: "🎁" },
];

export function getService(key: ServiceKey): Service {
  return SERVICES.find((s) => s.key === key) as Service;
}

// Upsell / cross-sell per layanan (dipakai langkah 1 pemesanan).
export const UPSELL: Partial<Record<ServiceKey, ServiceKey>> = {
  pemanduan: "fleksibel",
  antarLintas: "fleksibel",
};

export const CROSS_SELL: Partial<Record<ServiceKey, ServiceKey[]>> = {
  pemanduan: ["penitipan", "antarDekat"],
  mystery: ["penitipan", "antarDekat"],
  penitipan: ["antarDekat"],
  antarDekat: ["penitipan"],
  antarLintas: ["pemanduan"],
  fleksibel: ["penitipan"],
};

export const PAYMENT_METHODS: Record<
  PaymentMethodKey,
  { account: string; emoji: string }
> = {
  bca: { account: "1234567890", emoji: "🏦" },
  bsi: { account: "7210987654", emoji: "🏦" },
  gopay: { account: "0812-3456-7890", emoji: "📱" },
  ovo: { account: "0812-3456-7890", emoji: "📱" },
  dana: { account: "0812-3456-7890", emoji: "📱" },
};

export const MEETING_POINTS = [
  "Dermaga Tomok",
  "Tuk Tuk",
  "Ambarita",
  "Simanindo",
  "Pangururan",
] as const;

export type GuideSpecialty = "budaya" | "sejarah" | "kuliner" | "alam" | "foto";

export interface Guide {
  id: string;
  name: string;
  languages: string[];
  specialty: GuideSpecialty;
  years: number;
  rating: number;
}

export const GUIDES: Guide[] = [
  { id: "g1", name: "Hotman Siregar", languages: ["Indonesia", "Inggris", "Batak"], specialty: "sejarah", years: 7, rating: 4.9 },
  { id: "g2", name: "Ria Butarbutar", languages: ["Indonesia", "Inggris"], specialty: "budaya", years: 5, rating: 4.8 },
  { id: "g3", name: "Jhonatan Simanjuntak", languages: ["Indonesia", "Inggris"], specialty: "alam", years: 4, rating: 4.7 },
  { id: "g4", name: "Sari Simbolon", languages: ["Indonesia", "Inggris", "Mandarin"], specialty: "kuliner", years: 6, rating: 4.9 },
  { id: "g5", name: "Martua Gurning", languages: ["Indonesia", "Inggris"], specialty: "foto", years: 3, rating: 4.6 },
  { id: "g6", name: "Lasma Panjaitan", languages: ["Indonesia", "Inggris", "Batak"], specialty: "budaya", years: 8, rating: 5.0 },
];

/**
 * Ketersediaan pemandu deterministik (dummy): hari yang sama selalu
 * menghasilkan status yang sama untuk pemandu yang sama.
 */
export type Availability = "available" | "limited" | "full";

export function guideAvailability(guideId: string, date: Date): Availability {
  const seed =
    guideId.charCodeAt(0) +
    guideId.length * 7 +
    date.getFullYear() * 31 +
    date.getMonth() * 13 +
    date.getDate() * 3;
  const r = seed % 10;
  if (r < 5) return "available";
  if (r < 8) return "limited";
  return "full";
}

export const STORAGE_DAILY_QUOTA = 20;

export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Pesanan dummy untuk halaman Status.
export interface DemoOrder {
  orderNo: string;
  resi: string;
  sealNo: string;
  serviceKey: ServiceKey;
  zone?: ZoneKey;
  date: string;
  stateIndex: number; // 0..4 pada STATUS_STATES
  guide: string;
  luggage: boolean;
}

export const STATUS_STATES = [
  "diterima",
  "lunas",
  "terjadwal",
  "berjalan",
  "selesai",
] as const;

export const DEMO_ORDERS: DemoOrder[] = [
  {
    orderNo: "UL-20261112-0001",
    resi: "RSI-0042",
    sealNo: "SLG-0187",
    serviceKey: "fleksibel",
    date: "2026-11-12",
    stateIndex: 3,
    guide: "Ria Butarbutar",
    luggage: true,
  },
  {
    orderNo: "UL-20261111-0002",
    resi: "RSI-0043",
    sealNo: "SLG-0188",
    serviceKey: "penitipan",
    date: "2026-11-11",
    stateIndex: 4,
    guide: "-",
    luggage: true,
  },
  {
    orderNo: "UL-20261113-0003",
    resi: "RSI-0044",
    sealNo: "SLG-0189",
    serviceKey: "mystery",
    zone: "dekat",
    date: "2026-11-13",
    stateIndex: 1,
    guide: "Hotman Siregar",
    luggage: false,
  },
];
