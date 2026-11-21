import { setRequestLocale } from "next-intl/server";
import { EmptyState, PageHeader, Panel } from "@/components/admin/AdminUI";
import { PublishToggle } from "@/components/admin/CatalogToggles";
import { formatDateTime } from "@/lib/admin-ui";
import { listReviews } from "@/lib/store";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const reviews = await listReviews().catch(() => []);
  const published = reviews.filter((review) => review.published);
  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin / Customer Reviews"
        title="Moderasi Ulasan Pelanggan"
        subtitle="Ulasan dikirim pelanggan dari akun setelah pesanan selesai. Hanya ulasan yang ditampilkan yang dipublikasikan."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Total ulasan</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{reviews.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Terpublikasi</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">{published.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Rating rata-rata</p>
          <p className="mt-1 font-serif text-2xl font-bold text-navy-900">★ {average}</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <Panel>
          <EmptyState
            title="Belum ada ulasan"
            description="Setelah pesanan selesai, pelanggan dapat mengirim ulasan dari halaman detail pesanan di akun mereka."
            icon="star"
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-serif text-sm font-bold text-navy-900">{review.name}</p>
                    <span className="rounded-full border border-line bg-cream px-2 py-0.5 font-mono text-[9px] text-ink-soft">
                      {review.order_resi ?? "tanpa resi"}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                        review.published
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-gold-300 bg-gold-50 text-gold-700"
                      }`}
                    >
                      {review.published ? "Terpublikasi" : "Menunggu moderasi"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-gold-600" aria-label={`Rating ${review.rating} dari 5`}>
                    {"★".repeat(review.rating)}
                    <span className="text-line">{"★".repeat(5 - review.rating)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-ink-soft">{formatDateTime(review.created_at)}</span>
                  <PublishToggle id={review.id} published={review.published} />
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink">{review.comment}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
