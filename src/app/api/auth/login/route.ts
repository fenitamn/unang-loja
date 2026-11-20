import { NextResponse } from "next/server";
import {
  clientKey,
  ensureAdminAccount,
  isValidEmail,
  issueSession,
  rateLimit,
  sameOrigin,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail, storeAvailable } from "@/lib/store";

type Body = { email?: string; password?: string; adminOnly?: boolean };

/** POST /api/auth/login — login pelanggan & admin (role dicek terpisah). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, "login"), 8, 5 * 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }
  if (!storeAvailable()) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi di server. Hubungi admin." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!isValidEmail(email) || !password) {
    return NextResponse.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
  }

  try {
    // Menyiapkan akun admin pertama dari env (produksi) / default dev.
    if (body.adminOnly) await ensureAdminAccount();

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
    }
    if (body.adminOnly && user.role !== "admin") {
      return NextResponse.json(
        { error: "Akun ini bukan administrator. Gunakan halaman masuk pelanggan." },
        { status: 403 },
      );
    }

    await issueSession(user);
    return NextResponse.json({
      ok: true,
      role: user.role,
      name: user.name,
      redirect: user.role === "admin" ? "/admin/dashboard" : "/akun",
    });
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json({ error: "Login gagal. Coba lagi." }, { status: 500 });
  }
}
