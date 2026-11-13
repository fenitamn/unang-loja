import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import {
  generateResi,
  getDb,
  isDbConfigured,
  type OrderRow,
} from "@/lib/supabase";
import { formatNewOrderMessage, sendAdminWhatsApp } from "@/lib/notify";

type CreateOrderBody = {
  serviceKey?: string;
  serviceLabel?: string;
  addOns?: string[];
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
  total?: number;
};

/** GET /api/orders — admin: semua pesanan. ?resi=UL-... — publik: lacak 1 pesanan. */
export async function GET(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  }

  const resi = req.nextUrl.searchParams.get("resi");

  // Pelacakan publik per resi
  if (resi) {
    const { data, error } = await getDb()
      .from("orders")
      .select("*")
      .eq("resi", resi.trim().toUpperCase())
      .maybeSingle<OrderRow>();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Resi tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ order: data });
  }

  // Daftar semua pesanan — hanya admin
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const { data, error } = await getDb()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

/** POST /api/orders — simpan pesanan baru + kirim WA ke admin. */
export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database belum dikonfigurasi (SUPABASE_URL / SERVICE_ROLE_KEY)." },
      { status: 503 },
    );
  }

  const body = (await req.json()) as CreateOrderBody;

  // Validasi minimal
  const phone = (body.phone ?? "").replace(/[^0-9]/g, "");
  if (!body.serviceKey || !body.date || !body.meetingPoint || !body.name?.trim() || !phone) {
    return NextResponse.json({ error: "Data pesanan belum lengkap." }, { status: 400 });
  }
  if (phone.length < 8) {
    return NextResponse.json({ error: "Nomor WhatsApp tidak valid." }, { status: 400 });
  }

  const row = {
    resi: generateResi(),
    service_key: body.serviceKey,
    add_ons: body.addOns ?? [],
    date: body.date,
    meeting_point: body.meetingPoint,
    zone: body.zone ?? null,
    suitcases: body.suitcases ?? 1,
    participants: body.participants ?? 1,
    notes: body.notes ?? null,
    name: body.name.trim(),
    phone,
    email: body.email ?? null,
    payment_method: body.paymentMethod ?? null,
    total: Math.max(0, Math.round(body.total ?? 0)),
    status: "BARU",
  };

  const { data, error } = await getDb()
    .from("orders")
    .insert(row)
    .select("*")
    .single<OrderRow>();

  if (error || !data) {
    console.error("[orders] insert gagal:", error);
    return NextResponse.json({ error: "Gagal menyimpan pesanan." }, { status: 500 });
  }

  // Kirim WA ke admin (tidak menggagalkan pesanan jika WA gagal)
  const waOk = await sendAdminWhatsApp(
    formatNewOrderMessage({
      resi: data.resi,
      service: body.serviceLabel ?? data.service_key,
      name: data.name,
      phone: data.phone,
      date: data.date,
      meetingPoint: data.meeting_point,
      zone: data.zone,
      suitcases: data.suitcases,
      participants: data.participants,
      notes: data.notes,
      total: data.total,
    }),
  );

  return NextResponse.json({ order: data, notified: waOk }, { status: 201 });
}
