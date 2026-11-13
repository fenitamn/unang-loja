import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { getDb, isDbConfigured, ORDER_STATUSES } from "@/lib/supabase";

/**
 * PATCH /api/orders/[id] — admin mengubah status (dan/atau pemandu).
 * Body: { status?: "BARU"|"DIKONFIRMASI"|..., guideId?: uuid|null }
 * Bonus: pemesan otomatis dapat WA pemberitahuan status.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  }
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as { status?: string; guideId?: string | null };

  if (body.status && !(ORDER_STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status) update.status = body.status;
  if (body.guideId !== undefined) update.guide_id = body.guideId || null;

  const { data, error } = await getDb()
    .from("orders")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  // WA pemberitahuan ke pemesan (bonus — gagal tidak masalah)
  if (body.status && body.status !== data.status) {
    try {
      const { sendAdminWhatsApp } = await import("@/lib/notify");
      const FONTE_TOKEN = process.env.FONTE_TOKEN ?? "";
      if (FONTE_TOKEN && data.phone) {
        await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            Authorization: FONTE_TOKEN,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            target: data.phone,
            message: `🧳 *UNANG LOJA*\nHalo ${data.name}, status pesanan Anda:\n📄 Resi: *${data.resi}*\n📊 Status baru: *${body.status}*\n\nLacak: /id/status?resi=${data.resi}`,
          }),
        });
      }
    } catch {
      /* abaikan */
    }
  }

  return NextResponse.json({ order: data });
}
