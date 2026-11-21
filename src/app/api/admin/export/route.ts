import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listOrders } from "@/lib/store";

const escape = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** GET /api/admin/export — unduh CSV pesanan (khusus admin). */
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    const orders = await listOrders({ limit: 1000 });
    const header = [
      "resi",
      "created_at",
      "name",
      "phone",
      "email",
      "service",
      "date",
      "meeting_point",
      "suitcases",
      "participants",
      "total",
      "status",
      "payment_status",
      "payment_method",
      "seal_code",
      "guide_id",
    ];
    const rows = orders.map((order) =>
      [
        order.resi,
        order.created_at,
        order.name,
        order.phone,
        order.email,
        order.service_key,
        order.date,
        order.meeting_point,
        order.suitcases,
        order.participants,
        order.total,
        order.status,
        order.payment_status,
        order.payment_method,
        order.seal_code,
        order.guide_id,
      ]
        .map(escape)
        .join(","),
    );
    const csv = `\uFEFF${header.join(",")}\n${rows.join("\n")}`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="unang-loja-orders-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("[admin:export]", error);
    return NextResponse.json({ error: "Gagal mengekspor data." }, { status: 500 });
  }
}
