import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Icon from "@/components/admin/Icon";
import ProofUpload from "@/components/ProofUpload";
import ReviewForm from "@/components/ReviewForm";
import {
  PAYMENT_STYLE,
  STATUS_STYLE,
  formatDate,
  formatDateTime,
  paymentMethodLabel,
  rupiah,
  serviceLabel,
  statusProgress,
} from "@/lib/admin-ui";
import { requireCustomerPage } from "@/lib/auth";
import { getOrderByResi, listGuides, listReviews, updateOrder } from "@/lib/store";

const STATUS_KEY = {
  BARU: "status.BARU",
  DIKONFIRMASI: "status.DIKONFIRMASI",
  DITUGASKAN: "status.DITUGASKAN",
  DIJEMPUT: "status.DIJEMPUT",
  SELESAI: "status.SELESAI",
  BATAL: "status.BATAL",
} as const;

const PAY_KEY = {
  UNPAID: "payment.UNPAID",
  PENDING: "payment.PENDING",
  PAID: "payment.PAID",
  REJECTED: "payment.REJECTED",
} as const;

const STEPS = ["Diterima", "Dikonfirmasi", "Ditugaskan", "Dijemput", "Selesai"];

export default async function AccountOrderPage({
  params,
}: {
  params: Promise<{ locale: string; resi: string }>;
}) {
  const { locale, resi } = await params;
  setRequestLocale(locale);
  const user = await requireCustomerPage(locale, `/${locale}/akun/pesanan/${resi}`);
  const t = await getTranslations("account");

  const order = await getOrderByResi(decodeURIComponent(resi));
  const isOwner =
    order &&
    (order.customer_id === user.id ||
      (order.email && order.email.toLowerCase() === user.email.toLowerCase()) ||
      (user.phone && order.phone && order.phone.replace(/\D/g, "") === user.phone.replace(/\D/g, "")) ||
      user.role === "admin");
  if (!order || !isOwner) notFound();

  // Sinkronkan customer_id jika pesanan sebelumnya dibuat belum tertaut id akun
  if (!order.customer_id && user.id && user.role === "customer") {
    await updateOrder(order.id, { customer_id: user.id }).catch(() => null);
  }

  const [guides, reviews] = await Promise.all([
    listGuides().catch(() => []),
    listReviews().catch(() => []),
  ]);
  const guide = order.guide_id ? guides.find((g) => g.id === order.guide_id) : null;
  const myReview = reviews.find((review) => review.user_id === user.id && review.order_resi === order.resi);
  const step = statusProgress[order.status] ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <Link href="/akun" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-navy-800">
        <span aria-hidden="true">←</span> {t("detail.back")}
      </Link>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-600">
            {t("detail.title")}
          </p>
          <h1 className="mt-1 font-mono text-xl font-bold text-navy-900">{order.resi}</h1>
          <p className="mt-1 text-[11px] text-ink-soft">
            {serviceLabel(order.service_key)} · {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
              STATUS_STYLE[order.status] ?? "border-line bg-cream text-ink-soft"
            }`}
          >
            {t(STATUS_KEY[order.status] ?? STATUS_KEY.BARU)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
              PAYMENT_STYLE[order.payment_status] ?? "border-line bg-cream text-ink-soft"
            }`}
          >
            {t(PAY_KEY[order.payment_status] ?? PAY_KEY.UNPAID)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-white shadow-sm">
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-serif text-base font-bold text-navy-900">{t("detail.statusTitle")}</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1">
                {STEPS.map((label, index) => {
                  const done = order.status !== "BATAL" && index <= step;
                  return (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full items-center">
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-bold ${
                            done ? "bg-navy-900 text-white" : "bg-cream-deep text-ink-soft"
                          }`}
                        >
                          {done ? "✓" : index + 1}
                        </span>
                        {index < STEPS.length - 1 && (
                          <span
                            className={`h-0.5 flex-1 ${
                              order.status !== "BATAL" && index < step ? "bg-navy-900" : "bg-cream-deep"
                            }`}
                          />
                        )}
                      </div>
                      <span className="text-center text-[8px] font-semibold text-ink-soft sm:text-[9px]">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {order.status === "BATAL" && (
                <p className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[10px] font-semibold text-brand-700">
                  Pesanan ini dibatalkan. Hubungi admin bila ada pertanyaan.
                </p>
              )}
              {order.verified_at && (
                <p className="mt-3 text-[10px] text-green-700">
                  {t("detail.verifiedBy")} {order.verified_by ?? "admin"} · {formatDateTime(order.verified_at)}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white shadow-sm">
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-serif text-base font-bold text-navy-900">{t("detail.infoTitle")}</h2>
            </div>
            <dl className="grid gap-3 p-4 text-[11px] sm:grid-cols-2">
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("detail.service")}
                </dt>
                <dd className="mt-0.5 font-semibold text-navy-900">{serviceLabel(order.service_key)}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("detail.date")}
                </dt>
                <dd className="mt-0.5 font-semibold text-navy-900">{formatDate(order.date)}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("detail.meetingPoint")}
                </dt>
                <dd className="mt-0.5 font-semibold text-navy-900">{order.meeting_point}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("detail.suitcases")} / {t("detail.participants")}
                </dt>
                <dd className="mt-0.5 font-semibold text-navy-900">
                  {order.suitcases} / {order.participants}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("detail.guide")}
                </dt>
                <dd className="mt-0.5 font-semibold text-navy-900">{guide?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("detail.seal")}
                </dt>
                <dd className="mt-0.5 font-mono font-semibold text-brand-700">
                  {order.seal_code ?? "—"}
                </dd>
              </div>
              {order.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                    Catatan pesanan
                  </dt>
                  <dd className="mt-0.5 text-ink">{order.notes}</dd>
                </div>
              )}
            </dl>
            <div className="border-t border-line px-4 py-2.5">
              <Link
                href={`/status?resi=${order.resi}`}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-navy-800 underline underline-offset-2"
              >
                <Icon name="route" className="h-3 w-3" /> {t("detail.track")}
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
              <h2 className="font-serif text-base font-bold text-navy-900">{t("detail.paymentTitle")}</h2>
              <span className="font-serif text-lg font-bold text-navy-900">{rupiah(order.total)}</span>
            </div>
            <div className="p-4 text-[11px]">
              <div className="flex justify-between gap-2">
                <span className="text-ink-soft">{t("detail.method")}</span>
                <span className="font-semibold text-navy-900">{paymentMethodLabel(order.payment_method)}</span>
              </div>
              {order.payment_ref && (
                <div className="mt-1 flex justify-between gap-2">
                  <span className="text-ink-soft">{t("detail.ref")}</span>
                  <span className="font-mono text-[10px] text-navy-900">{order.payment_ref}</span>
                </div>
              )}
              {order.payment_note && (
                <p className="mt-2 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[10px] text-brand-700">
                  {order.payment_note}
                </p>
              )}

              {order.payment_proof ? (
                <div className="mt-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                    {t("detail.proof")}
                  </p>
                  <a href={order.payment_proof} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.payment_proof}
                      alt={`Bukti pembayaran ${order.resi}`}
                      className="mt-1 max-h-40 rounded-lg border border-line object-contain"
                    />
                  </a>
                  <p className="mt-1 text-[9px] text-ink-soft">
                    {order.payment_status === "PAID" ? t("detail.proofVerified") : t("detail.proofSent")}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-[10px] text-ink-soft">{t("detail.noProof")}</p>
              )}

              {order.payment_status !== "PAID" && <ProofUpload orderId={order.id} />}

              {order.payment_status === "PAID" && (
                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-2 text-[10px] font-semibold text-green-700">
                  <Icon name="check" className="h-3 w-3" /> {t("detail.proofVerified")}
                </p>
              )}
            </div>
          </section>

          {order.admin_note && (
            <section className="rounded-xl border border-gold-200 bg-gold-50 p-4">
              <p className="text-[9px] font-bold uppercase tracking-wide text-gold-700">
                {t("detail.adminNote")}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink">{order.admin_note}</p>
            </section>
          )}

          {order.status === "SELESAI" && (
            <section className="rounded-xl border border-line bg-white shadow-sm">
              <div className="border-b border-line px-4 py-3">
                <h2 className="font-serif text-base font-bold text-navy-900">{t("detail.reviewTitle")}</h2>
              </div>
              {myReview ? (
                <div className="p-4">
                  <p className="text-[11px] text-gold-500">{"★".repeat(myReview.rating)}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink">{myReview.comment}</p>
                  <p className="mt-2 text-[9px] font-semibold text-ink-soft">
                    {myReview.published ? "Terpublikasi" : t("detail.reviewSent")}
                  </p>
                </div>
              ) : (
                <ReviewForm orderResi={order.resi} />
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
