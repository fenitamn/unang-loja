import { NextResponse } from "next/server";
import {
  clientKey,
  hashPassword,
  isValidEmail,
  isValidPhone,
  issueSession,
  rateLimit,
  sameOrigin,
} from "@/lib/auth";
import { createUser, findUserByEmail, storeAvailable } from "@/lib/store";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
};

/** POST /api/auth/register — registrasi pelanggan. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  if (!rateLimit(clientKey(req, "register"), 8, 10 * 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }
  if (!storeAvailable()) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi di server. Hubungi admin." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const password = body.password ?? "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Alamat email tidak valid." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
  }

  try {
    if (await findUserByEmail(email)) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk." },
        { status: 409 },
      );
    }
    const user = await createUser({
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      role: "customer",
    });
    await issueSession(user);
    return NextResponse.json({ ok: true, role: user.role }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    console.error("[auth/register]", error);
    return NextResponse.json({ error: "Registrasi gagal. Coba lagi." }, { status: 500 });
  }
}
