import { setRequestLocale } from "next-intl/server";
import { PageHeader, Panel } from "@/components/admin/AdminUI";
import { ServiceToggle } from "@/components/admin/CatalogToggles";
import type { ServiceKey } from "@/lib/data";
import { listServices } from "@/lib/store";

const META: Record<ServiceKey, { label: string; emoji: string }> = {
  pemanduan: { label: "Pemanduan Wisata", emoji: "🧭" },
  penitipan: { label: "Penitipan Koper", emoji: "🧳" },
  antarDekat: { label: "Antar Bagasi — Zona Dekat", emoji: "🛺" },
  antarLintas: { label: "Antar Bagasi — Lintas", emoji: "🚗" },
  fleksibel: { label: "Jelajah Fleksibel", emoji: "🌊" },
  mystery: { label: "Mystery Tour", emoji: "🎁" },
};

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const services = await listServices().catch(() => []);
  const active = services.filter((service) => service.active);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / Services"
        title="Ketersediaan Layanan"
        subtitle="Aktifkan atau sembunyikan layanan dari formulir pemesanan. Tarif mengikuti ketetapan resmi UNANG LOJA."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Layanan aktif</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">
            {active.length}
            <span className="text-sm font-normal text-ink-soft"> / {services.length}</span>
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Nonaktif</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">
            {services.length - active.length}
          </p>
        </div>
        <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gold-700">Tarif resmi</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink">
            Penitipan Rp25.000/koper/hari · Antar dekat Rp75.000 · Lintas Rp150.000 · Pemanduan
            Rp300.000 · Paket Rp350.000.
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {services.map((service) => {
          const meta = META[service.key as ServiceKey];
          if (!meta) return null;
          return (
            <ServiceToggle
              key={service.key}
              serviceKey={service.key as ServiceKey}
              active={service.active}
              label={meta.label}
              emoji={meta.emoji}
            />
          );
        })}
      </div>

      <Panel title="Catatan" description="Perubahan berlaku pada pemesanan berikutnya.">
        <p className="p-4 text-[11px] leading-relaxed text-ink-soft">
          Layanan nonaktif tidak dapat dipilih pada formulir pemesanan, tetapi pesanan lama tetap
          tersimpan dan dapat diproses admin. Tarif dasar sengaja dikunci agar sesuai ketetapan
          operasional; hubungi pengembang bila perlu perubahan harga resmi.
        </p>
      </Panel>
    </div>
  );
}
