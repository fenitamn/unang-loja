import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SERVICES, formatIDR } from "@/lib/data";
import { PHOTOS, SERVICE_PHOTO } from "@/lib/images";
import { listReviews } from "@/lib/store";
import WidgetTabs from "@/components/WidgetTabs";
import { Eyebrow, SectionTitle, StarRow } from "@/components/ui";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const ts = await getTranslations("services");
  const tnav = await getTranslations("nav");
  const tc = await getTranslations("common");

  // Ulasan pelanggan yang sudah dimoderasi admin (maks. 3).
  const publishedReviews = (await listReviews({ published: true })).slice(0, 3);
  const dummyCount = Math.max(0, 3 - publishedReviews.length);

  // 4 layanan unggulan sesuai prototipe; fleksibel = paket andalan.
  const featured = (["penitipan", "antarDekat", "pemanduan", "fleksibel"] as const).map(
    (k) => SERVICES.find((s) => s.key === k)!,
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-gold-100 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-lake-100 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 pt-10 md:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
          <div>
            <Eyebrow icon="🌴">{t("eyebrow")}</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.15] text-navy-900 md:text-5xl lg:text-[56px]">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
              {t("heroSubtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/pesan"
                className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
              >
                {tnav("bookCta")}
              </Link>
              <Link
                href="/layanan"
                className="rounded-lg border border-navy-200 bg-white px-6 py-3 text-sm font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
              >
                {t("packages.viewAll")}
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-2">
              <StarRow value={5} />
              <span className="text-xs font-semibold text-navy-800">{t("testimonials.ratingLabel")}</span>
            </div>
          </div>
          <div className="relative">
            <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-line shadow-xl shadow-navy-900/10 md:h-80">
              <Image
                src={PHOTOS.hero}
                alt="Panorama Danau Toba dan Pulau Samosir"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Widget cek */}
      <section className="mx-auto max-w-4xl px-4">
        <div className="-mt-6 lg:-mt-10">
          <WidgetTabs />
        </div>
      </section>

      {/* Keunggulan */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow icon="✦">{t("features.eyebrow")}</Eyebrow>
          <SectionTitle center className="mt-3">
            {t("features.title")}
          </SectionTitle>
          <p className="mt-3 text-sm text-ink-soft">{t("features.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(["0", "1", "2", "3"] as const).map((i) => (
            <div key={i} className="card p-5 transition hover:border-gold-500 hover:shadow-md">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream-deep text-lg">
                {["🧭", "📸", "🚚", "💰"][Number(i)]}
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-navy-900">
                {t(`features.items.${i}.title`)}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {t(`features.items.${i}.desc`)}
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-gold-600">
                {t(`features.items.${i}.link`)} →
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Paket unggulan */}
      <section className="bg-white py-14 md:py-18">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow icon="✦">{t("packages.eyebrow")}</Eyebrow>
              <SectionTitle className="mt-3">{t("packages.title")}</SectionTitle>
            </div>
            <Link
              href="/layanan"
              className="text-xs font-bold uppercase tracking-wide text-gold-600 hover:text-gold-700"
            >
              {t("packages.viewAll")} →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((s) => {
              const isFeatured = s.key === "fleksibel";
              return (
                <div
                  key={s.key}
                  className={`relative flex flex-col rounded-2xl border p-5 ${
                    isFeatured
                      ? "border-brand-600 bg-navy-900 text-white shadow-xl shadow-navy-900/20"
                      : "card"
                  }`}
                >
                  {isFeatured && (
                    <span className="absolute -top-3 left-4 z-10 rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-900">
                      {t("packages.featured")}
                    </span>
                  )}
                  {/* Foto lokasi */}
                  <div className="relative -mx-5 -mt-5 mb-4 aspect-[16/10] overflow-hidden rounded-t-2xl">
                    <Image
                      src={SERVICE_PHOTO[s.key]}
                      alt={isFeatured ? ts("items.fleksibel.name") : ts(`items.${s.key}.name`)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${isFeatured ? "text-gold-200" : "text-gold-600"}`}>
                    {t(`packages.badges.${s.key}`)}
                  </span>
                  <h3 className={`mt-2 font-serif text-lg font-bold ${isFeatured ? "text-white" : "text-navy-900"}`}>
                    {isFeatured ? ts("items.fleksibel.name") : ts(`items.${s.key}.name`)}
                  </h3>
                  <p className={`mt-2 text-[13px] leading-relaxed ${isFeatured ? "text-navy-100" : "text-ink-soft"}`}>
                    {isFeatured ? `${ts("items.fleksibel.desc")} · ${t("packages.featuredSub")}` : t(`packages.descs.${s.key}`)}
                  </p>
                  <p className="mt-4">
                    <span className={`text-xl font-extrabold ${isFeatured ? "text-gold-200" : "text-brand-600"}`}>
                      {formatIDR(s.price)}
                    </span>
                    <span className={`ml-1 text-[11px] ${isFeatured ? "text-navy-200" : "text-ink-soft"}`}>
                      {tc(s.unit)}
                    </span>
                  </p>
                  <Link
                    href="/pesan"
                    className={`mt-4 rounded-lg px-4 py-2.5 text-center text-xs font-bold transition ${
                      isFeatured
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-navy-200 text-navy-800 hover:border-gold-500 hover:text-gold-700"
                    }`}
                  >
                    {tc("bookNow")}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2">
            <StarRow value={5} />
            <span className="text-xs font-bold text-navy-900">{t("testimonials.ratingLabel")}</span>
          </div>
          <SectionTitle center className="mt-3">
            {t("testimonials.title")}
          </SectionTitle>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {publishedReviews.map((review) => (
            <figure key={review.id} className="card relative p-5">
              <span className="absolute -top-3 left-5 grid h-8 w-8 place-items-center rounded-full border border-gold-200 bg-gold-50 font-serif text-sm text-gold-600">
                ”
              </span>
              <StarRow value={review.rating} className="mt-1 text-xs" />
              <blockquote className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {review.comment}
              </blockquote>
              <figcaption className="mt-4 border-t border-line pt-3">
                <p className="text-xs font-bold text-navy-900">{review.name}</p>
                <p className="text-[11px] text-ink-soft">{t("testimonials.verifiedRole")}</p>
              </figcaption>
            </figure>
          ))}
          {(["0", "1", "2"] as const).slice(0, dummyCount).map((i) => (
            <figure key={i} className="card relative p-5">
              <span className="absolute -top-3 left-5 grid h-8 w-8 place-items-center rounded-full border border-gold-200 bg-gold-50 font-serif text-sm text-gold-600">
                ”
              </span>
              <span className="absolute right-4 top-3 rounded-full border border-line bg-cream px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                {t("testimonials.sampleLabel")}
              </span>
              <StarRow value={5} className="mt-1 text-xs" />
              <blockquote className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {t(`testimonials.items.${i}.text`)}
              </blockquote>
              <figcaption className="mt-4 border-t border-line pt-3">
                <p className="text-xs font-bold text-navy-900">{t(`testimonials.items.${i}.name`)}</p>
                <p className="text-[11px] text-ink-soft">{t(`testimonials.items.${i}.role`)}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-ink-soft">
          {publishedReviews.length > 0 && dummyCount > 0
            ? t("testimonials.mixedNote")
            : publishedReviews.length > 0
              ? t("testimonials.verifiedNote")
              : t("testimonials.note")}
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-10 text-center text-white md:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-700/40 blur-3xl"
          />
          <div className="relative">
            <Eyebrow tone="outline" icon="🛶">
              {t("eyebrow")}
            </Eyebrow>
            <h2 className="mt-4 font-serif text-2xl font-bold text-white md:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-navy-100">
              {t("ctaSubtitle")}
            </p>
            <Link
              href="/pesan"
              className="mt-7 inline-block rounded-lg bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow transition hover:bg-brand-700"
            >
              {tnav("bookCta")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
