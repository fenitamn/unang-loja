import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatIDR, getGuide, type Guide } from "@/lib/data";
import GuideDirectory from "@/components/GuideDirectory";
import { listGuides } from "@/lib/store";
import { requireUserPage } from "@/lib/auth";
import {
  Breadcrumb,
  DividerIcon,
  Eyebrow,
  SectionTitle,
  StarRow,
} from "@/components/ui";

const TRUST_ICONS = ["🛡️", "🗣️", "📜", "👨‍👩‍👧"];
const PILLAR_ICONS = ["⛑️", "📜", "💰", "🤝"];
const AVATAR_TONES = ["bg-navy-800", "bg-brand-600", "bg-lake-700"];

export default async function PemanduPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUserPage(locale, `/${locale}/pemandu`);

  const t = await getTranslations("guides");
  const tnav = await getTranslations("nav");

  const records = await listGuides().catch(() => []);
  const guides: Guide[] = records
    .filter((record) => record.active)
    .map((record) => {
      const base = getGuide(record.slug);
      if (!base) return null;
      return {
        ...base,
        name: record.name,
        languages: record.languages.length > 0 ? record.languages : base.languages,
        rating: record.rating,
        reviews: record.reviews,
        years: record.years,
        price: record.price,
        license: record.license,
      };
    })
    .filter((guide): guide is Guide => Boolean(guide));

  return (
    <div className="pb-16">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-line bg-cream-deep">
        {/* Ornamen gorga samar di latar */}
        <svg
          className="pointer-events-none absolute -right-16 top-6 h-64 w-64 text-gold-500/15"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="86" strokeDasharray="8 10" />
          <circle cx="100" cy="100" r="54" />
          <circle cx="100" cy="100" r="22" />
          <path d="M100 14v172M14 100h172" strokeDasharray="10 14" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-8">
          <Breadcrumb items={[tnav("guides")]} homeLabel={tnav("home")} />

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-start">
            <div className="max-w-2xl">
              <Eyebrow icon="✓">{t("eyebrow")}</Eyebrow>
              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-navy-900 md:text-[40px] md:leading-[1.1]">
                {t("title")}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
                {t("subtitle")}
              </p>

              {/* Strip kepercayaan 4 pilar */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(["0", "1", "2", "3"] as const).map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-line bg-white/80 p-3"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-50 text-sm"
                      aria-hidden="true"
                    >
                      {TRUST_ICONS[Number(i)]}
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold text-navy-900">
                        {t(`trust.${i}.title`)}
                      </span>
                      <span className="block text-[10.5px] leading-snug text-ink-soft">
                        {t(`trust.${i}.desc`)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kartu promo bundling */}
            <aside className="rounded-xl border border-gold-200 bg-white p-5 shadow-toba">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-gold-700">
                  🎒 {t("promo.badge")}
                </span>
                <span className="text-[11px] font-bold text-brand-600">
                  {t("promo.saving")}
                </span>
              </div>
              <h2 className="mt-3 font-serif text-lg font-bold leading-snug text-navy-900">
                {t("promo.title")}
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                {t("promo.desc")}
              </p>
              <p className="mt-3 font-serif text-xl font-bold text-brand-600">
                {t("cta.comboPrice")}
              </p>
              <Link
                href="/pesan"
                className="mt-3 block rounded-lg bg-brand-600 px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-brand-700"
              >
                {t("cta.primary")}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ================= FILTER + DIREKTORI ================= */}
      <div className="mx-auto max-w-6xl px-4">
        <GuideDirectory guides={guides} />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <DividerIcon className="my-12" />

        {/* ================= STANDAR SERTIFIKASI (4 PILAR) ================= */}
        <section>
          <div className="rounded-xl border border-line bg-cream-deep p-6 md:p-10">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <Eyebrow icon="✦">{t("standards.eyebrow")}</Eyebrow>
                <SectionTitle className="mt-3">{t("standards.title")}</SectionTitle>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  {t("standards.subtitle")}
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="flex items-start gap-3 rounded-xl border border-gold-200 bg-white p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-50 text-xl">
                    🏛️
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-gold-700">
                      {t("standards.sideTitle")}
                    </span>
                    <span className="mt-0.5 block text-[12px] font-semibold text-navy-900">
                      {t("standards.sideDesc")}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(["0", "1", "2", "3"] as const).map((i) => (
                <div key={i} className="card p-5">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg shadow-sm"
                    aria-hidden="true"
                  >
                    {PILLAR_ICONS[Number(i)]}
                  </span>
                  <h3 className="mt-4 font-serif text-base font-bold text-navy-900">
                    {t(`standards.items.${i}.title`)}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                    {t(`standards.items.${i}.desc`)}
                  </p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-gold-600">
                    {t(`standards.items.${i}.note`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ULASAN TAMU ================= */}
        <section className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow icon="✦">{t("testimonials.eyebrow")}</Eyebrow>
            <SectionTitle center className="mt-3">
              {t("testimonials.title")}
            </SectionTitle>
            <p className="mt-3 text-sm text-ink-soft">{t("testimonials.subtitle")}</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(["0", "1", "2"] as const).map((i) => {
              const name = t(`testimonials.items.${i}.name`);
              const initials = name
                .replace(/&/g, " ")
                .split(" ")
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join("");
              return (
                <figure key={i} className="card flex flex-col p-5">
                  <div className="flex items-center justify-between">
                    <StarRow value={5} className="text-xs" />
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-bold text-gold-700">
                      ★ {t(`testimonials.items.${i}.rating`)}
                    </span>
                  </div>
                  <blockquote className="mt-3 flex-1 text-[12.5px] leading-relaxed text-ink-soft">
                    “{t(`testimonials.items.${i}.text`)}”
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-2.5 border-t border-line pt-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${AVATAR_TONES[Number(i)]}`}
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-navy-900">
                        {name}
                      </span>
                      <span className="block text-[10.5px] leading-snug text-ink-soft">
                        {t(`testimonials.items.${i}.role`)}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        {/* ================= CTA COMBO ================= */}
        <section className="mt-14 overflow-hidden rounded-2xl bg-navy-800 px-6 py-10 text-white md:px-10 md:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Eyebrow tone="outline" icon="🎒">
                  {t("cta.comboBadge")}
                </Eyebrow>
                <span className="rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-900">
                  {t("cta.comboPrice")}
                </span>
              </div>
              <h2 className="mt-4 font-serif text-2xl font-bold leading-snug text-white md:text-3xl">
                {t("cta.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-100">
                {t("cta.subtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/pesan"
                  className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  {t("cta.primary")}
                </Link>
                <a
                  href="https://wa.me/6285143180788?text=Halo%20UNANG%20LOJA%2C%20saya%20ingin%20konsultasi%20rute%20pemandu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-bold text-white transition hover:border-gold-500 hover:text-gold-200"
                >
                  {t("cta.secondary")}
                </a>
              </div>
            </div>
            <div className="shrink-0 rounded-xl border border-navy-600 bg-navy-950 p-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-200">
                {t("promo.badge")}
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-white">
                {formatIDR(350_000)}
              </p>
              <p className="mt-1 text-[11px] text-navy-200">{t("cta.comboPrice")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
