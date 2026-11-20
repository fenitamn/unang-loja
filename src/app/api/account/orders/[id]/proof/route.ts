import { NextRequest, NextResponse } from "next/server";
import { getSession, sameOrigin } from "@/lib/auth";
import { getOrderById, updateOrder } from "@/lib/store";

/** POST /api/account/orders/[id]/proof — unggah bukti pembayaran milik sendiri. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 403 });
  }
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Silakan masuk." }, { status: 401 });

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order || order.customer_id !== user.id) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }
  if (order.payment_status === "PAID") {
    return NextResponse.json({ error: "Pembayaran sudah terverifikasi." }, { status: 409 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    proof?: string;
    ref?: string;
    method?: string;
  };
  const proof = typeof body.proof === "string" ? body.proof : "";
  if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(proof) || proof.length > 3_200_000) {
    return NextResponse.json(
      { error: "Bukti harus gambar JPG/PNG/WEBP maksimal 2 MB." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateOrder(id, {
      payment_proof: proof,
      payment_ref: body.ref ? String(body.ref).trim().slice(0, 80) : order.payment_ref,
      payment_method: body.method ? String(body.method).trim().slice(0, 40) : order.payment_method,
      payment_status: "PENDING",
      payment_note: null,
    });
    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    console.error("[proof]", error);
    return NextResponse.json({ error: "Gagal mengunggah bukti." }, { status: 500 });
  }
}
