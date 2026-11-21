import { NextRequest, NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { updateReview } from "@/lib/store";

/** PATCH /api/admin/reviews/[id] — publikasi / sembunyikan ulasan. */
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
  const body = (await req.json().catch(() => ({}))) as { published?: boolean };
  if (typeof body.published !== "boolean") {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  try {
    const review = await updateReview(id, { published: body.published });
    if (!review) return NextResponse.json({ error: "Ulasan tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ok: true, review });
  } catch (error) {
    console.error("[admin:reviews]", error);
    return NextResponse.json({ error: "Gagal memperbarui ulasan." }, { status: 500 });
  }
}
