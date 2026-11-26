/**
 * Autentikasi & sesi (server-only).
 *
 * - Password di-hash dengan scrypt (bukan plaintext).
 * - Sesi = cookie HttpOnly berisi payload bertanda tangan HMAC-SHA256.
 * - Role: "admin" | "customer" — dicek di setiap halaman & API yang dilindungi.
 *
 * Env produksi: AUTH_SECRET (wajib), ADMIN_EMAIL + ADMIN_PASSWORD (seed admin pertama).
 * Dev lokal: secret dibuat otomatis di .data/auth-secret.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  countAdmins,
  createUser,
  findUserByEmail,
  getUserById,
  localStoreAllowed,
  storageMode,
  updateUser,
  type PublicUser,
} from "@/lib/store";

const COOKIE_NAME = "ul_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type SessionUser = PublicUser;

/* ------------------------------ password ------------------------------ */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = String(stored).split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

/* ------------------------------- secret ------------------------------- */

let cachedSecret: string | null = null;

async function getSecret(): Promise<string> {
  if (cachedSecret) return cachedSecret;
  const envSecret = process.env.AUTH_SECRET;
  if (envSecret && envSecret.length >= 16) {
    cachedSecret = envSecret;
    return cachedSecret;
  }
  if (!localStoreAllowed()) {
    throw new Error("AUTH_SECRET belum diset di server.");
  }
  const file = path.join(process.cwd(), ".data", "auth-secret");
  try {
    cachedSecret = (await fs.readFile(file, "utf8")).trim();
  } catch {
    cachedSecret = crypto.randomBytes(32).toString("hex");
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, cachedSecret, "utf8");
  }
  return cachedSecret;
}

/* ------------------------------- token -------------------------------- */

const sign = (payload: string, secret: string) =>
  crypto.createHmac("sha256", secret).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export async function issueSession(user: SessionUser): Promise<void> {
  const secret = await getSecret();
  const payload = Buffer.from(
    JSON.stringify({ uid: user.id, role: user.role, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  const token = `${payload}.${sign(payload, secret)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const secret = await getSecret();
    if (!safeEqual(signature, sign(payload, secret))) {
      console.error("[auth] tanda tangan sesi tidak cocok");
      return null;
    }
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      uid?: string;
      exp?: number;
    };
    if (!data.uid || !data.exp || data.exp < Date.now()) return null;
    return await getUserById(data.uid);
  } catch (error) {
    console.error("[auth] getSession gagal:", error);
    return null;
  }
}

/* ------------------------------- guards ------------------------------- */

/**
 * Hanya izinkan path internal sebagai tujuan setelah login.
 * Mencegah open redirect (`//evil.com`, `https://evil.com`) dan loop ke API.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const next = value.trim();
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return null;
  }
  try {
    const base = "https://unang-loja.local";
    const url = new URL(next, base);
    if (url.origin !== base || !url.pathname.startsWith("/")) return null;
    if (url.pathname.startsWith("/api/")) return null;
    // Jangan kembali ke halaman autentikasi (mencegah redirect loop).
    if (/\/(?:masuk|daftar|lupa-sandi)(?:\/|$)/.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export async function requireAdminPage(locale: string): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/${locale}/admin`);
  if (user.role !== "admin") redirect(`/${locale}/masuk?error=admin-only`);
  return user;
}

/** Semua halaman situs pelanggan wajib login (customer maupun admin). */
export async function requireUserPage(
  locale: string,
  nextPath = `/${locale}`,
): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect(`/${locale}/masuk?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function requireCustomerPage(
  locale: string,
  nextPath = `/${locale}/akun`,
): Promise<SessionUser> {
  return requireUserPage(locale, nextPath);
}

/* --------------------------- admin seeding ---------------------------- */

/**
 * Membuat akun admin pertama bila belum ada:
 * - dev lokal: admin@unangloja.id / admin12345 (hanya untuk pengembangan)
 * - produksi: wajib set ADMIN_EMAIL + ADMIN_PASSWORD
 *
 * Tidak pernah menaikkan role akun yang sudah ada.
 */
export async function ensureAdminAccount(): Promise<{
  ready: boolean;
  email?: string;
  localDefault?: boolean;
}> {
  try {
    if ((await countAdmins()) > 0) return { ready: true };

    const isLocal = storageMode() === "local" && process.env.NODE_ENV !== "production";
    const email = (process.env.ADMIN_EMAIL ?? (isLocal ? "admin@unangloja.id" : "")).trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD ?? (isLocal ? "admin12345" : "");
    if (!email || !password || password.length < 8) return { ready: false };

    const existing = await findUserByEmail(email);
    if (existing) {
      return { ready: existing.role === "admin", email };
    }
    await createUser({
      name: process.env.ADMIN_NAME ?? "Admin UNANG LOJA",
      email,
      phone: process.env.ADMIN_WA ?? "",
      passwordHash: hashPassword(password),
      role: "admin",
    });
    return { ready: true, email, localDefault: isLocal };
  } catch {
    return { ready: false };
  }
}

/* ---------------------------- rate limiting --------------------------- */

const attempts = new Map<string, { count: number; reset: number }>();

/** Rate limit sederhana per proses (cukup untuk mencegah brute force dasar). */
export function rateLimit(key: string, limit = 6, windowMs = 60_000): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.reset < now) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  current.count += 1;
  if (attempts.size > 5_000) attempts.clear();
  return current.count <= limit;
}

export function clientKey(req: Request, scope: string): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

/** Validasi Origin sederhana untuk permintaan mutasi (CSRF). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/* ------------------------------ helpers ------------------------------- */

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

export const isValidPhone = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length >= 8 && digits.length <= 16;
};

export async function updatePassword(userId: string, password: string) {
  return updateUser(userId, { password_hash: hashPassword(password) });
}
