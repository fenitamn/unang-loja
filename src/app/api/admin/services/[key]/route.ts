import { NextRequest, NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { updateService } from "@/lib/store";
import { SERVICES } from "@/lib/data";

/** PATCH /api/admin/services/[key] — aktif/nonaktifkan layanan. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { key } = await params;
  if (!SERVICES.some((s) => s.key === key)) {
    return NextResponse.json({ error: "Layanan tidak ditemukan." }, { status: 404 });
  }
  const body = (await req.json().catch(() => ({}))) as { active?: boolean };
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  try {
    await updateService(key, body.active);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin:services]", error);
    return NextResponse.json({ error: "Gagal memperbarui layanan." }, { status: 500 });
  }
}
