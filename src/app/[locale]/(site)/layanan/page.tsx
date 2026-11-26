import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ServiceTabs from "@/components/ServiceTabs";
import { Breadcrumb, Eyebrow, SectionTitle } from "@/components/ui";
import { requireUserPage } from "@/lib/auth";

export default async function LayananPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUserPage(locale, `/${locale}/layanan`);

  const t = await getTranslations("services");
  const tnav = await getTranslations("nav");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      {/* Kepala halaman */}
      <div className="py-8">
        <Breadcrumb items={[tnav("services")]} homeLabel={tnav("home")} />
        <div className="mt-4 max-w-2xl">
          <Eyebrow icon="✦">{t("eyebrow")}</Eyebrow>
          <h1 className="mt-3 font-serif text-3xl font-bold text-navy-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            {t("subtitle")}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(["0", "1", "2"] as const).map((i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-navy-800"
            >
              <span className="text-gold-600" aria-hidden="true">✓</span>
              {t(`trust.${i}`)}
            </span>
          ))}
        </div>
      </div>

      <ServiceTabs />

      {/* Fitur Frame 4 yang kini tersedia di pemesanan */}
      <section className="mt-14 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-navy-900 p-6 text-white md:p-8">
            <Eyebrow tone="outline" icon="✦">
              {t("bookingFeatures.eyebrow")}
            </Eyebrow>
            <h2 className="mt-4 font-serif text-2xl font-bold leading-tight md:text-3xl">
              {t("bookingFeatures.title")}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-navy-100">
              {t("bookingFeatures.subtitle")}
            </p>
            <Link
              href="/pesan"
              className="mt-6 inline-block rounded-lg bg-gold-500 px-5 py-2.5 text-xs font-bold text-navy-950 transition hover:bg-gold-400"
            >
              {t("bookingFeatures.cta")} →
            </Link>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 md:p-6">
            {(["0", "1", "2", "3"] as const).map((i) => (
              <div key={i} className="rounded-xl border border-line bg-cream/70 p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm shadow-sm">
                  {["🧳", "🚚", "🛡️", "🎓"][Number(i)]}
                </span>
                <h3 className="mt-3 font-serif text-sm font-bold text-navy-900">
                  {t(`bookingFeatures.items.${i}.title`)}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                  {t(`bookingFeatures.items.${i}.desc`)}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gold-700">
                  {t(`bookingFeatures.items.${i}.note`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOP segel 4 sisi */}
      <section className="mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow icon="🔒">{t("sop.eyebrow")}</Eyebrow>
          <SectionTitle center className="mt-3">
            {t("sop.title")}
          </SectionTitle>
          <p className="mt-3 text-sm text-ink-soft">{t("sop.subtitle")}</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {(["0", "1", "2"] as const).map((i) => (
            <div key={i} className="card relative p-5">
              <span className="font-serif text-4xl font-bold text-gold-200">
                {t(`sop.steps.${i}.no`)}
              </span>
              <h3 className="mt-2 font-serif text-base font-bold text-navy-900">
                {t(`sop.steps.${i}.title`)}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {t(`sop.steps.${i}.desc`)}
              </p>
              <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-[11px] font-semibold text-gold-700">
                {t(`sop.steps.${i}.note`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Banner asuransi */}
      <section className="mt-12 overflow-hidden rounded-3xl bg-navy-900 px-6 py-8 text-white md:px-10 md:py-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-600 text-xl">
              🛡️
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-white md:text-xl">
                {t("assurance.title")}
              </h2>
              <p className="mt-1 max-w-xl text-[13px] text-navy-100">
                {t("assurance.desc")}
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/6285143180788?text=Halo%2C%20saya%20ingin%20melihat%20polis%20asuransi%20UNANG%20LOJA"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-gold-500 px-5 py-2.5 text-xs font-bold text-navy-900 transition hover:bg-gold-600 hover:text-white"
          >
            {t("assurance.cta")}
          </a>
        </div>
      </section>

      {/* FAQ ringkas */}
      <section className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <Eyebrow icon="✦">{t("faq.eyebrow")}</Eyebrow>
          <SectionTitle className="mt-3">{t("faq.title")}</SectionTitle>
          <p className="mt-2 text-sm text-ink-soft">{t("faq.subtitle")}</p>
          <div className="mt-5 space-y-3">
            {(["0", "1", "2", "3"] as const).map((i) => (
              <details
                key={i}
                className="card group p-4"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-navy-900 marker:hidden">
                  <span className="mr-2 text-gold-600 group-open:hidden">＋</span>
                  <span className="mr-2 hidden text-gold-600 group-open:inline">－</span>
                  {t(`faq.items.${i}.q`)}
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  {t(`faq.items.${i}.a`)}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-soft">
            {tc("currencyNote")}
          </p>
        </div>

        {/* Kartu WhatsApp */}
        <aside className="card flex h-fit flex-col items-start gap-3 border-brand-100 bg-brand-50 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-lg text-white">
            💬
          </span>
          <h3 className="font-serif text-base font-bold text-navy-900">
            {t("faq.customTitle")}
          </h3>
          <p className="text-[13px] text-ink-soft">{t("faq.customDesc")}</p>
          <a
            href="https://wa.me/6285143180788?text=Halo%20UNANG%20LOJA"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            {t("faq.customCta")}
          </a>
          <Link href="/bantuan" className="text-[11px] font-semibold text-navy-700 underline underline-offset-4 hover:text-gold-700">
            {tc("whatsapp")}
          </Link>
        </aside>
      </section>
    </div>
  );
}
