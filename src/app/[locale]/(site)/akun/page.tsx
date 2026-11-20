import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Icon from "@/components/admin/Icon";
import ProfileForm from "@/components/admin/ProfileForm";
import { ACTIVE_STATUSES, formatDate, orderDetail, rupiah, serviceLabel } from "@/lib/admin-ui";
import { requireCustomerPage } from "@/lib/auth";
import { listOrders, type OrderRecord } from "@/lib/store";

const PAY_STYLE: Record<string, string> = {
  UNPAID: "border-line bg-cream-deep text-ink-soft",
  PENDING: "border-gold-300 bg-gold-50 text-gold-700",
  PAID: "border-green-300 bg-green-50 text-green-700",
  REJECTED: "border-brand-200 bg-brand-50 text-brand-700",
};

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

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireCustomerPage(locale, `/${locale}/akun`);
  const t = await getTranslations("account");

  const orders = await listOrders({ customerId: user.id, limit: 200 }).catch(() => [] as OrderRecord[]);
  const active = orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const done = orders.filter((order) => order.status === "SELESAI");
  const spent = orders
    .filter((order) => order.payment_status === "PAID")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-navy-950 p-6 text-white shadow-toba md:flex-row md:items-end md:justify-between md:p-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-300">{t("badge")}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold">
            {t("hello")}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">{t("subtitle")}</p>
          <p className="mt-3 text-[11px] text-white/45">{user.email}</p>
        </div>
        <Link
          href="/pesan"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2.5 text-xs font-bold text-navy-950 transition hover:bg-gold-400"
        >
          <Icon name="plus" className="h-3.5 w-3.5" /> {t("newBooking")}
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: t("stats.total"), value: String(orders.length) },
          { label: t("stats.active"), value: String(active.length) },
          { label: t("stats.done"), value: String(done.length) },
          { label: t("stats.spent"), value: rupiah(spent) },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-soft">{item.label}</p>
            <p className="mt-1 font-serif text-xl font-bold text-navy-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <section>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-navy-900">{t("ordersTitle")}</h2>
              <p className="text-[11px] text-ink-soft">{t("ordersSubtitle")}</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="mt-3 rounded-xl border border-line bg-white px-6 py-12 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream-deep text-navy-500">
                <Icon name="bag" className="h-5 w-5" />
              </span>
              <p className="mt-3 font-serif text-base font-bold text-navy-900">{t("empty")}</p>
              <Link
                href="/pesan"
                className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700"
              >
                {t("emptyCta")}
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-navy-900">{order.resi}</p>
                      <p className="mt-0.5 text-[10px] text-ink-soft">
                        {formatDate(order.created_at)} · {serviceLabel(order.service_key)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-navy-200 bg-navy-50 px-2 py-0.5 text-[9px] font-bold text-navy-800">
                        {t(STATUS_KEY[order.status] ?? STATUS_KEY.BARU)}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                          PAY_STYLE[order.payment_status] ?? PAY_STYLE.UNPAID
                        }`}
                      >
                        {t(PAY_KEY[order.payment_status] ?? PAY_KEY.UNPAID)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                        {t("detail.date")}
                      </p>
                      <p className="font-semibold text-navy-900">{formatDate(order.date)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                        {t("detail.meetingPoint")}
                      </p>
                      <p className="truncate font-semibold text-navy-900">{order.meeting_point}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                        {t("detail.total")}
                      </p>
                      <p className="font-semibold text-navy-900">{rupiah(order.total)}</p>
                    </div>
                  </div>
                  {order.admin_note && (
                    <p className="mt-2 rounded-lg bg-cream px-2.5 py-1.5 text-[10px] text-ink-soft">
                      {t("detail.adminNote")}: {order.admin_note}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/akun/pesanan/${order.resi}`}
                      className="rounded-lg bg-navy-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-navy-800"
                    >
                      {t("viewDetail")}
                    </Link>
                    <Link
                      href={`/status?resi=${order.resi}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-bold text-navy-800 hover:border-navy-300"
                    >
                      <Icon name="route" className="h-3 w-3" /> {t("detail.track")}
                    </Link>
                    <span className="ml-auto text-[9px] text-ink-soft">{orderDetail(order)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white shadow-sm">
          <div className="border-b border-line px-4 py-3.5">
            <h2 className="font-serif text-base font-bold text-navy-900">{t("profileTitle")}</h2>
            <p className="text-[10px] text-ink-soft">{t("profileSubtitle")}</p>
          </div>
          <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone }} />
        </section>
      </div>
    </div>
  );
}
