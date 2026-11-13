import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, isAdminConfigured } from "@/lib/admin";

/** POST /api/admin/session — login admin (password dari env ADMIN_PASSWORD). */
export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD belum diset di server." },
      { status: 503 },
    );
  }
  const { password } = (await req.json()) as { password?: string };
  if (password !== adminPassword()) {
    return NextResponse.json({ error: "Password salah." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: "/",
  });
  return res;
}

/** DELETE /api/admin/session — logout. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
