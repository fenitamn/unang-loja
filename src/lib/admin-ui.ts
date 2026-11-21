import { formatIDR } from "@/lib/data";
import type { OrderRecord } from "@/lib/store";

export const STATUS_LABEL: Record<string, string> = {
  BARU: "Baru",
  DIKONFIRMASI: "Dikonfirmasi",
  DITUGASKAN: "Ditugaskan",
  DIJEMPUT: "Dijemput / Proses",
  SELESAI: "Selesai",
  BATAL: "Batal",
};

export const STATUS_STYLE: Record<string, string> = {
  BARU: "border-gold-300 bg-gold-50 text-gold-800",
  DIKONFIRMASI: "border-navy-200 bg-navy-50 text-navy-800",
  DITUGASKAN: "border-lake-300 bg-lake-50 text-lake-800",
  DIJEMPUT: "border-brand-200 bg-brand-50 text-brand-700",
  SELESAI: "border-green-300 bg-green-50 text-green-800",
  BATAL: "border-red-200 bg-red-50 text-red-700",
};

export const PAYMENT_LABEL: Record<string, string> = {
  UNPAID: "Belum dibayar",
  PENDING: "Menunggu verifikasi",
  PAID: "Lunas / Terverifikasi",
  REJECTED: "Ditolak",
};

export const PAYMENT_STYLE: Record<string, string> = {
  UNPAID: "border-line bg-surface-100 text-ink-soft",
  PENDING: "border-gold-300 bg-gold-50 text-gold-800",
  PAID: "border-green-300 bg-green-50 text-green-800",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bca: "Transfer BCA",
  bsi: "Transfer BSI",
  gopay: "GoPay",
  ovo: "OVO",
  dana: "DANA",
  qris: "QRIS",
  cash: "Tunai di loket",
};

export const SERVICE_LABEL: Record<string, string> = {
  pemanduan: "Pemanduan Wisata",
  penitipan: "Penitipan Koper",
  antarDekat: "Antar Bagasi — Zona Dekat",
  antarLintas: "Antar Bagasi — Lintas",
  fleksibel: "Jelajah Fleksibel",
  mystery: "Mystery Tour",
};

export const GUIDE_CATEGORY_LABEL: Record<string, string> = {
  history: "Sejarah & Budaya",
  photo: "Fotografi",
  culinary: "Kuliner",
  nature: "Alam & Treking",
  architecture: "Arsitektur",
};

export const statusProgress: Record<string, number> = {
  BARU: 0,
  DIKONFIRMASI: 1,
  DITUGASKAN: 2,
  DIJEMPUT: 3,
  SELESAI: 4,
  BATAL: 0,
};

export const ACTIVE_STATUSES = ["BARU", "DIKONFIRMASI", "DITUGASKAN", "DIJEMPUT"];

export const serviceLabel = (key: string) => SERVICE_LABEL[key] ?? key;
export const paymentLabel = (status: string) => PAYMENT_LABEL[status] ?? status;
export const paymentMethodLabel = (method?: string | null) =>
  method ? PAYMENT_METHOD_LABEL[method] ?? method : "—";

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const rupiah = (value: number) => formatIDR(value || 0);

export function orderDetail(order: OrderRecord): string {
  if (order.service_key === "pemanduan" && order.participants > 0) {
    return `${order.participants} peserta`;
  }
  if (order.suitcases > 0) {
    return `${order.suitcases} koper${order.participants > 1 ? ` · ${order.participants} peserta` : ""}`;
  }
  return `${order.participants} peserta`;
}
