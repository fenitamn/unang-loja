import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Icon from "@/components/admin/Icon";
import {
  EmptyState,
  PageHeader,
  Panel,
  PaymentPill,
  Progress,
  StatCard,
  StatusPill,
  Td,
  Th,
} from "@/components/admin/AdminUI";
import RefreshButton from "@/components/admin/RefreshButton";
import {
  ACTIVE_STATUSES,
  formatDate,
  formatDateTime,
  orderDetail,
  rupiah,
  serviceLabel,
} from "@/lib/admin-ui";
import {
  listGuides,
  listLockers,
  listOrders,
  listUsers,
  lockerOccupancy,
  type OrderRecord,
} from "@/lib/store";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [orders, guides, lockers, users] = await Promise.all([
    listOrders({ limit: 500 }).catch(() => [] as OrderRecord[]),
    listGuides().catch(() => []),
    listLockers().catch(() => []),
    listUsers().catch(() => []),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const pending = orders.filter((o) => o.payment_status === "PENDING");
  const activeGuides = guides.filter((g) => g.active);
  const customers = users.filter((u) => u.role === "customer");
  const todayOrders = orders.filter((o) => o.date === today);
  const activeLuggage = orders.filter(
    (o) =>
      ACTIVE_STATUSES.includes(o.status) &&
      (o.service_key === "penitipan" || o.add_ons.includes("penitipan")),
  );
  const suitcaseCount = activeLuggage.reduce((sum, o) => sum + Math.max(1, o.suitcases), 0);
  const verifiedRevenue = orders
    .filter((o) => o.payment_status === "PAID")
    .reduce((sum, o) => sum + o.total, 0);
  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-200 bg-gradient-to-r from-gold-50 to-white px-4 py-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-500 text-navy-950">
            <Icon name="shield" className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-700">
              Siaga Satu · Operasional Dermaga
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">
              {pending.length > 0
                ? `${pending.length} pembayaran menunggu verifikasi. `
                : "Semua pembayaran tertangani. "}
              {activeLuggage.length} pesanan bagasi aktif · {activeGuides.length} pemandu siap bertugas.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/pembayaran"
            className="rounded-lg bg-navy-900 px-3 py-2 text-[10px] font-bold text-white hover:bg-navy-800"
          >
            Verifikasi Pembayaran
          </Link>
          <Link
            href="/admin/bagasi"
            className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-[10px] font-bold text-navy-800 hover:border-navy-700"
          >
            Input Segel Baru
          </Link>
        </div>
      </div>

      <PageHeader
        eyebrow="Admin / Overview"
        title="Pusat Kendali Operasi Dermaga & Reservasi Wisata"
        subtitle="Pantau pesanan, pembayaran, kapasitas loker, dan jadwal pemandu dari data transaksi nyata."
      >
        <div className="rounded-lg border border-line bg-white px-3 py-2 text-right">
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Hari ini</p>
          <p className="text-[11px] font-bold text-navy-900">{todayLabel}</p>
          <p className="text-[9px] text-ink-soft">Shift operasional · 07:00–21:00 WIB</p>
        </div>
        <RefreshButton />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Pemandu Aktif"
          value={activeGuides.length}
          note={`${guides.length} total terdaftar`}
          icon="users"
          tone="navy"
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={pending.length}
          note={`${orders.filter((o) => o.payment_status === "PAID").length} pembayaran terverifikasi`}
          icon="card"
          tone="gold"
        />
        <StatCard
          label="Koper di Loker"
          value={suitcaseCount}
          note={`${activeLuggage.length} pesanan bagasi aktif`}
          icon="bag"
          tone="brand"
        />
        <StatCard
          label="Pesanan Hari Ini"
          value={todayOrders.length}
          note={`${orders.length} pesanan tercatat`}
          icon="receipt"
          tone="lake"
        />
        <StatCard
          label="Pelanggan"
          value={customers.length}
          note={`Pendapatan terverifikasi ${rupiah(verifiedRevenue)}`}
          icon="users"
          tone="green"
        />
      </div>

      <Panel
        title="Papan Pantau Pesanan Terkini"
        description="Data real-time dari pesanan yang masuk — bukan simulasi."
        action={
          <Link
            href="/admin/pesanan"
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-bold text-navy-800 hover:border-navy-300"
          >
            Semua pesanan <Icon name="external" className="h-3 w-3" />
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            title="Belum ada pesanan"
            description="Pesanan akan muncul di sini setelah pelanggan mengirim formulir pemesanan."
            icon="receipt"
          >
            <Link
              href="/pesan"
              className="rounded-lg bg-brand-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-brand-700"
            >
              Buka formulir pemesanan
            </Link>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="bg-cream">
                <tr>
                  <Th>Resi &amp; Waktu</Th>
                  <Th>Pelanggan</Th>
                  <Th>Layanan</Th>
                  <Th>Jadwal</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Pembayaran</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/60">
                    <Td>
                      <span className="font-mono text-[10px] font-bold text-navy-900">{order.resi}</span>
                      <span className="mt-0.5 block text-[9px] text-ink-soft">
                        {formatDateTime(order.created_at)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-semibold text-navy-900">{order.name}</span>
                      <span className="mt-0.5 block text-[9px] text-ink-soft">{order.phone}</span>
                    </Td>
                    <Td>
                      <span className="block">{serviceLabel(order.service_key)}</span>
                      <span className="text-[9px] text-ink-soft">{orderDetail(order)}</span>
                    </Td>
                    <Td>
                      <span className="block">{formatDate(order.date)}</span>
                      <span className="text-[9px] text-ink-soft">{order.meeting_point}</span>
                    </Td>
                    <Td className="font-semibold">{rupiah(order.total)}</Td>
                    <Td>
                      <StatusPill status={order.status} />
                    </Td>
                    <Td>
                      <PaymentPill status={order.payment_status} />
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/pesanan?q=${encodeURIComponent(order.resi)}`}
                        className="rounded-lg bg-navy-900 px-2.5 py-1.5 text-[9px] font-bold text-white hover:bg-navy-800"
                      >
                        Kelola
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Status Kapasitas Loker"
          description="Okupansi dihitung dari pesanan penitipan aktif."
          action={
            <Link href="/admin/bagasi" className="text-[10px] font-bold text-navy-800 underline underline-offset-2">
              Kelola
            </Link>
          }
        >
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {lockers.length === 0 ? (
              <p className="text-xs text-ink-soft">Data loker belum tersedia.</p>
            ) : (
              lockers.map((locker) => {
                const occupied = lockerOccupancy(orders, locker.location);
                const percent = locker.capacity > 0 ? Math.round((occupied / locker.capacity) * 100) : 0;
                return (
                  <div key={locker.id} className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold text-navy-900">{locker.name}</p>
                      <span className="text-[9px] font-bold text-ink-soft">{percent}%</span>
                    </div>
                    <p className="text-[9px] text-ink-soft">{locker.officer}</p>
                    <div className="mt-2">
                      <Progress
                        value={occupied}
                        max={locker.capacity}
                        tone={percent > 85 ? "bg-brand-600" : "bg-lake-500"}
                      />
                    </div>
                    <p className="mt-1 text-[9px] text-ink-soft">
                      {occupied}/{locker.capacity} slot · {locker.keys} kunci
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Panel>

        <Panel
          title="Jadwal Pemandu Hari Ini"
          description="Pemandu aktif dari katalog. Atur tarif & jadwal di menu pemandu."
          action={
            <Link href="/admin/pemandu" className="text-[10px] font-bold text-navy-800 underline underline-offset-2">
              Kelola
            </Link>
          }
        >
          {activeGuides.length === 0 ? (
            <EmptyState title="Belum ada pemandu aktif" icon="users" />
          ) : (
            <ul className="divide-y divide-line">
              {activeGuides.slice(0, 4).map((guide) => (
                <li key={guide.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-navy-900">{guide.name}</p>
                    <p className="truncate text-[9px] text-ink-soft">
                      {guide.specialty} · {guide.license}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold text-navy-800">{guide.schedule}</p>
                    <p className="text-[9px] text-ink-soft">{rupiah(guide.price)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Aksi Cepat" description="Pintasan operasional harian.">
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/pesanan", label: "Kelola Pesanan", icon: "receipt" as const },
            { href: "/admin/pembayaran", label: "Verifikasi Pembayaran", icon: "card" as const },
            { href: "/admin/pelacakan", label: "Update Pelacakan", icon: "route" as const },
            { href: "/admin/ulasan", label: "Moderasi Ulasan", icon: "star" as const },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg border border-line bg-cream px-3 py-2.5 text-[11px] font-bold text-navy-900 hover:border-gold-500 hover:bg-white"
            >
              <Icon name={item.icon} className="h-4 w-4 text-gold-600" />
              {item.label}
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
