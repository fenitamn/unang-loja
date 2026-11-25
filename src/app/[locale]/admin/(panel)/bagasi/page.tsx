import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/admin/AdminUI";
import Icon from "@/components/admin/Icon";
import LockerEditor from "@/components/admin/LockerEditor";
import OrderCard from "@/components/admin/OrderCard";
import { ACTIVE_STATUSES, formatDate, orderDetail, rupiah, serviceLabel } from "@/lib/admin-ui";
import { listGuides, listLockers, listOrders, lockerOccupancy, type OrderRecord } from "@/lib/store";

export default async function AdminLuggagePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);

  const [orders, lockers, guides] = await Promise.all([
    listOrders({ limit: 500 }).catch(() => [] as OrderRecord[]),
    listLockers().catch(() => []),
    listGuides().catch(() => []),
  ]);

  const luggageOrders = orders.filter(
    (order) =>
      order.service_key === "penitipan" ||
      order.service_key === "antarDekat" ||
      order.service_key === "antarLintas" ||
      order.add_ons.includes("penitipan"),
  );
  const active = luggageOrders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const withoutSeal = active.filter((order) => !order.seal_code);
  const suitcases = active.reduce((sum, order) => sum + Math.max(1, order.suitcases), 0);
  const capacity = lockers.reduce((sum, locker) => sum + locker.capacity, 0);
  const guideOptions = guides.map((guide) => ({ id: guide.id, name: guide.name }));
  const activeValue = active.reduce((sum, order) => sum + order.total, 0);
  const needle = q.trim().toUpperCase();
  const matches = needle
    ? luggageOrders.filter((order) =>
        [order.resi, order.name, order.phone, order.seal_code ?? ""].some((value) =>
          String(value).toUpperCase().includes(needle),
        ),
      )
    : luggageOrders;
  const visibleActive = matches.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const visibleCompleted = matches
    .filter((order) => !ACTIVE_STATUSES.includes(order.status))
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Operasional / Bagasi & Pelacakan"
        title="Kontrol Bagasi & Segel"
        subtitle="Manifest bagasi aktif, input segel 4-sisi, kapasitas loker, dan status perjalanan. Semua perubahan langsung tersimpan ke pesanan pelanggan."
      >
        <form action={`/${locale}/admin/bagasi`} method="get" className="flex items-center gap-2">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari resi / nama / segel…"
              className="w-52 rounded-lg border border-line bg-white px-8 py-2 text-[11px] outline-none focus:border-navy-700"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-navy-900 px-3 py-2 text-[10px] font-bold text-white hover:bg-navy-800"
          >
            Cari
          </button>
          {q && (
            <a
              href={`/${locale}/admin/bagasi`}
              className="text-[10px] font-bold text-ink-soft underline underline-offset-2"
            >
              Reset
            </a>
          )}
        </form>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-navy-100 bg-navy-900 p-4 text-white">
          <p className="text-[9px] font-bold uppercase tracking-wide text-navy-200">Pesanan bagasi aktif</p>
          <p className="mt-1 font-serif text-2xl font-bold">{active.length}</p>
          <p className="text-[9px] text-navy-200">dari {luggageOrders.length} pesanan bagasi</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Koper tercatat</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{suitcases}</p>
          <p className="text-[9px] text-ink-soft">estimasi isi loker aktif</p>
        </div>
        <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-gold-700">Belum disegel</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{withoutSeal.length}</p>
          <p className="text-[9px] text-ink-soft">perlu input kode segel</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Kapasitas loker</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{capacity}</p>
          <p className="text-[9px] text-ink-soft">{lockers.length} stasiun loker</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Nilai bagasi aktif</p>
          <p className="mt-1 font-serif text-xl font-bold text-navy-900">{rupiah(activeValue)}</p>
          <p className="text-[9px] text-ink-soft">total transaksi berjalan</p>
        </div>
      </div>

      {withoutSeal.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold text-gold-800">
            <Icon name="shield" className="h-4 w-4" />
            {withoutSeal.length} pesanan aktif belum memiliki kode segel. Buka detail pesanan untuk mencatat segel 4-sisi.
          </p>
          <a
            href="#manifest"
            className="rounded-lg bg-navy-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-navy-800"
          >
            Buka manifest
          </a>
        </div>
      )}

      <section>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-base font-bold text-navy-900">Stasiun Loker</h2>
            <p className="text-[10px] text-ink-soft">Kapasitas dan petugas penanggung jawab per pos.</p>
          </div>
          <span className="text-[10px] text-ink-soft">Perubahan langsung dipakai dashboard</span>
        </div>
        {lockers.length === 0 ? (
          <Panel>
            <EmptyState
              title="Data loker belum tersedia"
              description="Jalankan migrasi database untuk mengisi stasiun loker."
              icon="bag"
            />
          </Panel>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lockers.map((locker) => (
              <LockerEditor
                key={locker.id}
                locker={locker}
                occupied={lockerOccupancy(orders, locker.location)}
              />
            ))}
          </div>
        )}
      </section>

      <section id="manifest" className="scroll-mt-24">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-base font-bold text-navy-900">Manifest Bagasi Aktif</h2>
            <p className="text-[10px] text-ink-soft">
              {q ? `Hasil pencarian “${q}” · ` : ""}
              {visibleActive.length} pesanan aktif
            </p>
          </div>
          <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            Status diperbarui manual
          </span>
        </div>

        {visibleActive.length === 0 ? (
          <Panel>
            <EmptyState
              title={q ? "Tidak ada pesanan yang cocok" : "Tidak ada bagasi aktif"}
              description={
                q
                  ? "Coba kata kunci resi, nama pelanggan, nomor WhatsApp, atau kode segel lain."
                  : "Pesanan penitipan/antar bagasi yang masih berjalan akan tampil di sini."
              }
              icon="bag"
            />
          </Panel>
        ) : (
          <>
            <div className="mb-3 overflow-x-auto rounded-xl border border-line bg-white">
              <table className="w-full min-w-[760px] text-left text-[11px]">
                <thead className="bg-cream text-[9px] uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th className="px-3 py-2">Resi</th>
                    <th className="px-3 py-2">Pelanggan</th>
                    <th className="px-3 py-2">Layanan</th>
                    <th className="px-3 py-2">Jadwal</th>
                    <th className="px-3 py-2">Koper</th>
                    <th className="px-3 py-2">Segel</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visibleActive.map((order) => (
                    <tr key={order.id} className="hover:bg-cream/50">
                      <td className="px-3 py-2 font-mono text-[10px] font-bold text-navy-900">{order.resi}</td>
                      <td className="px-3 py-2">
                        <span className="font-semibold text-navy-900">{order.name}</span>
                        <span className="block text-[9px] text-ink-soft">{order.phone}</span>
                      </td>
                      <td className="px-3 py-2">{serviceLabel(order.service_key)}</td>
                      <td className="px-3 py-2">
                        {formatDate(order.date)}
                        <span className="block text-[9px] text-ink-soft">{orderDetail(order)}</span>
                      </td>
                      <td className="px-3 py-2 font-semibold">{order.suitcases}</td>
                      <td className="px-3 py-2">
                        {order.seal_code ? (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 font-mono text-[9px] font-bold text-green-700">
                            {order.seal_code}
                          </span>
                        ) : (
                          <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[9px] font-bold text-gold-700">
                            Belum
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <StatusPill status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3">
              {visibleActive.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  guides={guideOptions}
                  defaultOpen={!order.seal_code}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {visibleCompleted.length > 0 && (
        <Panel title="Riwayat bagasi terakhir" description="Pesanan bagasi yang sudah selesai atau dibatalkan.">
          <div className="divide-y divide-line">
            {visibleCompleted.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <div>
                  <p className="font-mono text-[10px] font-bold text-navy-900">{order.resi}</p>
                  <p className="text-[10px] text-ink-soft">
                    {order.name} · {order.suitcases} koper · {formatDate(order.date)}
                  </p>
                </div>
                <StatusPill status={order.status} />
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Panduan segel" description="Prosedur singkat petugas loker.">
        <ol className="grid gap-2 p-4 text-[11px] leading-relaxed text-ink sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Periksa isi koper bersama pemilik dan catat jumlahnya.",
            "Pasang pita segel 4-sisi: ritsleting, gagang, sisi belakang, dasar.",
            "Foto keempat sisi, lalu masukkan kode segel di form pesanan.",
            "Simpan kunci fisik di loker dan perbarui jumlah kunci.",
          ].map((step, index) => (
            <li key={step} className="rounded-lg border border-line bg-cream p-3">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-navy-900 text-[9px] font-bold text-white">
                {index + 1}
              </span>
              <p className="mt-1.5">{step}</p>
            </li>
          ))}
        </ol>
        <p className="border-t border-line px-4 py-2 text-[10px] text-ink-soft">
          Nilai bagasi aktif saat ini: {rupiah(activeValue)} ·{" "}
          <span className="inline-flex items-center gap-1">
            <Icon name="shield" className="h-3 w-3" /> Hanya staf berwenang
          </span>
        </p>
      </Panel>
    </div>
  );
}
