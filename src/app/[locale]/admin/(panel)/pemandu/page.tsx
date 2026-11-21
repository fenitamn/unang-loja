import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel } from "@/components/admin/AdminUI";
import GuideEditor from "@/components/admin/GuideEditor";
import { rupiah } from "@/lib/admin-ui";
import { listGuides } from "@/lib/store";

export default async function AdminGuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const guides = await listGuides().catch(() => []);
  const active = guides.filter((guide) => guide.active);
  const averageRating =
    guides.length > 0
      ? (guides.reduce((sum, guide) => sum + Number(guide.rating || 0), 0) / guides.length).toFixed(1)
      : "0.0";
  const averagePrice =
    active.length > 0
      ? Math.round(active.reduce((sum, guide) => sum + guide.price, 0) / active.length)
      : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / Tour Guides & Schedule"
        title="Pemandu Wisata & Jadwal"
        subtitle="Atur ketersediaan, tarif, kontak, dan jadwal pemandu. Pemandu nonaktif disembunyikan dari direktori pelanggan."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Pemandu aktif</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">
            {active.length}
            <span className="text-sm font-normal text-ink-soft"> / {guides.length}</span>
          </p>
          <p className="text-[10px] text-ink-soft">Tampil di direktori pelanggan</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Rating rata-rata</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">★ {averageRating}</p>
          <p className="text-[10px] text-ink-soft">{guides.reduce((sum, g) => sum + g.reviews, 0)} ulasan</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Tarif rata-rata</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{rupiah(averagePrice)}</p>
          <p className="text-[10px] text-ink-soft">Per sesi pemanduan</p>
        </div>
      </div>

      {guides.length === 0 ? (
        <Panel>
          <EmptyState
            title="Belum ada data pemandu"
            description="Jalankan supabase/schema-v2.sql untuk mengisi katalog awal, atau hubungkan Supabase."
            icon="users"
          />
        </Panel>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {guides.map((guide) => (
            <GuideEditor key={guide.id} guide={guide} />
          ))}
        </div>
      )}

      <Panel title="Catatan operasional" description="Bagaimana data ini dipakai.">
        <ul className="space-y-1.5 p-4 text-[11px] leading-relaxed text-ink-soft">
          <li>• Pemandu nonaktif tidak muncul di halaman Profil Pemandu untuk pelanggan.</li>
          <li>• Tarif pemandu dipakai pada kalkulator pemesanan saat pelanggan memilih pemandu.</li>
          <li>• Jadwal bersifat informatif untuk penugasan; penugasan per pesanan dilakukan di menu Pesanan.</li>
          <li>• Nomor WhatsApp pemandu hanya terlihat oleh admin.</li>
        </ul>
      </Panel>
    </div>
  );
}
