import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Koneksi Supabase sisi SERVER saja (service role = akses penuh).
 * Jangan pernah diimpor dari komponen "use client".
 */

const URL = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isDbConfigured = () => Boolean(URL && KEY);

let cached: SupabaseClient | null = null;

/** Klien Supabase (lazy — tidak melempar error saat build tanpa env). */
export function getDb(): SupabaseClient {
  if (!isDbConfigured()) throw new Error("Supabase env belum dikonfigurasi.");
  if (!cached) {
    cached = createClient(URL, KEY, { auth: { persistSession: false } });
  }
  return cached;
}

/** Baris pesanan di database. */
export type OrderRow = {
  id: string;
  resi: string;
  service_key: string;
  add_ons: string[];
  date: string;
  meeting_point: string;
  zone: string | null;
  suitcases: number;
  participants: number;
  notes: string | null;
  name: string;
  phone: string;
  email: string | null;
  payment_method: string | null;
  total: number;
  status: string;
  guide_id: string | null;
  created_at: string;
  updated_at: string;
};

export const ORDER_STATUSES = [
  "BARU",
  "DIKONFIRMASI",
  "DITUGASKAN",
  "DIJEMPUT",
  "SELESAI",
  "BATAL",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Buat nomor resi: UL-20261113-1234 */
export function generateResi(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `UL-${stamp}-${seq}`;
}
