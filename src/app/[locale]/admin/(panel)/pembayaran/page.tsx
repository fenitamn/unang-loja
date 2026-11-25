import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel, PaymentPill } from "@/components/admin/AdminUI";
import Icon from "@/components/admin/Icon";
import OrderCard from "@/components/admin/OrderCard";
import {
  formatDateTime,
  paymentMethodLabel,
  rupiah,
  serviceLabel,
} from "@/lib/admin-ui";
import { listGuides, listOrders, type OrderRecord } from "@/lib/store";

const TABS = [
  { key: "PENDING", label: "Menunggu" },
  { key: "PAID", label: "Terverifikasi" },
  { key: "REJECTED", label: "Ditolak" },
  { key: "ALL", label: "Semua" },
] as const;

export default async function AdminPaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status = "PENDING" } = await searchParams;
  setRequestLocale(locale);

  const [orders, guides] = await Promise.all([
    listOrders({ limit: 500 }).catch(() => [] as OrderRecord[]),
    listGuides().catch(() => []),
  ]);

  const pending = orders.filter((order) => order.payment_status === "PENDING");
  const paid = orders.filter((order) => order.payment_status === "PAID");
  const rejected = orders.filter((order) => order.payment_status === "REJECTED");
  const guideOptions = guides.map((guide) => ({ id: guide.id, name: guide.name }));
  const pendingValue = pending.reduce((sum, order) => sum + order.total, 0);
  const paidValue = paid.reduce((sum, order) => sum + order.total, 0);
  const activeTab = TABS.some((tab) => tab.key === status) ? status : "PENDING";
  const queue = activeTab === "PENDING" ? pending : [];
  const history =
    activeTab === "PAID"
      ? paid
      : activeTab === "REJECTED"
        ? rejected
        : activeTab === "ALL"
          ? orders
          : orders.filter((order) => order.payment_status !== "PENDING");
  const firstPending = pending[0];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Keuangan / Verifikasi Pembayaran"
        title="Verifikasi Pembayaran & Booking"
        subtitle="Cocokkan bukti transfer dengan nominal pesanan sebelum mengubah status menjadi lunas. Perubahan langsung terlihat di akun pelanggan dan halaman lacak."
      >
        <a
          href="/api/admin/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[10px] font-bold text-navy-800 hover:border-gold-500 hover:text-gold-700"
        >
          <Icon name="external" className="h-3.5 w-3.5" /> Ekspor CSV
        </a>
      </PageHeader>

      {firstPending && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-200 bg-gradient-to-r from-gold-50 to-white px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-500 text-navy-950">
              <Icon name="card" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-700">
                Perlu tindakan · {pending.length} antrean
              </p>
              <p className="mt-0.5 text-[11px] text-ink-soft">
                Terlama: <span className="font-mono font-bold text-navy-900">{firstPending.resi}</span> ·{" "}
                {firstPending.name} · {rupiah(firstPending.total)} ·{" "}
                {paymentMethodLabel(firstPending.payment_method)}
              </p>
            </div>
          </div>
          <a
            href="#antrean"
            className="rounded-lg bg-brand-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-brand-700"
          >
            Buka antrean verifikasi
          </a>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-gold-700">Menunggu verifikasi</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{pending.length}</p>
          <p className="text-[10px] text-ink-soft">Nilai {rupiah(pendingValue)}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-green-700">Terverifikasi</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{paid.length}</p>
          <p className="text-[10px] text-ink-soft">Nilai {rupiah(paidValue)}</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-brand-700">Ditolak</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{rejected.length}</p>
          <p className="text-[10px] text-ink-soft">Perlu tindak lanjut pelanggan</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Total transaksi</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{orders.length}</p>
          <p className="text-[10px] text-ink-soft">
            {orders.filter((order) => order.payment_status === "UNPAID").length} belum dibayar
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white p-1.5">
        {TABS.map((tab) => {
          const count =
            tab.key === "PENDING"
              ? pending.length
              : tab.key === "PAID"
                ? paid.length
                : tab.key === "REJECTED"
                  ? rejected.length
                  : orders.length;
          return (
            <Link
              key={tab.key}
              href={`/${locale}/admin/pembayaran?status=${tab.key}`}
              className={`rounded-lg px-3 py-2 text-[10px] font-bold transition ${
                activeTab === tab.key
                  ? "bg-navy-900 text-white"
                  : "text-ink-soft hover:bg-cream hover:text-navy-900"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[8px] ${
                  activeTab === tab.key ? "bg-gold-500 text-navy-950" : "bg-cream text-ink-soft"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <section id="antrean" className="scroll-mt-24">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-base font-bold text-navy-900">Antrean verifikasi</h2>
            <p className="text-[10px] text-ink-soft">
              Buka bukti, cocokkan nominal, lalu terima atau tolak. Tindakan dicatat pada pesanan.
            </p>
          </div>
          <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            {queue.length} menunggu
          </span>
        </div>

        {queue.length === 0 ? (
          <Panel>
            <EmptyState
              title="Tidak ada pembayaran menunggu"
              description="Bukti pembayaran baru dari pelanggan akan muncul di sini."
              icon="card"
            />
          </Panel>
        ) : (
          <div className="space-y-4">
            {queue.map((order, index) => (
              <div key={order.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold-200 bg-gold-50 px-4 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy-950">
                      Antrean {index + 1}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-navy-900">{order.resi}</span>
                    <span className="text-[10px] text-ink-soft">
                      {order.payment_proof ? "Bukti terunggah" : "Bukti belum ada"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] text-ink-soft">
                    <span>Nominal {rupiah(order.total)}</span>
                    <span>·</span>
                    <span>{paymentMethodLabel(order.payment_method)}</span>
                    <span>·</span>
                    <span>Masuk {formatDateTime(order.created_at)}</span>
                  </div>
                </div>
                <OrderCard
                  order={order}
                  guides={guideOptions}
                  defaultOpen
                  showProof
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <Panel
        title={activeTab === "ALL" ? "Semua transaksi" : "Riwayat pembayaran"}
        description="Status terverifikasi, ditolak, dan belum dibayar."
      >
        {history.length === 0 ? (
          <EmptyState title="Belum ada riwayat" icon="card" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-cream">
                <tr className="text-left text-[9px] uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-2.5">Resi</th>
                  <th className="px-3 py-2.5">Pelanggan</th>
                  <th className="px-3 py-2.5">Layanan</th>
                  <th className="px-3 py-2.5">Metode</th>
                  <th className="px-3 py-2.5">Total</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {history.slice(0, 60).map((order) => (
                  <tr key={order.id} className="text-xs hover:bg-cream/60">
                    <td className="px-4 py-2.5 font-mono text-[10px] font-bold text-navy-900">
                      {order.resi}
                    </td>
                    <td className="px-3 py-2.5">{order.name}</td>
                    <td className="px-3 py-2.5">{serviceLabel(order.service_key)}</td>
                    <td className="px-3 py-2.5">{paymentMethodLabel(order.payment_method)}</td>
                    <td className="px-3 py-2.5 font-semibold">{rupiah(order.total)}</td>
                    <td className="px-3 py-2.5">
                      <PaymentPill status={order.payment_status} />
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-ink-soft">
                      {formatDateTime(order.verified_at ?? order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
          <p className="text-[10px] text-ink-soft">
            {history.length} transaksi ditampilkan · ekspor CSV tersedia di atas.
          </p>
          <Link
            href="/admin/pesanan"
            className="text-[10px] font-bold text-navy-800 underline underline-offset-2"
          >
            Buka manajemen pesanan
          </Link>
        </div>
      </Panel>
    </div>
  );
}
