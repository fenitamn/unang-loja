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

/**
 * Nomor tujuan pembayaran. Isi lewat environment publik sebelum menerima
 * pembayaran nyata; tanpa konfigurasi, pelanggan diarahkan ke admin via WhatsApp
 * agar tidak pernah melihat nomor rekening contoh sebagai tujuan transfer.
 */
const PAYMENT_ACCOUNT_FALLBACK = "Konfirmasi nomor via WhatsApp admin";
const paymentAccount = (value: string | undefined) =>
  value?.trim() || PAYMENT_ACCOUNT_FALLBACK;

export const PAYMENT_METHODS: Record<
  PaymentMethodKey,
  { account: string; emoji: string }
> = {
  bca: { account: paymentAccount(process.env.NEXT_PUBLIC_BCA_ACCOUNT), emoji: "🏦" },
  bsi: { account: paymentAccount(process.env.NEXT_PUBLIC_BSI_ACCOUNT), emoji: "🏦" },
  gopay: { account: paymentAccount(process.env.NEXT_PUBLIC_GOPAY_ACCOUNT), emoji: "📱" },
  ovo: { account: paymentAccount(process.env.NEXT_PUBLIC_OVO_ACCOUNT), emoji: "📱" },
  dana: { account: paymentAccount(process.env.NEXT_PUBLIC_DANA_ACCOUNT), emoji: "📱" },
};

export const MEETING_POINTS = [
  "Dermaga Tomok",
  "Tuk Tuk",
  "Ambarita",
  "Simanindo",
  "Pangururan",
] as const;

export type GuideCategory =
  | "history"
  | "photo"
  | "culinary"
  | "nature"
  | "architecture"
  | "sigale"
  | "culture"
  | "lake";

export type GuideArea = "tomok" | "tuktuk" | "pusuk" | "holbung";

export interface Guide {
  id: string;
  name: string;
  languages: string[];
  category: GuideCategory;
  area: GuideArea;
  years: number;
  rating: number;
  reviews: number;
  /** Tarif resmi per trip/paket (Rp) — sumber teks label ada di messages. */
  price: number;
  license: string;
  /** Varian ilustrasi Scene untuk kartu profil. */
  scene: "hero" | "culture" | "delivery" | "locker" | "sunset" | "guide";
  avatarClass: string;
}

export const GUIDES: Guide[] = [
  {
    id: "g1",
    name: "Bang Togar Sinaga",
    languages: ["Batak Toba", "Indonesia", "English"],
    category: "history",
    area: "tomok",
    years: 12,
    rating: 4.95,
    reviews: 142,
    price: 300_000,
    license: "HPI-SM-042",
    scene: "culture",
    avatarClass: "bg-navy-800",
  },
  {
    id: "g2",
    name: "Ito Dame Simarmata",
    languages: ["Batak Toba", "Indonesia", "English", "Dutch"],
    category: "culinary",
    area: "pusuk",
    years: 8,
    rating: 4.9,
    reviews: 98,
    price: 300_000,
    license: "HPI-SM-089",
    scene: "sunset",
    avatarClass: "bg-brand-600",
  },
  {
    id: "g3",
    name: "Lae Ucok Nainggolan",
    languages: ["Indonesia", "Batak Toba", "English"],
    category: "lake",
    area: "pusuk",
    years: 7,
    rating: 4.88,
    reviews: 116,
    price: 350_000,
    license: "HPI-SM-115",
    scene: "sunset",
    avatarClass: "bg-gold-600",
  },
  {
    id: "g4",
    name: "Amang Johanes Situmorang",
    languages: ["Batak Toba", "Indonesia", "Deutsch", "English"],
    category: "culture",
    area: "tomok",
    years: 18,
    rating: 5.0,
    reviews: 210,
    price: 350_000,
    license: "HPI-SM-018",
    scene: "culture",
    avatarClass: "bg-navy-700",
  },
  {
    id: "g5",
    name: "Bang Ricky Purba",
    languages: ["Indonesia", "Batak Toba", "English"],
    category: "culinary",
    area: "tuktuk",
    years: 5,
    rating: 4.85,
    reviews: 74,
    price: 280_000,
    license: "HPI-SM-134",
    scene: "guide",
    avatarClass: "bg-lake-700",
  },
  {
    id: "g6",
    name: "Ito Sondang Silalahi",
    languages: ["Indonesia", "Batak Toba", "English"],
    category: "sigale",
    area: "tomok",
    years: 9,
    rating: 4.92,
    reviews: 128,
    price: 300_000,
    license: "HPI-SM-092",
    scene: "hero",
    avatarClass: "bg-brand-700",
  },
  {
    id: "g7",
    name: "Bang Marlon Simbolon",
    languages: ["Indonesia", "Batak Toba", "English"],
    category: "nature",
    area: "holbung",
    years: 6,
    rating: 4.83,
    reviews: 61,
    price: 320_000,
    license: "HPI-SM-121",
    scene: "guide",
    avatarClass: "bg-navy-600",
  },
  {
    id: "g8",
    name: "Ito Rosmaida Hutapea",
    languages: ["Indonesia", "Batak Toba", "English", "Mandarin"],
    category: "culinary",
    area: "tuktuk",
    years: 4,
    rating: 4.79,
    reviews: 43,
    price: 260_000,
    license: "HPI-SM-147",
    scene: "locker",
    avatarClass: "bg-lake-700",
  },
  {
    id: "g9",
    name: "Amang Parsaoran Nainggolan",
    languages: ["Batak Toba", "Indonesia", "English"],
    category: "architecture",
    area: "holbung",
    years: 15,
    rating: 4.97,
    reviews: 187,
    price: 340_000,
    license: "HPI-SM-021",
    scene: "culture",
    avatarClass: "bg-navy-800",
  },
];

export function getGuide(id: string): Guide | undefined {
  return GUIDES.find((g) => g.id === id);
}

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
  owner: string;
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
    owner: "Andi Pratama",
    guide: "Ito Dame Simarmata",
    luggage: true,
  },
  {
    orderNo: "UL-20261111-0002",
    resi: "RSI-0043",
    sealNo: "SLG-0188",
    serviceKey: "penitipan",
    date: "2026-11-11",
    stateIndex: 4,
    owner: "Sarah Hutabarat",
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
    owner: "Claire Thompson",
    guide: "Bang Togar Sinaga",
    luggage: false,
  },
];
