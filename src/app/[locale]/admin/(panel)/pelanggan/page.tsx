import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel, Td, Th } from "@/components/admin/AdminUI";
import { formatDate, rupiah } from "@/lib/admin-ui";
import { listOrders, listUsers, type OrderRecord } from "@/lib/store";

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [users, orders] = await Promise.all([
    listUsers().catch(() => []),
    listOrders({ limit: 1000 }).catch(() => [] as OrderRecord[]),
  ]);

  const customers = users.filter((user) => user.role === "customer");
  const guestOrders = orders.filter((order) => !order.customer_id);
  const withStats = customers.map((customer) => {
    const mine = orders.filter((order) => order.customer_id === customer.id);
    const paid = mine.filter((order) => order.payment_status === "PAID");
    return {
      ...customer,
      orderCount: mine.length,
      paidCount: paid.length,
      spend: paid.reduce((sum, order) => sum + order.total, 0),
      lastOrder: mine[0]?.created_at ?? null,
    };
  });

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / Customers"
        title="Data Pelanggan"
        subtitle="Akun pelanggan terdaftar beserta riwayat transaksi terverifikasi. Pesanan tamu tetap tercatat dan bisa diproses."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Akun pelanggan</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Pesanan tamu</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{guestOrders.length}</p>
          <p className="text-[10px] text-ink-soft">Tanpa akun — tetap diproses admin</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Pendapatan terverifikasi</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">
            {rupiah(
              orders
                .filter((order) => order.payment_status === "PAID")
                .reduce((sum, order) => sum + order.total, 0),
            )}
          </p>
        </div>
      </div>

      <Panel
        title="Daftar akun pelanggan"
        description="Data kontak dipakai untuk menghubungi pelanggan terkait pesanan."
      >
        {withStats.length === 0 ? (
          <EmptyState
            title="Belum ada pelanggan terdaftar"
            description="Pelanggan yang mendaftar lewat halaman Daftar akan muncul di sini."
            icon="users"
          >
            <Link
              href="/daftar"
              className="rounded-lg border border-line bg-white px-3 py-2 text-[10px] font-bold text-navy-800 hover:border-navy-300"
            >
              Buka halaman daftar
            </Link>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-cream">
                <tr>
                  <Th>Pelanggan</Th>
                  <Th>Kontak</Th>
                  <Th>Pesanan</Th>
                  <Th>Lunas</Th>
                  <Th>Total transaksi</Th>
                  <Th>Terakhir pesan</Th>
                  <Th>Bergabung</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {withStats.map((customer) => (
                  <tr key={customer.id} className="hover:bg-cream/60">
                    <Td>
                      <span className="font-semibold text-navy-900">{customer.name}</span>
                      <span className="mt-0.5 block font-mono text-[9px] text-ink-soft">
                        {customer.id.slice(0, 8)}
                      </span>
                    </Td>
                    <Td>
                      <span className="block">{customer.email}</span>
                      <span className="text-[9px] text-ink-soft">{customer.phone || "—"}</span>
                    </Td>
                    <Td>{customer.orderCount}</Td>
                    <Td>{customer.paidCount}</Td>
                    <Td className="font-semibold">{rupiah(customer.spend)}</Td>
                    <Td>{customer.lastOrder ? formatDate(customer.lastOrder) : "—"}</Td>
                    <Td className="text-[10px] text-ink-soft">{formatDate(customer.created_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="px-1 text-[10px] leading-relaxed text-ink-soft">
        Catatan: penghapusan akun pelanggan belum disediakan agar riwayat transaksi tetap utuh.
        Untuk permintaan penghapusan data, proses manual sesuai kebijakan privasi.
      </p>
    </div>
  );
}
