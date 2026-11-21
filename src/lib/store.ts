/**
 * Lapisan data tunggal untuk Customer & Admin.
 *
 * Mode penyimpanan:
 * - "supabase" bila SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY tersedia (produksi).
 * - "local"    bila tidak, hanya untuk pengembangan/uji (file .data/store.json).
 *
 * Tidak pernah diimpor dari komponen client.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { GUIDES, SERVICES, type ServiceKey } from "@/lib/data";
import { getDb, isDbConfigured } from "@/lib/supabase";

export type Role = "admin" | "customer";
export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "REJECTED";
export type OrderStatus =
  | "BARU"
  | "DIKONFIRMASI"
  | "DITUGASKAN"
  | "DIJEMPUT"
  | "SELESAI"
  | "BATAL";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: Role;
  created_at: string;
}

export type PublicUser = Omit<UserRecord, "password_hash">;

export interface OrderRecord {
  id: string;
  resi: string;
  customer_id: string | null;
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
  payment_status: PaymentStatus;
  payment_proof: string | null;
  payment_ref: string | null;
  payment_note: string | null;
  admin_note: string | null;
  seal_code: string | null;
  total: number;
  status: OrderStatus;
  guide_id: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuideRecord {
  id: string;
  slug: string;
  name: string;
  phone: string;
  specialty: string;
  category: string;
  area: string;
  languages: string[];
  rating: number;
  reviews: number;
  years: number;
  price: number;
  license: string;
  schedule: string;
  active: boolean;
  scene: string;
  avatar_class: string;
  created_at: string;
}

export interface ReviewRecord {
  id: string;
  user_id: string | null;
  order_resi: string | null;
  name: string;
  rating: number;
  comment: string;
  published: boolean;
  created_at: string;
}

export interface LockerRecord {
  id: string;
  name: string;
  location: string;
  officer: string;
  capacity: number;
  keys: number;
  active: boolean;
  created_at: string;
}

export interface ServiceRecord {
  key: ServiceKey;
  active: boolean;
}

/* ------------------------------------------------------------------ */
/* Mode & utilitas                                                      */
/* ------------------------------------------------------------------ */

export const storageMode = (): "supabase" | "local" =>
  isDbConfigured() ? "supabase" : "local";

/** Mode file hanya boleh dipakai di dev/uji, bukan produksi. */
export const localStoreAllowed = () =>
  process.env.NODE_ENV !== "production" || process.env.ALLOW_LOCAL_DB === "1";

/** Apakah penyimpanan dapat dipakai (Supabase atau file lokal dev). */
export const storeAvailable = () =>
  isDbConfigured() || localStoreAllowed();

const DB_FILE = path.join(process.cwd(), ".data", "store.json");

type LocalDb = {
  users: UserRecord[];
  orders: OrderRecord[];
  guides: GuideRecord[];
  reviews: ReviewRecord[];
  lockers: LockerRecord[];
  services: ServiceRecord[];
};

function seedDb(): LocalDb {
  const now = new Date().toISOString();
  return {
    users: [],
    orders: [],
    reviews: [],
    guides: GUIDES.map((g) => ({
      id: g.id,
      slug: g.id,
      name: g.name,
      phone: "",
      specialty: g.category,
      category: g.category,
      area: g.area,
      languages: g.languages,
      rating: g.rating,
      reviews: g.reviews,
      years: g.years,
      price: g.price,
      license: g.license,
      schedule: "08:00 - 16:00 WIB",
      active: true,
      scene: g.scene,
      avatar_class: g.avatarClass,
      created_at: now,
    })),
    lockers: [
      { id: "lk-tomok", name: "Loker Hub Tomok", location: "Dermaga Tomok", officer: "Petugas Tomok", capacity: 32, keys: 32, active: true, created_at: now },
      { id: "lk-ambarita", name: "Loker Hub Ambarita", location: "Dermaga Ambarita", officer: "Petugas Ambarita", capacity: 24, keys: 24, active: true, created_at: now },
      { id: "lk-balige", name: "Loker Hub Balige", location: "Pelabuhan Balige", officer: "Petugas Balige", capacity: 20, keys: 20, active: true, created_at: now },
    ],
    services: SERVICES.map((s) => ({ key: s.key, active: true })),
  };
}

let writeChain: Promise<unknown> = Promise.resolve();

/**
 * Baca file setiap kali. Route handler dan halaman dapat berjalan di modul
 * terpisah (Next.js), jadi cache modul akan menyebabkan data basi.
 */
async function readLocal(): Promise<LocalDb> {
  if (!localStoreAllowed()) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDb>;
    return { ...seedDb(), ...parsed };
  } catch {
    const db = seedDb();
    await writeLocal(db);
    return db;
  }
}

