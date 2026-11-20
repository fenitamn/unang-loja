import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel, PaymentPill } from "@/components/admin/AdminUI";
import OrderCard from "@/components/admin/OrderCard";
import { formatDateTime, paymentMethodLabel, rupiah, serviceLabel } from "@/lib/admin-ui";
import { listGuides, listOrders, type OrderRecord } from "@/lib/store";

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [orders, guides] = await Promise.all([
    listOrders({ limit: 500 }).catch(() => [] as OrderRecord[]),
    listGuides().catch(() => []),
  ]);

  const pending = orders.filter((order) => order.payment_status === "PENDING");
  const history = orders.filter((order) => order.payment_status !== "PENDING");
  const guideOptions = guides.map((guide) => ({ id: guide.id, name: guide.name }));
  const pendingValue = pending.reduce((sum, order) => sum + order.total, 0);
  const paidValue = orders
    .filter((order) => order.payment_status === "PAID")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / Payment Verification"
        title="Verifikasi Pembayaran"
        subtitle="Cocokkan bukti transfer dengan nominal pesanan sebelum mengubah status menjadi lunas. Pelanggan melihat hasilnya di akun mereka."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gold-700">Menunggu verifikasi</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{pending.length}</p>
          <p className="text-[10px] text-ink-soft">Nilai {rupiah(pendingValue)}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-green-700">Terverifikasi</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">
            {orders.filter((o) => o.payment_status === "PAID").length}
          </p>
          <p className="text-[10px] text-ink-soft">Nilai {rupiah(paidValue)}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Ditolak</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">
            {orders.filter((o) => o.payment_status === "REJECTED").length}
          </p>
          <p className="text-[10px] text-ink-soft">Perlu tindak lanjut pelanggan</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-serif text-base font-bold text-navy-900">Antrean verifikasi</h2>
        {pending.length === 0 ? (
          <Panel>
            <EmptyState
              title="Tidak ada pembayaran menunggu"
              description="Bukti pembayaran baru dari pelanggan akan muncul di sini."
              icon="card"
            />
          </Panel>
        ) : (
          <div className="space-y-3">
            {pending.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                guides={guideOptions}
                defaultOpen
                showProof
              />
            ))}
          </div>
        )}
      </div>

      <Panel title="Riwayat pembayaran" description="Status terverifikasi, ditolak, dan belum dibayar.">
        {history.length === 0 ? (
          <EmptyState title="Belum ada riwayat" icon="card" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
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
                {history.slice(0, 40).map((order) => (
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
        <div className="border-t border-line px-4 py-3 text-right">
          <Link href="/admin/pesanan" className="text-[10px] font-bold text-navy-800 underline underline-offset-2">
            Buka manajemen pesanan
          </Link>
        </div>
      </Panel>
    </div>
  );
}
