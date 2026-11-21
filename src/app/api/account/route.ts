import { NextResponse } from "next/server";
import { getSession, isValidPhone, sameOrigin, verifyPassword } from "@/lib/auth";
import { findUserByEmail, updateUser } from "@/lib/store";

type Body = {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
};

/** PATCH /api/account — ubah profil & kata sandi pelanggan yang login. */
export async function PATCH(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  const name = (body.name ?? session.name).trim();
  const phone = (body.phone ?? session.phone).trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
  }
  if (phone && !isValidPhone(phone)) {
    return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 400 });
  }

  const patch: { name: string; phone: string; password_hash?: string } = { name, phone };
  if (body.newPassword) {
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "Kata sandi baru minimal 8 karakter." }, { status: 400 });
    }
    const record = await findUserByEmail(session.email);
    if (!record || !body.currentPassword || !verifyPassword(body.currentPassword, record.password_hash)) {
      return NextResponse.json({ error: "Kata sandi saat ini salah." }, { status: 400 });
    }
    const { hashPassword } = await import("@/lib/auth");
    patch.password_hash = hashPassword(body.newPassword);
  }

  try {
    const user = await updateUser(session.id, patch);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("[account:update]", error);
    return NextResponse.json({ error: "Gagal memperbarui profil." }, { status: 500 });
  }
}
