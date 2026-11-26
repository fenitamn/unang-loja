import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/admin/AdminUI";
import OrderCard from "@/components/admin/OrderCard";
import { formatDate, orderDetail, serviceLabel } from "@/lib/admin-ui";
import { listGuides, listOrders, type OrderRecord } from "@/lib/store";

const STEPS = ["Diterima", "Dikonfirmasi", "Ditugaskan", "Dijemput / Proses", "Selesai"];

const STEP_OF: Record<string, number> = {
  BARU: 0,
  DIKONFIRMASI: 1,
  DITUGASKAN: 2,
  DIJEMPUT: 3,
  SELESAI: 4,
  BATAL: 0,
};

export default async function AdminTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);

  const [orders, guides] = await Promise.all([
    listOrders({ limit: 500 }).catch(() => [] as OrderRecord[]),
    listGuides().catch(() => []),
  ]);

  const needle = q.trim().toLowerCase();
  const matches = needle
    ? orders.filter(
        (order) =>
          order.resi.toLowerCase().includes(needle) ||
          order.name.toLowerCase().includes(needle) ||
          order.seal_code?.toLowerCase().includes(needle),
      )
    : orders.slice(0, 8);

  const guideOptions = guides.map((guide) => ({ id: guide.id, name: guide.name }));

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / Tracking Management"
        title="Pelacakan & Pembaruan Status"
        subtitle="Cari pesanan berdasarkan resi, nama, atau kode segel. Status yang diperbarui langsung tampil di halaman lacak pelanggan."
      />

      <Panel>
        <form method="get" className="flex flex-col gap-2 p-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder="Contoh: UL-20261119-1234, nama pelanggan, atau SLG-1234"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[11px] outline-none focus:border-navy-700"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-navy-900 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-navy-800"
          >
            Lacak
          </button>
          {q && (
            <Link
              href="/admin/pelacakan"
              className="rounded-lg border border-line px-3 py-2.5 text-center text-[10px] font-bold text-ink-soft hover:border-navy-300"
            >
              Reset
            </Link>
          )}
        </form>
      </Panel>

      <div className="flex items-center justify-between px-1 text-[11px] text-ink-soft">
        <span>
          {needle ? (
            <>
              Hasil untuk <strong className="text-navy-900">{q}</strong>: {matches.length}
            </>
          ) : (
            <>Menampilkan {matches.length} pesanan terbaru</>
          )}
        </span>
        <Link href="/admin/bagasi" className="font-bold text-navy-800 underline underline-offset-2">
          Input segel
        </Link>
      </div>

      {matches.length === 0 ? (
        <Panel>
          <EmptyState
            title="Pesanan tidak ditemukan"
            description="Periksa kembali resi atau nama pelanggan."
            icon="route"
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {matches.map((order) => {
            const step = STEP_OF[order.status] ?? 0;
            return (
              <div key={order.id} className="space-y-2">
                <OrderCard order={order} guides={guideOptions} defaultOpen />
                <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                      Linimasa status
                    </p>
                    <p className="text-[10px] text-ink-soft">
                      {serviceLabel(order.service_key)} · {orderDetail(order)} · {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    {STEPS.map((label, index) => {
                      const done = order.status !== "BATAL" && index <= step;
                      return (
                        <div key={label} className="flex items-center gap-2 sm:flex-col sm:items-start">
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[8px] font-bold ${
                              done ? "bg-navy-900 text-white" : "bg-cream-deep text-ink-soft"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span
                            className={`text-[9px] font-semibold ${
                              done ? "text-navy-900" : "text-ink-soft"
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {order.status === "BATAL" && (
                    <p className="mt-2 text-[10px] font-bold text-brand-700">Pesanan dibatalkan.</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-ink-soft">
                    <StatusPill status={order.status} />
                    {order.seal_code ? (
                      <span className="font-mono text-brand-700">Segel {order.seal_code}</span>
                    ) : (
                      <span className="text-gold-700">Segel belum diinput</span>
                    )}
                    {order.guide_id && (
                      <span>Pemandu: {guides.find((g) => g.id === order.guide_id)?.name ?? "-"}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
