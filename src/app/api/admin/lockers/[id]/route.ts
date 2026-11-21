import { NextRequest, NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { updateLocker } from "@/lib/store";

type Body = { officer?: string; capacity?: number; keys?: number; active?: boolean };

/** PATCH /api/admin/lockers/[id] — kapasitas & petugas loker. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Body;
  const patch: { officer?: string; capacity?: number; keys?: number; active?: boolean } = {};

  if (body.officer !== undefined) patch.officer = String(body.officer).trim().slice(0, 80);
  if (body.capacity !== undefined) {
    const capacity = Math.round(Number(body.capacity));
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) {
      return NextResponse.json({ error: "Kapasitas tidak valid (1–200)." }, { status: 400 });
    }
    patch.capacity = capacity;
  }
  if (body.keys !== undefined) {
    const keys = Math.round(Number(body.keys));
    if (!Number.isFinite(keys) || keys < 0 || keys > 200) {
      return NextResponse.json({ error: "Jumlah kunci tidak valid." }, { status: 400 });
    }
    patch.keys = keys;
  }
  if (body.active !== undefined) patch.active = Boolean(body.active);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });
  }

  try {
    const locker = await updateLocker(id, patch);
    if (!locker) return NextResponse.json({ error: "Loker tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, locker });
  } catch (error) {
    console.error("[admin:lockers]", error);
    return NextResponse.json({ error: "Gagal memperbarui loker." }, { status: 500 });
  }
}