async function writeLocal(db: LocalDb) {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

function mutateLocal<T>(fn: (db: LocalDb) => T | Promise<T>): Promise<T> {
  const next = writeChain.then(async () => {
    const db = await readLocal();
    const result = await fn(db);
    await writeLocal(db);
    return result as T;
  });
  writeChain = next.catch(() => undefined);
  return next as Promise<T>;
}

const nowIso = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
const parseLanguages = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map(String)
    : String(value ?? "")
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  if (storageMode() === "local") {
    const db = await readLocal();
    return db.users.find((u) => u.email === normalized) ?? null;
  }
  const { data } = await getDb()
    .from("app_users")
    .select("*")
    .eq("email", normalized)
    .maybeSingle<UserRecord>();
  return data ?? null;
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  if (storageMode() === "local") {
    const db = await readLocal();
    const found = db.users.find((u) => u.id === id);
    if (!found) return null;
    const { password_hash: _omit, ...rest } = found;
    return rest;
  }
  const { data } = await getDb()
    .from("app_users")
    .select("id,name,email,phone,role,created_at")
    .eq("id", id)
    .maybeSingle<PublicUser>();
  return data ?? null;
}

export async function countAdmins(): Promise<number> {
  if (storageMode() === "local") {
    const db = await readLocal();
    return db.users.filter((u) => u.role === "admin").length;
  }
  const { count } = await getDb()
    .from("app_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return count ?? 0;
}

export async function createUser(input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
}): Promise<PublicUser> {
  const row = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    password_hash: input.passwordHash,
    role: input.role,
    created_at: nowIso(),
  };
  if (storageMode() === "local") {
    return mutateLocal((db) => {
      if (db.users.some((u) => u.email === row.email)) {
        throw new Error("EMAIL_TAKEN");
      }
      const user: UserRecord = { id: uid(), ...row };
      db.users.push(user);
      const { password_hash: _omit, ...rest } = user;
      return rest;
    });
  }
  const { data, error } = await getDb()
    .from("app_users")
    .insert(row)
    .select("id,name,email,phone,role,created_at")
    .single<PublicUser>();
  if (error) {
    if (error.code === "23505") throw new Error("EMAIL_TAKEN");
    throw error;
  }
  return data;
}

export async function updateUser(
  id: string,
  patch: { name?: string; phone?: string; password_hash?: string },
): Promise<PublicUser | null> {
  if (storageMode() === "local") {
    return mutateLocal((db) => {
      const user = db.users.find((u) => u.id === id);
      if (!user) return null;
      if (patch.name !== undefined) user.name = patch.name.trim();
      if (patch.phone !== undefined) user.phone = patch.phone.trim();
      if (patch.password_hash !== undefined) user.password_hash = patch.password_hash;
      const { password_hash: _omit, ...rest } = user;
      return rest;
    });
  }
  const { data } = await getDb()
    .from("app_users")
    .update(patch)
    .eq("id", id)
    .select("id,name,email,phone,role,created_at")
    .maybeSingle<PublicUser>();
  return data ?? null;
}

