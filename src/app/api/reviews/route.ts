import { NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { createReview, getOrderByResi, listReviews, storeAvailable } from "@/lib/store";

/** GET /api/reviews — ulasan publik; hanya untuk pengguna yang sudah login. */
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });
  if (!storeAvailable()) return NextResponse.json({ reviews: [] });
  try {
    const reviews = await listReviews();
    return NextResponse.json({
      reviews: reviews
        .filter((r) => r.published)
        .map(({ id, name, rating, comment, created_at }) => ({ id, name, rating, comment, created_at })),
    });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

/** POST /api/reviews — pelanggan mengulas pesanan miliknya yang sudah selesai. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    orderResi?: string;
    rating?: number;
    comment?: string;
  };
  const rating = Math.round(Number(body.rating));
  const comment = String(body.comment ?? "").trim().slice(0, 1000);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus 1–5." }, { status: 400 });
  }
  if (comment.length < 10) {
    return NextResponse.json({ error: "Ulasan minimal 10 karakter." }, { status: 400 });
  }

  const resi = String(body.orderResi ?? "").trim().toUpperCase();
  const order = resi ? await getOrderByResi(resi) : null;
  if (!order || order.customer_id !== user.id) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (order.status !== "SELESAI") {
    return NextResponse.json({ error: "Ulasan hanya untuk pesanan selesai." }, { status: 400 });
  }

  try {
    await createReview({
      user_id: user.id,
      order_resi: order.resi,
      name: user.name,
      rating,
      comment,
    });
    return NextResponse.json({ ok: true, message: "Ulasan terkirim dan menunggu moderasi." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_REVIEWED") {
      return NextResponse.json({ error: "Pesanan ini sudah diulas." }, { status: 409 });
    }
    console.error("[reviews:create]", error);
    return NextResponse.json({ error: "Gagal mengirim ulasan." }, { status: 500 });
  }
}
