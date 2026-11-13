/**
 * Autentikasi admin sederhana — 1 password dari env, cookie httpOnly.
 * Cukup untuk MVP; nanti bisa diganti Supabase Auth (multi-admin).
 *
 * Env: ADMIN_PASSWORD
 */
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "ul_admin";

export const adminPassword = () => process.env.ADMIN_PASSWORD ?? "";

export const isAdminConfigured = () => Boolean(adminPassword());

export function isAdminRequest(req: NextRequest): boolean {
  return req.cookies.get(ADMIN_COOKIE)?.value === "granted";
}
