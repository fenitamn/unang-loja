import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listGuides, listOrders } from "@/lib/store";
import { serviceLabel, STATUS_LABEL, PAYMENT_LABEL } from "@/lib/admin-ui";

const escape = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** GET /api/admin/export — unduh CSV rekap pesanan (khusus admin). */
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    const [orders, guides] = await Promise.all([
      listOrders({ limit: 1000 }),
      listGuides().catch(() => []),
    ]);
    const guideMap = new Map(guides.map((g) => [g.id, g.name]));

    const header = [
      "No. Resi",
      "Waktu Pesan (WIB)",
      "Nama Pelanggan",
      "No. WhatsApp",
      "Email",
      "Jenis Layanan",
      "Tanggal Layanan",
      "Titik Temu / Hotel",
      "Jumlah Koper",
      "Jumlah Peserta",
      "Total Biaya (Rp)",
      "Status Pesanan",
      "Status Pembayaran",
      "Metode Pembayaran",
      "Nomor Segel Koper",
      "Pemandu Wisata",
      "Catatan Admin",
    ];
    const rows = orders.map((order) =>
      [
        order.resi,
        order.created_at,
        order.name,
        order.phone,
        order.email ?? "-",
        serviceLabel(order.service_key),
        order.date,
        order.meeting_point,
        order.suitcases,
        order.participants,
        order.total,
        STATUS_LABEL[order.status] ?? order.status,
        PAYMENT_LABEL[order.payment_status] ?? order.payment_status,
        order.payment_method ?? "-",
        order.seal_code ?? "-",
        guideMap.get(order.guide_id ?? "") ?? order.guide_id ?? "-",
        order.admin_note ?? "-",
      ]
        .map(escape)
        .join(","),
    );
    const csv = `\uFEFF${header.join(",")}\n${rows.join("\n")}`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rekap-pesanan-unang-loja-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("[admin:export]", error);
    return NextResponse.json({ error: "Gagal mengekspor data." }, { status: 500 });
  }
}
