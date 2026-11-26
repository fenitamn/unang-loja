import { NextRequest, NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { formatNewOrderMessage, sendAdminWhatsApp } from "@/lib/notify";
import {
  getOrderByResi,
  listGuides,
  listOrders,
  createOrder,
  storeAvailable,
  type PaymentStatus,
} from "@/lib/store";
import { generateResi } from "@/lib/supabase";
import { PAYMENT_METHODS, SERVICES } from "@/lib/data";

type CreateOrderBody = {
  serviceKey?: string;
  serviceLabel?: string;
  addOns?: string[];
  guideId?: string | null;
  date?: string;
  meetingPoint?: string;
  zone?: string | null;
  suitcases?: number;
  participants?: number;
  notes?: string | null;
  name?: string;
  phone?: string;
  email?: string | null;
  paymentMethod?: string | null;
  paymentRef?: string | null;
  paymentProof?: string | null;
  total?: number;
};

const clean = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);

/** GET /api/orders — hanya admin: daftar pesanan. */
export async function GET(req: NextRequest) {
  if (!storeAvailable()) {
    return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  }
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  try {
    const orders = await listOrders({ status, limit: 500 });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[orders:list]", error);
    return NextResponse.json({ error: "Gagal memuat pesanan." }, { status: 500 });
  }
}

/** POST /api/orders — pelanggan login membuat pesanan + notifikasi WA admin. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Silakan masuk untuk membuat pesanan." }, { status: 401 });
  }
  if (!storeAvailable()) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi (SUPABASE_URL / SERVICE_ROLE_KEY)." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as CreateOrderBody;

  const phone = clean(body.phone || user.phone, 24).replace(/[^0-9]/g, "");
  const serviceKey = clean(body.serviceKey, 40);
  const method = body.paymentMethod ? clean(body.paymentMethod, 40) : "";
  const parsedDate = body.date ? new Date(String(body.date)) : null;
  if (
    !SERVICES.some((s) => s.key === serviceKey) ||
    !parsedDate ||
    Number.isNaN(parsedDate.getTime()) ||
    !body.meetingPoint?.trim() ||
    !phone
  ) {
    return NextResponse.json({ error: "Data pesanan belum lengkap." }, { status: 400 });
  }
  if (phone.length < 8) {
    return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 400 });
  }
  if (!method || !(method in PAYMENT_METHODS)) {
    return NextResponse.json({ error: "Metode pembayaran wajib dipilih." }, { status: 400 });
  }

  const proof = typeof body.paymentProof === "string" ? body.paymentProof : null;
  if (proof && (!/^data:image\/(png|jpe?g|webp);base64,/i.test(proof) || proof.length > 3_200_000)) {
    return NextResponse.json(
      { error: "Bukti pembayaran harus gambar JPG/PNG/WEBP maksimal 2 MB." },
      { status: 400 },
    );
  }

  const total = Math.min(50_000_000, Math.max(0, Math.round(Number(body.total) || 0)));
  const paymentStatus: PaymentStatus = proof ? "PENDING" : "UNPAID";

  try {
    // Form mengirim slug pemandu (mis. "g4"). Database admin memakai UUID,
    // jadi resolve ke id asli agar relasi guide_id tidak berisi slug.
    const guideSlug = body.guideId ? clean(body.guideId, 80) : "";
    let guideId: string | null = null;
    if (guideSlug) {
      const guide = (await listGuides()).find(
        (record) => record.active && (record.slug === guideSlug || record.id === guideSlug),
      );
      guideId = guide?.id ?? null;
    }

    let resi = generateResi();
    for (let i = 0; i < 3 && (await getOrderByResi(resi)); i += 1) {
      resi = generateResi();
    }

    const order = await createOrder({
      resi,
      customer_id: user.id,
      service_key: serviceKey,
      add_ons: Array.isArray(body.addOns) ? body.addOns.map((a) => clean(a, 40)).slice(0, 10) : [],
      date: parsedDate.toISOString().slice(0, 10),
      meeting_point: clean(body.meetingPoint, 160),
      zone: body.zone ? clean(body.zone, 20) : null,
      suitcases: Math.max(1, Math.min(50, Math.round(Number(body.suitcases) || 1))),
      participants: Math.max(1, Math.min(50, Math.round(Number(body.participants) || 1))),
      notes: body.notes ? clean(body.notes, 1000) : null,
      name: clean(user.name, 120),
      phone,
      email: user.email ? clean(user.email, 160) : null,
      payment_method: method,
      payment_status: paymentStatus,
      payment_proof: proof,
      payment_ref: body.paymentRef ? clean(body.paymentRef, 80) : null,
      payment_note: null,
      admin_note: null,
      seal_code: null,
      total,
      status: "BARU",
      guide_id: guideId,
    });

    const waOk = await sendAdminWhatsApp(
      formatNewOrderMessage({
        resi: order.resi,
        service: clean(body.serviceLabel, 120) || order.service_key,
        name: order.name,
        phone: order.phone,
        date: order.date,
        meetingPoint: order.meeting_point,
        zone: order.zone,
        suitcases: order.suitcases,
        participants: order.participants,
        notes: order.notes,
        total: order.total,
      }),
    );

    return NextResponse.json({ order, notified: waOk }, { status: 201 });
  } catch (error) {
    console.error("[orders:create]", error);
    return NextResponse.json({ error: "Gagal menyimpan pesanan." }, { status: 500 });
  }
}
