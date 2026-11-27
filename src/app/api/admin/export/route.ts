import { NextResponse, type NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { getSession } from "@/lib/auth";
import { listGuides, listOrders } from "@/lib/store";
import { serviceLabel, STATUS_LABEL, PAYMENT_LABEL } from "@/lib/admin-ui";

/** Format timestamp ISO ke Waktu Indonesia Barat (WIB) */
function formatWIB(iso?: string | null): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const dateStr = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
    const timeStr = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return `${dateStr}, ${timeStr.replace(".", ":")} WIB`;
  } catch {
    return iso;
  }
}

/** Format nomor WhatsApp agar terbaca rapi dan tidak berubah menjadi notasi ilmiah (6.28E+11) */
function formatPhone(phone?: string | null): string {
  if (!phone) return "-";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    digits = "0" + digits.slice(2);
  }
  if (digits.length >= 10 && digits.length <= 13) {
    return digits.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  }
  return phone;
}

/** Format tanggal layanan menjadi format bahasa Indonesia yang mudah dibaca */
function formatDateService(dateStr?: string | null): string {
  if (!dateStr || dateStr === "-") return "-";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      if (year < 2000 || year > 2100) return dateStr;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d);
    }
  } catch {}
  return dateStr;
}

/** Format metode pembayaran menjadi label resmi yang rapi */
function formatPaymentMethod(method?: string | null): string {
  if (!method || method === "-") return "-";
  const m = method.toLowerCase().trim();
  if (m === "bca") return "Transfer BCA";
  if (m === "bsi") return "Transfer BSI";
  if (m === "mandiri") return "Transfer Mandiri";
  if (m === "bri") return "Transfer BRI";
  if (m === "dana") return "DANA";
  if (m === "gopay") return "GoPay";
  if (m === "ovo") return "OVO";
  if (m === "qris") return "QRIS";
  if (m === "cash" || m === "tunai") return "Tunai / COD";
  return method.toUpperCase();
}

/** Escape field untuk CSV dengan pemisah titik-koma */
const escapeCsv = (value: unknown): string => {
  const text = String(value ?? "");
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * GET /api/admin/export?format=xlsx|csv
 * Unduh rekap pesanan (khusus admin).
 * Default: File Excel (.xlsx) dengan kolom rapi, lebar otomatis, dan format mata uang.
 * Opsi format=csv: File CSV dengan pemisah titik-koma (sep=;) yang otomatis terbagi per kolom di Excel.
 */
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "xlsx").toLowerCase();

    const [orders, guides] = await Promise.all([
      listOrders({ limit: 1000 }),
      listGuides().catch(() => []),
    ]);
    const guideMap = new Map(guides.map((g) => [g.id, g.name]));

    const headers = [
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

    const dataRows = orders.map((order) => [
      order.resi,
      formatWIB(order.created_at),
      order.name,
      formatPhone(order.phone),
      order.email || "-",
      serviceLabel(order.service_key),
      formatDateService(order.date),
      order.meeting_point,
      order.suitcases,
      order.participants,
      order.total,
      STATUS_LABEL[order.status] ?? order.status,
      PAYMENT_LABEL[order.payment_status] ?? order.payment_status,
      formatPaymentMethod(order.payment_method),
      order.seal_code || "-",
      guideMap.get(order.guide_id ?? "") || order.guide_id || "-",
      order.admin_note || "-",
    ]);

    const today = new Date().toISOString().slice(0, 10);

    // 1. Format CSV (kompatibel Excel dengan titik-koma dan sep=;)
    if (format === "csv") {
      const csvHeader = headers.map(escapeCsv).join(";");
      const csvLines = dataRows.map((row) =>
        row
          .map((cell, idx) => {
            // Kolom no telepon diawali petik satu agar Excel membacanya sebagai teks
            if (idx === 3 && typeof cell === "string" && cell !== "-") {
              return escapeCsv(`'${cell}`);
            }
            return escapeCsv(cell);
          })
          .join(";"),
      );

      // \uFEFF BOM + sep=;\r\n memastikan Excel membuka dalam kolom terpisah secara otomatis
      const csvContent = `\uFEFFsep=;\r\n${csvHeader}\r\n${csvLines.join("\r\n")}`;
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="rekap-pesanan-unang-loja-${today}.csv"`,
        },
      });
    }

    // 2. Format Excel Asli (.xlsx) — Sangat rapi, kolom pas, dan format angka elegan
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // Atur lebar kolom (wch) agar teks tidak terpotong dan nyaman dipandang
    ws["!cols"] = [
      { wch: 20 }, // No. Resi
      { wch: 24 }, // Waktu Pesan (WIB)
      { wch: 28 }, // Nama Pelanggan
      { wch: 18 }, // No. WhatsApp
      { wch: 30 }, // Email
      { wch: 22 }, // Jenis Layanan
      { wch: 16 }, // Tanggal Layanan
      { wch: 24 }, // Titik Temu / Hotel
      { wch: 14 }, // Jumlah Koper
      { wch: 15 }, // Jumlah Peserta
      { wch: 20 }, // Total Biaya (Rp)
      { wch: 18 }, // Status Pesanan
      { wch: 24 }, // Status Pembayaran
      { wch: 18 }, // Metode Pembayaran
      { wch: 18 }, // Nomor Segel Koper
      { wch: 28 }, // Pemandu Wisata
      { wch: 32 }, // Catatan Admin
    ];

    // Format kolom Total Biaya (kolom K / indeks ke-10) menjadi format mata uang Excel
    for (let r = 1; r <= dataRows.length; r++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c: 10 });
      if (ws[cellAddress] && typeof ws[cellAddress].v === "number") {
        ws[cellAddress].z = '"Rp "#,##0';
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Rekap Pesanan");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="rekap-pesanan-unang-loja-${today}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("[admin:export]", error);
    return NextResponse.json({ error: "Gagal mengekspor data." }, { status: 500 });
  }
}
