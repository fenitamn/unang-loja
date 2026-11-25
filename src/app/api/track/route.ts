import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrderByResi, listGuides, storeAvailable } from "@/lib/store";

/** GET /api/track?resi=UL-... — data pelacakan milik pelanggan login (admin: semua). */
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Silakan masuk untuk melacak pesanan." }, { status: 401 });
  }

  const resi = req.nextUrl.searchParams.get("resi")?.trim().toUpperCase();
  if (!resi) {
    return NextResponse.json({ error: "Resi wajib diisi." }, { status: 400 });
  }
  if (!storeAvailable()) {
    return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  }

  try {
    const order = await getOrderByResi(resi);
    if (!order || (user.role !== "admin" && order.customer_id !== user.id)) {
      // Jangan bocorkan keberadaan pesanan milik pelanggan lain.
      return NextResponse.json({ error: "Resi tidak ditemukan." }, { status: 404 });
    }
    const guides = await listGuides();
    const guide = order.guide_id ? guides.find((g) => g.id === order.guide_id) : null;

    return NextResponse.json({
      order: {
        resi: order.resi,
        status: order.status,
        payment_status: order.payment_status,
        service_key: order.service_key,
        date: order.date,
        meeting_point: order.meeting_point,
        zone: order.zone,
        suitcases: order.suitcases,
        participants: order.participants,
        name: order.name,
        seal_code: order.seal_code,
        guide_name: guide?.name ?? null,
        total: order.total,
        payment_method: order.payment_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        verified_at: order.verified_at,
      },
    });
  } catch (error) {
    console.error("[track]", error);
    return NextResponse.json({ error: "Gagal melacak pesanan." }, { status: 500 });
  }
}
