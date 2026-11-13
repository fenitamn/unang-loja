/**
 * Notifikasi WhatsApp ke admin — pakai Fonnte (https://fonnte.com).
 * Alternatif gratis; ganti implementasi ini jika pakai Wablas/WATTSI/Twilio.
 *
 * Env yang dibutuhkan:
 *   FONTE_TOKEN  — token device dari dashboard Fonnte (scan QR sekali saja)
 *   ADMIN_WA     — nomor WhatsApp admin, format 62xxx (tanpa + dan tanpa 0 di depan)
 */

const FONTE_TOKEN = process.env.FONTE_TOKEN ?? "";
const ADMIN_WA = process.env.ADMIN_WA ?? "";

export const isNotifyConfigured = () => Boolean(FONTE_TOKEN && ADMIN_WA);

export async function sendAdminWhatsApp(message: string): Promise<boolean> {
  if (!isNotifyConfigured()) {
    console.warn("[notify] FONTE_TOKEN/ADMIN_WA belum diset — pesan tidak terkirim:\n" + message);
    return false;
  }
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONTE_TOKEN,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ target: ADMIN_WA, message }),
    });
    const json = (await res.json()) as { status?: boolean | string };
    return Boolean(json.status);
  } catch (err) {
    console.error("[notify] gagal kirim WA:", err);
    return false;
  }
}

/** Format pesan WA untuk pesanan baru. */
export function formatNewOrderMessage(o: {
  resi: string;
  service: string;
  name: string;
  phone: string;
  date: string;
  meetingPoint: string;
  zone?: string | null;
  suitcases?: number;
  participants?: number;
  notes?: string | null;
  total?: number;
}): string {
  const waLink = o.phone ? `https://wa.me/${o.phone}` : "-";
  return [
    "🧳 *PESANAN BARU — UNANG LOJA*",
    "━━━━━━━━━━━━━━━━━━",
    `📄 Resi: *${o.resi}*`,
    `🛠 Layanan: ${o.service}`,
    `👤 Nama: ${o.name}`,
    `📱 WA Pemesan: ${waLink}`,
    `📅 Tanggal: ${o.date}`,
    `📍 Titik Jemput: ${o.meetingPoint}`,
    o.zone ? `🗺 Zona: ${o.zone}` : null,
    o.suitcases ? `🧳 Jumlah Koper: ${o.suitcases}` : null,
    o.participants ? `👥 Peserta: ${o.participants}` : null,
    o.total ? `💰 Total: Rp${o.total.toLocaleString("id-ID")}` : null,
    o.notes ? `📝 Catatan: ${o.notes}` : null,
    "━━━━━━━━━━━━━━━━━━",
    "✅ Buka dashboard untuk memproses: /id/admin",
  ]
    .filter(Boolean)
    .join("\n");
}