export async function listUsers(): Promise<PublicUser[]> {
  if (storageMode() === "local") {
    const db = await readLocal();
    return db.users
      .map(({ password_hash: _omit, ...rest }) => rest)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const { data } = await getDb()
    .from("app_users")
    .select("id,name,email,phone,role,created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

/* ------------------------------------------------------------------ */
/* Orders                                                               */
/* ------------------------------------------------------------------ */

export async function createOrder(
  input: Omit<OrderRecord, "id" | "created_at" | "updated_at" | "verified_at" | "verified_by">,
): Promise<OrderRecord> {
  const row = {
    ...input,
    created_at: nowIso(),
    updated_at: nowIso(),
    verified_at: null,
    verified_by: null,
  };
  if (storageMode() === "local") {
    return mutateLocal((db) => {
      const order: OrderRecord = { id: uid(), ...row };
      db.orders.unshift(order);
      return order;
    });
  }
  const { data, error } = await getDb().from("orders").insert(row).select("*").single<OrderRecord>();
  if (error || !data) throw error ?? new Error("ORDER_CREATE_FAILED");
  return data;
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  if (storageMode() === "local") {
    const db = await readLocal();
    return db.orders.find((o) => o.id === id) ?? null;
  }
  const { data } = await getDb().from("orders").select("*").eq("id", id).maybeSingle<OrderRecord>();
  return data ?? null;
}

export async function getOrderByResi(resi: string): Promise<OrderRecord | null> {
  const normalized = resi.trim().toUpperCase();
  if (storageMode() === "local") {
    const db = await readLocal();
    return db.orders.find((o) => o.resi === normalized) ?? null;
  }
  const { data } = await getDb()
    .from("orders")
    .select("*")
    .eq("resi", normalized)
    .maybeSingle<OrderRecord>();
  return data ?? null;
}

export async function listOrders(opts?: {
  customerId?: string;
  status?: string;
  paymentStatus?: string;
  limit?: number;
}): Promise<OrderRecord[]> {
  if (storageMode() === "local") {
    const db = await readLocal();
    let rows = [...db.orders];
    if (opts?.customerId) rows = rows.filter((o) => o.customer_id === opts.customerId);
    if (opts?.status) rows = rows.filter((o) => o.status === opts.status);
    if (opts?.paymentStatus) rows = rows.filter((o) => o.payment_status === opts.paymentStatus);
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return opts?.limit ? rows.slice(0, opts.limit) : rows;
  }
  let query = getDb().from("orders").select("*").order("created_at", { ascending: false });
  if (opts?.customerId) query = query.eq("customer_id", opts.customerId);
  if (opts?.status) query = query.eq("status", opts.status);
  if (opts?.paymentStatus) query = query.eq("payment_status", opts.paymentStatus);
  if (opts?.limit) query = query.limit(opts.limit);
  const { data } = await query;
  return data ?? [];
}

export async function updateOrder(
  id: string,
  patch: Partial<OrderRecord>,
): Promise<OrderRecord | null> {
  const clean = { ...patch, updated_at: nowIso() };
  if (storageMode() === "local") {
    return mutateLocal((db) => {
      const order = db.orders.find((o) => o.id === id);
      if (!order) return null;
      Object.assign(order, clean);
      return order;
    });
  }
  const { data } = await getDb()
    .from("orders")
    .update(clean)
    .eq("id", id)
    .select("*")
    .maybeSingle<OrderRecord>();
  return data ?? null;
}

/* ------------------------------------------------------------------ */
/* Guides                                                               */
/* ------------------------------------------------------------------ */

const guideFallback = (slug: string) => GUIDES.find((g) => g.id === slug);

function normalizeGuide(row: Partial<GuideRecord> & { id: string }): GuideRecord {
  const fallback = guideFallback(String(row.slug ?? row.id));
  const category = String(row.category ?? row.specialty ?? fallback?.category ?? "history");
  return {
    id: String(row.id),
    slug: String(row.slug ?? fallback?.id ?? row.id),
    name: String(row.name ?? fallback?.name ?? "Pemandu"),
    phone: String(row.phone ?? ""),
    specialty: String(row.specialty ?? category),
    category,
    area: String(row.area ?? fallback?.area ?? "tomok"),
    languages: parseLanguages(row.languages ?? fallback?.languages),
    rating: Number(row.rating ?? fallback?.rating ?? 5),
    reviews: Number(row.reviews ?? fallback?.reviews ?? 0),
    years: Number(row.years ?? fallback?.years ?? 1),
    price: Number(row.price ?? fallback?.price ?? 300_000),
    license: String(row.license ?? fallback?.license ?? "-"),
    schedule: String(row.schedule ?? "08:00 - 16:00 WIB"),
    active: row.active !== false,
    scene: String(row.scene ?? fallback?.scene ?? "guide"),
    avatar_class: String(row.avatar_class ?? fallback?.avatarClass ?? "bg-navy-800"),
    created_at: String(row.created_at ?? nowIso()),
  };
}

export async function listGuides(): Promise<GuideRecord[]> {
  if (storageMode() === "local") {
    const db = await readLocal();
    return [...db.guides].sort((a, b) => b.rating - a.rating);
  }
  const { data, error } = await getDb().from("guides").select("*");
  if (error || !data || data.length === 0) {
    return GUIDES.map((g) =>
      normalizeGuide({
        id: g.id,
        slug: g.id,
        name: g.name,
        languages: g.languages,
        category: g.category,
        area: g.area,
        years: g.years,
        rating: g.rating,
        reviews: g.reviews,
        price: g.price,
        license: g.license,
        scene: g.scene,
        avatar_class: g.avatarClass,
        active: true,
      }),
    );
  }
  return (data as Partial<GuideRecord>[]).map((row) => normalizeGuide(row as GuideRecord));
}

export async function updateGuide(
  slug: string,
  patch: Partial<Pick<GuideRecord, "phone" | "price" | "active" | "schedule" | "name">>,
): Promise<GuideRecord | null> {
  if (storageMode() === "local") {
    return mutateLocal((db) => {
      const guide = db.guides.find((g) => g.slug === slug || g.id === slug);
      if (!guide) return null;
      Object.assign(guide, patch);
      return guide;
    });
  }
  const { data } = await getDb()
    .from("guides")
    .update(patch)
    .eq("slug", slug)
    .select("*")
    .maybeSingle();
  return data ? normalizeGuide(data as GuideRecord) : null;
}

/* ------------------------------------------------------------------ */
/* Reviews                                                              */
/* ------------------------------------------------------------------ */

export async function listReviews(opts?: { published?: boolean }): Promise<ReviewRecord[]> {
  try {
    if (storageMode() === "local") {
      const db = await readLocal();
      const rows = opts?.published
        ? db.reviews.filter((review) => review.published)
        : db.reviews;
      return [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    let query = getDb().from("reviews").select("*").order("created_at", { ascending: false });
    if (opts?.published) query = query.eq("published", true);
    const { data } = await query;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function createReview(input: {
  user_id: string;
  order_resi: string | null;
  name: string;
  rating: number;
  comment: string;
}): Promise<ReviewRecord> {
  const row: ReviewRecord = {
    id: uid(),
    user_id: input.user_id,
    order_resi: input.order_resi,
    name: input.name,
    rating: input.rating,
    comment: input.comment,
    published: false,
    created_at: nowIso(),
  };
  if (storageMode() === "local") {
    return mutateLocal((db) => {
      const existing = db.reviews.find(
        (r) => r.user_id === row.user_id && r.order_resi === row.order_resi,
      );
      if (existing) throw new Error("ALREADY_REVIEWED");
      db.reviews.unshift(row);
      return row;
    });
  }
  const { data, error } = await getDb().from("reviews").insert(row).select("*").single<ReviewRecord>();
  if (error || !data) throw error ?? new Error("REVIEW_FAILED");
  return data;
}

export async function updateReview(
  id: string,
  patch: Partial<Pick<ReviewRecord, "published">>,
): Promise<ReviewRecord | null> {
  if (storageMode() === "local") {
    return mutateLocal((db) => {
      const review = db.reviews.find((r) => r.id === id);
      if (!review) return null;
      Object.assign(review, patch);
      return review;
    });
  }
  const { data } = await getDb()
    .from("reviews")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle<ReviewRecord>();
  return data ?? null;
}

/* ------------------------------------------------------------------ */
/* Lockers                                                              */
/* ------------------------------------------------------------------ */

export async function listLockers(): Promise<LockerRecord[]> {
  try {
    if (storageMode() === "local") {
      const db = await readLocal();
      return [...db.lockers];
    }
    const { data } = await getDb().from("lockers").select("*").order("name");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function updateLocker(
  id: string,
  patch: Partial<Pick<LockerRecord, "officer" | "capacity" | "keys" | "active">>,
): Promise<LockerRecord | null> {
  if (storageMode() === "local") {
    return mutateLocal((db) => {
      const locker = db.lockers.find((l) => l.id === id);
      if (!locker) return null;
      Object.assign(locker, patch);
      return locker;
    });
  }
  const { data } = await getDb()
    .from("lockers")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle<LockerRecord>();
  return data ?? null;
}

/** Okupansi nyata dari pesanan penitipan yang masih aktif. */
export function lockerOccupancy(orders: OrderRecord[], location: string): number {
  const activeStatuses: OrderStatus[] = ["BARU", "DIKONFIRMASI", "DITUGASKAN", "DIJEMPUT"];
  return orders
    .filter(
      (o) =>
        activeStatuses.includes(o.status) &&
        (o.service_key === "penitipan" || o.add_ons?.includes("penitipan")) &&
        o.meeting_point.toLowerCase().includes(location.toLowerCase().split(" ").pop() ?? ""),
    )
    .reduce((sum, o) => sum + Math.max(1, o.suitcases), 0);
}

/* ------------------------------------------------------------------ */
/* Services (ketersediaan)                                              */
/* ------------------------------------------------------------------ */

export async function listServices(): Promise<ServiceRecord[]> {
  const defaults: ServiceRecord[] = SERVICES.map((s) => ({ key: s.key, active: true }));
  try {
    if (storageMode() === "local") {
      const db = await readLocal();
      return defaults.map((d) => db.services.find((s) => s.key === d.key) ?? d);
    }
    const { data } = await getDb().from("services").select("key,active");
    return defaults.map((d) => (data ?? []).find((s) => s.key === d.key) ?? d);
  } catch {
    return defaults;
  }
}

export async function updateService(key: string, active: boolean): Promise<void> {
  const row = { key, active };
  if (storageMode() === "local") {
    await mutateLocal((db) => {
      const service = db.services.find((s) => s.key === key);
      if (service) service.active = active;
      else db.services.push({ key: key as ServiceKey, active });
    });
    return;
  }
  await getDb().from("services").upsert(row, { onConflict: "key" });
}
