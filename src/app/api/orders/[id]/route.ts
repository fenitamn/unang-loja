import { NextRequest, NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import {
  getOrderById,
  listGuides,
  storeAvailable,
  updateOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/store";

const STATUSES: OrderStatus[] = ["BARU", "DIKONFIRMASI", "DITUGASKAN", "DIJEMPUT", "SELESAI", "BATAL"];
const PAYMENTS: PaymentStatus[] = ["UNPAID", "PENDING", "PAID", "REJECTED"];

type Body = {
  status?: string;
  payment_status?: string;
  admin_note?: string | null;
  seal_code?: string | null;
  guide_id?: string | null;
};

/** PATCH /api/orders/[id] — admin memperbarui status/pembayaran/segel/pemandu. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  if (!storeAvailable()) {
    return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Body;
  const patch: Parameters<typeof updateOrder>[1] = {};

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as OrderStatus)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }
    patch.status = body.status as OrderStatus;
  }

  if (body.payment_status !== undefined) {
    if (!PAYMENTS.includes(body.payment_status as PaymentStatus)) {
      return NextResponse.json({ error: "Status pembayaran tidak valid." }, { status: 400 });
    }
    patch.payment_status = body.payment_status as PaymentStatus;
    if (patch.payment_status === "PAID") {
      patch.verified_at = new Date().toISOString();
      patch.verified_by = user.name;
    }
    if (patch.payment_status === "REJECTED") {
      patch.verified_at = null;
      patch.verified_by = null;
    }
  }

  if (body.admin_note !== undefined) {
    patch.admin_note = body.admin_note ? String(body.admin_note).trim().slice(0, 1000) : null;
  }
  if (body.seal_code !== undefined) {
    patch.seal_code = body.seal_code ? String(body.seal_code).trim().toUpperCase().slice(0, 40) : null;
  }
  if (body.guide_id !== undefined) {
    if (body.guide_id) {
      const guides = await listGuides();
      if (!guides.some((g) => g.id === body.guide_id)) {
        return NextResponse.json({ error: "Pemandu tidak ditemukan." }, { status: 400 });
      }
      patch.guide_id = body.guide_id;
    } else {
      patch.guide_id = null;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });
  }

  try {
    const updated = await updateOrder(id, patch);
    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    console.error("[orders:update]", error);
    return NextResponse.json({ error: "Gagal memperbarui pesanan." }, { status: 500 });
  }
}
