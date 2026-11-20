import { NextRequest, NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { updateGuide } from "@/lib/store";

type Body = { active?: boolean; price?: number; phone?: string; schedule?: string; name?: string };

/** PATCH /api/admin/guides/[slug] — kelola ketersediaan & tarif pemandu. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as Body;
  const patch: { active?: boolean; price?: number; phone?: string; schedule?: string; name?: string } = {};

  if (body.active !== undefined) patch.active = Boolean(body.active);
  if (body.price !== undefined) {
    const price = Math.round(Number(body.price));
    if (!Number.isFinite(price) || price < 0 || price > 2_000_000) {
      return NextResponse.json({ error: "Tarif tidak valid." }, { status: 400 });
    }
    patch.price = price;
  }
  if (body.phone !== undefined) {
    const phone = String(body.phone).trim().replace(/[^0-9+]/g, "").slice(0, 20);
    patch.phone = phone;
  }
  if (body.schedule !== undefined) {
    patch.schedule = String(body.schedule).trim().slice(0, 60);
  }
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2) return NextResponse.json({ error: "Nama pemandu tidak valid." }, { status: 400 });
    patch.name = name.slice(0, 80);
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });
  }

  try {
    const guide = await updateGuide(slug, patch);
    if (!guide) return NextResponse.json({ error: "Pemandu tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, guide });
  } catch (error) {
    console.error("[admin:guides]", error);
    return NextResponse.json({ error: "Gagal memperbarui pemandu." }, { status: 500 });
  }
}
