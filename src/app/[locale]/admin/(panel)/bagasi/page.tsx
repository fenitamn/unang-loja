import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel } from "@/components/admin/AdminUI";
import Icon from "@/components/admin/Icon";
import LockerEditor from "@/components/admin/LockerEditor";
import OrderCard from "@/components/admin/OrderCard";
import { ACTIVE_STATUSES, rupiah } from "@/lib/admin-ui";
import { listGuides, listLockers, listOrders, lockerOccupancy, type OrderRecord } from "@/lib/store";

export default async function AdminLuggagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / Luggage & Stalls"
        title="Bagasi, Loker & Segel"
        subtitle="Pantau kapasitas loker, catat kode segel 4-sisi, dan proses status bagasi. Okupansi dihitung dari pesanan aktif."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Koper aktif</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{suitcases}</p>
          <p className="text-[10px] text-ink-soft">{active.length} pesanan bagasi</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Kapasitas loker</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{capacity}</p>
          <p className="text-[10px] text-ink-soft">{lockers.length} stasiun loker</p>
        </div>
        <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gold-700">Belum disegel</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{withoutSeal.length}</p>
          <p className="text-[10px] text-ink-soft">Perlu input kode segel</p>
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-serif text-base font-bold text-navy-900">Stasiun Loker</h2>
          <span className="text-[10px] text-ink-soft">Perubahan kapasitas langsung dipakai dashboard</span>
        </div>
        {lockers.length === 0 ? (
          <Panel>
            <EmptyState title="Data loker belum tersedia" description="Jalankan migrasi database untuk mengisi 3 stasiun loker." icon="bag" />
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

      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-serif text-base font-bold text-navy-900">Bagasi aktif &amp; input segel</h2>
          <span className="text-[10px] text-ink-soft">{active.length} pesanan</span>
        </div>
        {active.length === 0 ? (
          <Panel>
            <EmptyState
              title="Tidak ada bagasi aktif"
              description="Pesanan penitipan/antar bagasi yang masih berjalan akan tampil di sini."
              icon="bag"
            />
          </Panel>
        ) : (
          <div className="space-y-3">
            {active.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                guides={guideOptions}
                defaultOpen={!order.seal_code}
              />
            ))}
          </div>
        )}
      </section>

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
          Nilai bagasi aktif saat ini: {rupiah(active.reduce((sum, order) => sum + order.total, 0))} ·{" "}
          <span className="inline-flex items-center gap-1">
            <Icon name="shield" className="h-3 w-3" /> Hanya staf berwenang
          </span>
        </p>
      </Panel>
    </div>
  );
}
