import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SERVICES, formatIDR } from "@/lib/data";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const ts = await getTranslations("services");
  const tc = await getTranslations("common");

  const stats = [
    { value: "6+", label: t("stats.guides") },
    { value: "20", label: t("stats.quota") },
    { value: "2", label: t("stats.languages") },
    { value: "100%", label: t("stats.sealed") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-lake-800 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lake-600/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-lake-500/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lake-200">
            {t("heroEyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-lake-100 md:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pesan"
              className="rounded-full bg-ulos-500 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-ulos-600"
            >
              {t("heroCtaPrimary")}
            </Link>
            <Link
              href="/layanan"
              className="rounded-full border border-lake-300 px-6 py-3 text-sm font-semibold text-white hover:bg-lake-700"
            >
              {t("heroCtaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="border-b border-lake-100 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-lake-800 md:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-neutral-500 md:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Keunggulan */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-2xl font-bold text-lake-900 md:text-3xl">
          {t("featuresTitle")}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(["0", "1", "2", "3"] as const).map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-lake-100 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-lake-900">{t(`features.${i}.title`)}</h3>
              <p className="mt-2 text-sm text-neutral-600">{t(`features.${i}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Layanan */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-lake-900 md:text-3xl">
            {t("servicesTitle")}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">{t("servicesSubtitle")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link
                key={s.key}
                href="/pesan"
                className="group rounded-2xl border border-lake-100 bg-sand-50 p-5 transition hover:border-lake-300 hover:shadow"
              >
                <span className="text-3xl" aria-hidden="true">{s.emoji}</span>
                <h3 className="mt-3 font-semibold text-lake-900 group-hover:text-lake-700">
                  {ts(`items.${s.key}.name`)}
                </h3>
                <p className="mt-1 text-sm font-bold text-ulos-600">
                  {formatIDR(s.price)}
                  <span className="ml-1 text-xs font-medium text-neutral-500">
                    {tc(s.unit)}
                  </span>
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/layanan"
              className="text-sm font-semibold text-lake-700 underline underline-offset-4 hover:text-lake-800"
            >
              {t("servicesCta")} →
            </Link>
          </div>
        </div>
      </section>

      {/* Cara pesan */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-2xl font-bold text-lake-900 md:text-3xl">
          {t("stepsTitle")}
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-4">
          {(["0", "1", "2", "3"] as const).map((i, idx) => (
            <li key={i} className="rounded-2xl border border-lake-100 bg-white p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-lake-700 text-sm font-bold text-white">
                {idx + 1}
              </span>
              <h3 className="mt-3 font-semibold text-lake-900">{t(`steps.${i}.title`)}</h3>
              <p className="mt-1 text-sm text-neutral-600">{t(`steps.${i}.desc`)}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <Link
            href="/pesan"
            className="inline-block rounded-full bg-lake-700 px-6 py-3 text-sm font-semibold text-white hover:bg-lake-800"
          >
            {t("stepsCta")}
          </Link>
        </div>
      </section>

      {/* Testimoni */}
      <section className="bg-lake-50 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-lake-900 md:text-3xl">
            {t("testimonialsTitle")}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(["0", "1", "2"] as const).map((i) => (
              <figure key={i} className="rounded-2xl border border-lake-100 bg-white p-5">
                <div className="text-ulos-500" aria-hidden="true">★★★★★</div>
                <blockquote className="mt-2 text-sm text-neutral-600">
                  “{t(`testimonials.${i}.text`)}”
                </blockquote>
                <figcaption className="mt-3 text-xs font-semibold text-lake-800">
                  — {t(`testimonials.${i}.name`)}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-400">{t("testimonialsNote")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl bg-lake-800 p-8 text-center text-white md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-lake-100">
            {t("ctaSubtitle")}
          </p>
          <Link
            href="/pesan"
            className="mt-6 inline-block rounded-full bg-ulos-500 px-8 py-3 text-sm font-semibold hover:bg-ulos-600"
          >
            {t("heroCtaPrimary")}
          </Link>
        </div>
      </section>
    </div>
  );
}
