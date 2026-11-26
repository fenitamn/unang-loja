import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel } from "@/components/admin/AdminUI";
import Icon from "@/components/admin/Icon";
import OrderCard from "@/components/admin/OrderCard";
import { listGuides, listOrders, type OrderRecord } from "@/lib/store";

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; payment?: string }>;
}) {
  const { locale } = await params;
  const { q = "", status = "", payment = "" } = await searchParams;
  setRequestLocale(locale);

  const [orders, guides] = await Promise.all([
    listOrders({ limit: 500 }).catch(() => [] as OrderRecord[]),
    listGuides().catch(() => []),
  ]);

  const needle = q.trim().toLowerCase();
  const filtered = orders.filter((order) => {
    const matchQ =
      !needle ||
      order.resi.toLowerCase().includes(needle) ||
      order.name.toLowerCase().includes(needle) ||
      order.phone.includes(needle) ||
      order.meeting_point.toLowerCase().includes(needle);
    const matchStatus = !status || order.status === status;
    const matchPayment = !payment || order.payment_status === payment;
    return matchQ && matchStatus && matchPayment;
  });

  const guideOptions = guides.map((guide) => ({ id: guide.id, name: guide.name }));
  const hasFilter = Boolean(q || status || payment);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / Booking Management"
        title="Manajemen Pemesanan"
        subtitle="Cari, filter, dan proses pesanan pelanggan. Perubahan status langsung terlihat di akun pelanggan dan halaman lacak."
      >
        <Link
          href="/api/admin/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-2 text-[10px] font-bold text-navy-800 hover:border-navy-300"
        >
          <Icon name="external" className="h-3.5 w-3.5" /> Ekspor CSV
        </Link>
      </PageHeader>

      <Panel>
        <form method="get" className="grid gap-2 p-4 sm:grid-cols-[1fr_170px_190px_auto]">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari resi, nama, WhatsApp, titik temu…"
              className="w-full rounded-lg border border-line bg-white py-2 pl-8 pr-3 text-[11px] outline-none focus:border-navy-700"
            />
          </div>
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] outline-none focus:border-navy-700"
          >
            <option value="">Semua status</option>
            <option value="BARU">Baru</option>
            <option value="DIKONFIRMASI">Dikonfirmasi</option>
            <option value="DITUGASKAN">Ditugaskan</option>
            <option value="DIJEMPUT">Dijemput / Proses</option>
            <option value="SELESAI">Selesai</option>
            <option value="BATAL">Batal</option>
          </select>
          <select
            name="payment"
            defaultValue={payment}
            className="rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] outline-none focus:border-navy-700"
          >
            <option value="">Semua pembayaran</option>
            <option value="UNPAID">Belum dibayar</option>
            <option value="PENDING">Menunggu verifikasi</option>
            <option value="PAID">Lunas / terverifikasi</option>
            <option value="REJECTED">Ditolak</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-navy-900 px-3 py-2 text-[10px] font-bold text-white hover:bg-navy-800"
            >
              Terapkan
            </button>
            {hasFilter && (
              <Link
                href="/admin/pesanan"
                className="rounded-lg border border-line px-3 py-2 text-[10px] font-bold text-ink-soft hover:border-navy-300"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </Panel>

      <div className="flex items-center justify-between px-1 text-[11px] text-ink-soft">
        <span>
          Menampilkan <strong className="text-navy-900">{filtered.length}</strong> dari {orders.length}{" "}
          pesanan
        </span>
        {hasFilter && <span>Filter aktif</span>}
      </div>

      {filtered.length === 0 ? (
        <Panel>
          <EmptyState
            title={hasFilter ? "Tidak ada pesanan yang cocok" : "Belum ada pesanan"}
            description={
              hasFilter
                ? "Ubah kata kunci atau reset filter untuk melihat semua pesanan."
                : "Pesanan dari pelanggan akan masuk otomatis ke halaman ini."
            }
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              guides={guideOptions}
              defaultOpen={Boolean(q || filtered.length === 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
