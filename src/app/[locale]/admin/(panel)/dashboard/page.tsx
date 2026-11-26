import { Link } from "@/i18n/navigation";
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
import { SERVICES } from "@/lib/data";
import {
  listGuides,
  listLockers,
  listOrders,
  listUsers,
  lockerOccupancy,
  type OrderRecord,
} from "@/lib/store";

const SERVICE_COLORS: Record<string, string> = {
  penitipan: "#1b365d",
  antarDekat: "#4c8a8f",
  antarLintas: "#c59b27",
  pemanduan: "#b83b3b",
  fleksibel: "#6b8db8",
  mystery: "#8f2626",
};

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

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayLabel = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const pending = orders.filter((o) => o.payment_status === "PENDING");
  const pendingValue = pending.reduce((sum, o) => sum + o.total, 0);
  const paidOrders = orders.filter((o) => o.payment_status === "PAID");
  const verifiedRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const activeGuides = guides.filter((g) => g.active);
  const customers = users.filter((u) => u.role === "customer");
  const todayOrders = orders.filter((o) => o.date === today);
  const newOrders = orders.filter((o) => o.status === "BARU");
  const activeLuggage = orders.filter(
    (o) =>
      ACTIVE_STATUSES.includes(o.status) &&
      (o.service_key === "penitipan" ||
        o.service_key === "antarDekat" ||
        o.service_key === "antarLintas" ||
        o.add_ons.includes("penitipan")),
  );
  const suitcaseCount = activeLuggage.reduce((sum, o) => sum + Math.max(1, o.suitcases), 0);
  const recent = orders.slice(0, 6);

  // Tren 7 hari dari data pesanan nyata.
  const daySeries = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - i));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString("id-ID", { weekday: "short" }),
      count: orders.filter((o) => o.created_at.slice(0, 10) === key).length,
    };
  });
  const maxSeries = Math.max(1, ...daySeries.map((item) => item.count));
  const chartWidth = 360;
  const chartHeight = 120;
  const pad = 10;
  const points = daySeries.map((item, i) => {
    const x = pad + (i * (chartWidth - pad * 2)) / (daySeries.length - 1);
    const y = chartHeight - pad - (item.count / maxSeries) * (chartHeight - pad * 2);
    return { ...item, x, y };
  });
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = `${pad},${chartHeight - pad} ${linePoints} ${chartWidth - pad},${chartHeight - pad}`;

  // Distribusi layanan dari data pesanan nyata.
  const distribution = SERVICES.map((service) => ({
    key: service.key,
    label: serviceLabel(service.key),
    count: orders.filter((o) => o.service_key === service.key).length,
    color: SERVICE_COLORS[service.key] ?? "#c59b27",
  })).filter((item) => item.count > 0);
  const distributionTotal = distribution.reduce((sum, item) => sum + item.count, 0);
  let donutAcc = 0;
  const donutGradient =
    distributionTotal > 0
      ? distribution
          .map((item) => {
            const start = (donutAcc / distributionTotal) * 360;
            donutAcc += item.count;
            const end = (donutAcc / distributionTotal) * 360;
            return `${item.color} ${start}deg ${end}deg`;
          })
          .join(", ")
      : "#e8dfcf 0deg 360deg";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-200 bg-gradient-to-r from-gold-50 via-white to-white px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold-400 opacity-40" />
            <Icon name="shield" className="relative h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-700">
              Siaga Satu · Operasional Dermaga
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">
              {pending.length > 0
                ? `${pending.length} pembayaran menunggu verifikasi (${rupiah(pendingValue)}). `
                : "Semua pembayaran tertangani. "}
              {activeLuggage.length} pesanan bagasi aktif · {suitcaseCount} koper tercatat ·{" "}
              {activeGuides.length} pemandu siap.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/pembayaran"
            className="rounded-lg bg-brand-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-brand-700"
          >
            Verifikasi Pembayaran
          </Link>
          <Link
            href="/admin/bagasi"
            className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-[10px] font-bold text-navy-800 hover:border-navy-700"
          >
            Kontrol Bagasi
          </Link>
        </div>
      </div>

      <PageHeader
        eyebrow="Overview / Ringkasan"
        title="Pusat Kendali Operasi Samosir"
        subtitle="Data nyata dari pesanan, pembayaran, loker, dan pemandu. Gunakan panel ini untuk menentukan prioritas shift."
      >
        <div className="rounded-lg border border-line bg-white px-3 py-2 text-right">
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Hari ini</p>
          <p className="text-[11px] font-bold text-navy-900">{todayLabel}</p>
          <p className="text-[9px] text-ink-soft">Shift operasional · 07:00–21:00 WIB</p>
        </div>
        <RefreshButton />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pesanan Hari Ini"
          value={todayOrders.length}
          note={`${orders.length} total pesanan · ${newOrders.length} baru`}
          icon="receipt"
          tone="navy"
        />
        <StatCard
          label="Pendapatan Terverifikasi"
          value={rupiah(verifiedRevenue)}
          note={`${paidOrders.length} pembayaran lunas`}
          icon="wallet"
          tone="green"
        />
        <StatCard
          label="Koper Aktif"
          value={suitcaseCount}
          note={`${activeLuggage.length} pesanan bagasi aktif`}
          icon="bag"
          tone="lake"
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={pending.length}
          note={`Nilai ${rupiah(pendingValue)}`}
          icon="card"
          tone="gold"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Kolom Kiri: Tren & Distribusi + Bagasi Aktif */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Tren Pemesanan 7 Hari" description="Jumlah pesanan masuk per hari.">
              <div className="p-4">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="font-serif text-2xl font-bold text-navy-900">
                      {daySeries.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                    <p className="text-[10px] text-ink-soft">pesanan dalam 7 hari</p>
                  </div>
                  <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-bold text-ink-soft">
                    Maks. {maxSeries}/hari
                  </span>
                </div>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="mt-3 h-28 w-full" aria-label="Grafik tren 7 hari">
                  <polygon points={areaPoints} fill="rgba(197,155,39,.16)" />
                  <polyline
                    points={linePoints}
                    fill="none"
                    stroke="#1b365d"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {points.map((point) => (
                    <g key={point.key}>
                      <circle cx={point.x} cy={point.y} r="3.5" fill="#fff" stroke="#c59b27" strokeWidth="2" />
                      <text
                        x={point.x}
                        y={point.y - 8}
                        textAnchor="middle"
                        fontSize="8"
                        fill="#1b365d"
                        fontWeight="700"
                      >
                        {point.count}
                      </text>
                    </g>
                  ))}
                </svg>
                <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[8px] font-bold uppercase tracking-wide text-ink-soft">
                  {daySeries.map((item) => (
                    <span key={item.key}>{item.label}</span>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="Distribusi Layanan" description="Komposisi layanan dari seluruh pesanan.">
              <div className="flex items-center gap-4 p-4">
                <div
                  className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
                  style={{ background: `conic-gradient(${donutGradient})` }}
                >
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center">
                    <span className="text-lg font-extrabold text-navy-900">{distributionTotal}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  {distribution.length === 0 ? (
                    <p className="text-[11px] text-ink-soft">Belum ada data layanan.</p>
                  ) : (
                    distribution.map((item) => (
                      <div key={item.key} className="flex items-center gap-2 text-[10px]">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: item.color }}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate text-ink">{item.label}</span>
                        <span className="font-bold text-navy-900">{item.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Panel>
          </div>
          <Panel
            title="Bagasi Aktif"
            description="Pesanan bagasi yang belum selesai."
            action={
              <Link href="/admin/bagasi" className="text-[10px] font-bold text-navy-800 underline underline-offset-2">
                Kontrol
              </Link>
            }
          >
            {activeLuggage.length === 0 ? (
              <EmptyState title="Tidak ada bagasi aktif" icon="bag" />
            ) : (
              <ul className="divide-y divide-line">
                {activeLuggage.slice(0, 5).map((order) => (
                  <li key={order.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-bold text-navy-900">{order.resi}</p>
                        <p className="truncate text-[11px] font-semibold text-navy-900">{order.name}</p>
                        <p className="truncate text-[9px] text-ink-soft">
                          {order.suitcases} koper · {orderDetail(order)}
                        </p>
                      </div>
                      <StatusPill status={order.status} />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[9px] text-ink-soft">
                        {order.seal_code ? `Segel ${order.seal_code}` : "Belum disegel"}
                      </span>
                      <Link
                        href={`/admin/bagasi?q=${encodeURIComponent(order.resi)}`}
                        className="text-[9px] font-bold text-brand-600 hover:underline"
                      >
                        Detail
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Kolom Kanan: Status Loker, Pemandu Siap, Aksi Cepat */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel
            title="Status Loker"
            description="Okupansi dari pesanan penitipan aktif."
            action={
              <Link href="/admin/bagasi" className="text-[10px] font-bold text-navy-800 underline underline-offset-2">
                Kelola
              </Link>
            }
          >
            <div className="space-y-3 p-4">
              {lockers.length === 0 ? (
                <p className="text-xs text-ink-soft">Data loker belum tersedia.</p>
              ) : (
                lockers.slice(0, 4).map((locker) => {
                  const occupied = lockerOccupancy(orders, locker.location);
                  const percent =
                    locker.capacity > 0 ? Math.round((occupied / locker.capacity) * 100) : 0;
                  return (
                    <div key={locker.id}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold text-navy-900">{locker.name}</p>
                        <span className="text-[9px] font-bold text-ink-soft">
                          {occupied}/{locker.capacity}
                        </span>
                      </div>
                      <p className="text-[9px] text-ink-soft">{locker.officer}</p>
                      <div className="mt-1.5">
                        <Progress
                          value={occupied}
                          max={locker.capacity}
                          tone={percent > 85 ? "bg-brand-600" : "bg-lake-500"}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
            <Panel
            title="Pemandu Siap"
            description={`${activeGuides.length} pemandu aktif dari ${guides.length} terdaftar.`}
            action={
              <Link href="/admin/pemandu" className="text-[10px] font-bold text-navy-800 underline underline-offset-2">
                Jadwal
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
            <div className="grid gap-2 p-4">
              {[
                { href: "/admin/pesanan", label: "Kelola Pesanan", icon: "receipt" as const },
                { href: "/admin/pembayaran", label: "Verifikasi Pembayaran", icon: "card" as const },
                { href: "/admin/bagasi", label: "Kontrol Bagasi & Segel", icon: "bag" as const },
                { href: "/admin/pelacakan", label: "Update Pelacakan", icon: "route" as const },
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
      </div>

      {/* Tabel Pesanan Terbaru Full Width */}
      <Panel
            title="Pesanan Terbaru"
            description="Pesanan yang masuk dari formulir pelanggan — bukan simulasi."
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
                <table className="w-full min-w-[720px] border-collapse">
                  <thead className="bg-cream">
                    <tr>
                      <Th>Resi &amp; Waktu</Th>
                      <Th>Pelanggan</Th>
                      <Th>Layanan</Th>
                      <Th>Jadwal</Th>
                      <Th>Total</Th>
                      <Th>Status</Th>
                      <Th>Pembayaran</Th>
                      <Th className="text-right">Aksi</Th>
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
                          <span className="max-w-[120px] truncate text-[9px] text-ink-soft">
                            {order.meeting_point}
                          </span>
                        </Td>
                        <Td className="font-semibold">{rupiah(order.total)}</Td>
                        <Td>
                          <StatusPill status={order.status} />
                        </Td>
                        <Td>
                          <PaymentPill status={order.payment_status} />
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          <Link
                            href={`/admin/pesanan?q=${encodeURIComponent(order.resi)}`}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-navy-900 px-3 py-1.5 text-[9px] font-bold text-white shadow-sm transition hover:bg-navy-800"
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

            <p className="text-[10px] text-ink-soft">
        {customers.length} pelanggan terdaftar · data operasional diperbarui saat halaman dimuat.
      </p>
    </div>
  );
}
