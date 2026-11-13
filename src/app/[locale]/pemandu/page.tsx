import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import GuideDirectory from "@/components/GuideDirectory";
import { Breadcrumb, Eyebrow, SectionTitle, StarRow } from "@/components/ui";

export default async function PemanduPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guides");
  const tnav = await getTranslations("nav");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      {/* Kepala halaman */}
      <div className="py-8">
        <Breadcrumb items={[tnav("guides")]} homeLabel={tnav("home")} />
        <div className="mt-4 max-w-2xl">
          <Eyebrow icon="🎓">{t("eyebrow")}</Eyebrow>
          <h1 className="mt-3 font-serif text-3xl font-bold text-navy-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Standar kepercayaan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["0", "1", "2", "3"] as const).map((i) => (
          <div key={i} className="card flex items-start gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-50 text-sm text-gold-600" aria-hidden="true">
              {["✓", "🗣️", "🏛️", "🗺️"][Number(i)]}
            </span>
            <span>
              <span className="block text-xs font-bold text-navy-900">{t(`trust.${i}.title`)}</span>
              <span className="block text-[11px] text-ink-soft">{t(`trust.${i}.desc`)}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Direktori */}
      <section className="mt-10">
        <GuideDirectory />
      </section>

      {/* Standar akreditasi */}
      <section className="mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow icon="✦">{t("standards.eyebrow")}</Eyebrow>
          <SectionTitle center className="mt-3">
            {t("standards.title")}
          </SectionTitle>
          <p className="mt-3 text-sm text-ink-soft">{t("standards.subtitle")}</p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(["0", "1", "2", "3"] as const).map((i) => (
            <div key={i} className="card p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream-deep text-lg" aria-hidden="true">
                {["⛑️", "📜", "💰", "🤝"][Number(i)]}
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-navy-900">
                {t(`standards.items.${i}.title`)}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {t(`standards.items.${i}.desc`)}
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-gold-600">
                {t(`standards.items.${i}.note`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ulasan tamu */}
      <section className="mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow icon="✦">{t("testimonials.eyebrow")}</Eyebrow>
          <SectionTitle center className="mt-3">
            {t("testimonials.title")}
          </SectionTitle>
          <p className="mt-3 text-sm text-ink-soft">{t("testimonials.subtitle")}</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {(["0", "1", "2"] as const).map((i) => (
            <figure key={i} className="card p-5">
              <StarRow value={5} />
              <blockquote className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                “{t(`testimonials.items.${i}.text`)}”
              </blockquote>
              <figcaption className="mt-4 border-t border-line pt-3">
                <p className="text-xs font-bold text-navy-900">{t(`testimonials.items.${i}.name`)}</p>
                <p className="text-[11px] text-ink-soft">{t(`testimonials.items.${i}.role`)}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-ink-soft">{tc("dummy")}</p>
      </section>

      {/* CTA */}
      <section className="mt-14 overflow-hidden rounded-3xl bg-navy-900 px-6 py-10 text-center text-white md:px-10 md:py-12">
        <Eyebrow tone="outline" icon="🎒">
          {t("cta.eyebrow")}
        </Eyebrow>
        <h2 className="mx-auto mt-4 max-w-xl font-serif text-2xl font-bold text-white md:text-3xl">
          {t("cta.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-navy-100">
          {t("cta.subtitle")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/pesan"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            {t("cta.primary")}
          </Link>
          <Link
            href="/layanan"
            className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-bold text-white transition hover:border-gold-500 hover:text-gold-200"
          >
            {t("cta.secondary")}
          </Link>
        </div>
      </section>
    </div>
  );
}
