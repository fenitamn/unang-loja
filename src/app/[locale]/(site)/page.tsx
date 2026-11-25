import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SERVICES, formatIDR } from "@/lib/data";
import { PHOTOS, SERVICE_PHOTO } from "@/lib/images";
import { listReviews } from "@/lib/store";
import { requireUserPage } from "@/lib/auth";
import WidgetTabs from "@/components/WidgetTabs";
import { Eyebrow, SectionTitle, StarRow } from "@/components/ui";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUserPage(locale, `/${locale}`);

  const t = await getTranslations("home");
  const ts = await getTranslations("services");
  const tnav = await getTranslations("nav");
  const tc = await getTranslations("common");

  // Ulasan pelanggan yang sudah dimoderasi admin (maks. 3).
  const publishedReviews = (await listReviews({ published: true })).slice(0, 3);
  const dummyCount = Math.max(0, 3 - publishedReviews.length);

  const service = (key: "penitipan" | "antarDekat" | "antarLintas" | "pemanduan" | "fleksibel" | "mystery") =>
    SERVICES.find((s) => s.key === key)!;

  const topCards = [service("penitipan"), service("antarDekat"), service("pemanduan")];
  const bottomCards = [service("fleksibel"), service("antarLintas")];
  const mystery = service("mystery");

  const trustIcons = ["🔐", "🎓", "🛡️", "⭐"];

  return (
    <div>
      {/* Hero + widget */}
      <section className="relative overflow-hidden bg-cream">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-gold-100 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-lake-100 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-9 md:pt-12">
          <div className="grid items-start gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            <div>
              <Eyebrow icon="🌴">{t("eyebrow")}</Eyebrow>
              <h1 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-[1.12] text-navy-900 md:text-5xl lg:text-[52px]">
                {t("heroTitle")}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft md:text-[15px]">
                {t("heroSubtitle")}
              </p>
              <div className="mt-6">
                <WidgetTabs />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StarRow value={5} />
                <span className="text-[11px] font-semibold text-navy-800">
                  {t("testimonials.ratingLabel")}
                </span>
                <span className="text-[10px] text-ink-soft">· {t("heroRatingNote")}</span>
              </div>
            </div>

            <div className="relative lg:pt-5">
              <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border border-line shadow-xl shadow-navy-900/10 md:h-[360px]">
                <Image
                  src={PHOTOS.hero}
                  alt="Panorama Danau Toba dan Pulau Samosir"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold-200">
                      {t("heroImage.eyebrow")}
                    </p>
                    <p className="mt-1 font-serif text-lg font-bold leading-tight">
                      {t("heroImage.title")}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/80">{t("heroImage.desc")}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/30 bg-white/15 text-lg backdrop-blur">
                    🛶
                  </span>
                </div>
              </div>

              <div className="absolute -left-3 top-0 flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 shadow-lg md:-left-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-50 text-base">🎓</span>
                <span>
                  <span className="block text-[11px] font-bold text-navy-900">
                    {t("heroCard.badgeTitle")}
                  </span>
                  <span className="block text-[9px] text-ink-soft">{t("heroCard.badgeDesc")}</span>
                </span>
              </div>
              <div className="absolute -bottom-5 right-2 flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 shadow-lg md:right-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-base">🔒</span>
                <span>
                  <span className="block text-[11px] font-bold text-navy-900">
                    {t("heroCard.sealTitle")}
                  </span>
                  <span className="block text-[9px] text-ink-soft">{t("heroCard.sealDesc")}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-12 grid gap-0 overflow-hidden rounded-xl border border-line bg-white sm:grid-cols-2 lg:grid-cols-4">
            {(["0", "1", "2", "3"] as const).map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream text-base" aria-hidden="true">
                  {trustIcons[Number(i)]}
                </span>
                <span>
                  <span className="block text-[11px] font-bold text-navy-900">
                    {t(`trust.${i}.title`)}
                  </span>
                  <span className="block text-[10px] text-ink-soft">{t(`trust.${i}.desc`)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow icon="✦">{t("features.eyebrow")}</Eyebrow>
          <SectionTitle center className="mt-3">
            {t("features.title")}
          </SectionTitle>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("features.subtitle")}</p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-gold-600">
                {t(`features.items.${i}.link`)} →
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Paket unggulan */}
      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow icon="✦">{t("packages.eyebrow")}</Eyebrow>
              <SectionTitle className="mt-3">{t("packages.title")}</SectionTitle>
              <p className="mt-2 max-w-xl text-sm text-ink-soft">{t("packages.subtitle")}</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Link
                href="/layanan"
                className="text-xs font-bold uppercase tracking-wide text-gold-600 hover:text-gold-700"
              >
                {t("packages.viewAll")} →
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-[10px] font-bold text-gold-700">
                🛡️ {t("packages.guarantee")}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topCards.map((s) => {
              const featured = s.key === "pemanduan";
              return (
                <article
                  key={s.key}
                  className={`relative flex flex-col overflow-hidden rounded-xl border ${
                    featured
                      ? "border-navy-800 bg-navy-900 text-white shadow-xl shadow-navy-900/20"
                      : "border-line bg-white"
                  }`}
                >
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={SERVICE_PHOTO[s.key]}
                      alt={ts(`items.${s.key}.name`)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-navy-800 shadow-sm">
                      {t(`packages.badges.${s.key}`)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className={`font-serif text-lg font-bold ${featured ? "text-white" : "text-navy-900"}`}>
                      {ts(`items.${s.key}.name`)}
                    </h3>
                    <p className={`mt-2 text-[13px] leading-relaxed ${featured ? "text-navy-100" : "text-ink-soft"}`}>
                      {t(`packages.descs.${s.key}`)}
                    </p>
                    <p className="mt-4">
                      <span className={`text-xl font-extrabold ${featured ? "text-gold-200" : "text-brand-600"}`}>
                        {formatIDR(s.price)}
                      </span>
                      <span className={`ml-1 text-[11px] ${featured ? "text-navy-200" : "text-ink-soft"}`}>
                        {tc(s.unit)}
                      </span>
                    </p>
                    <Link
                      href={`/pesan?service=${s.key}`}
                      className={`mt-4 rounded-lg px-4 py-2.5 text-center text-xs font-bold transition ${
                        featured
                          ? "bg-gold-500 text-navy-950 hover:bg-gold-400"
                          : "border border-navy-200 text-navy-800 hover:border-gold-500 hover:text-gold-700"
                      }`}
                    >
                      {tc("bookNow")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bottomCards.map((s) => {
              const featured = s.key === "fleksibel";
              return (
                <article
                  key={s.key}
                  className={`relative flex flex-col overflow-hidden rounded-xl border ${
                    featured
                      ? "border-brand-600 bg-gradient-to-br from-navy-900 to-navy-800 text-white shadow-xl shadow-navy-900/20"
                      : "border-line bg-white"
                  }`}
                >
                  {featured && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-gold-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-navy-950">
                      {t("packages.featured")}
                    </span>
                  )}
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={SERVICE_PHOTO[s.key]}
                      alt={ts(`items.${s.key}.name`)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-navy-800 shadow-sm">
                      {t(`packages.badges.${s.key}`)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className={`font-serif text-lg font-bold ${featured ? "text-white" : "text-navy-900"}`}>
                      {ts(`items.${s.key}.name`)}
                    </h3>
                    <p className={`mt-2 text-[13px] leading-relaxed ${featured ? "text-navy-100" : "text-ink-soft"}`}>
                      {t(`packages.descs.${s.key}`)}
                    </p>
                    <p className="mt-4">
                      <span className={`text-xl font-extrabold ${featured ? "text-gold-200" : "text-brand-600"}`}>
                        {formatIDR(s.price)}
                      </span>
                      <span className={`ml-1 text-[11px] ${featured ? "text-navy-200" : "text-ink-soft"}`}>
                        {tc(s.unit)}
                      </span>
                    </p>
                    <Link
                      href={`/pesan?service=${s.key}`}
                      className={`mt-4 rounded-lg px-4 py-2.5 text-center text-xs font-bold transition ${
                        featured
                          ? "bg-brand-600 text-white hover:bg-brand-700"
                          : "border border-navy-200 text-navy-800 hover:border-gold-500 hover:text-gold-700"
                      }`}
                    >
                      {tc("bookNow")}
                    </Link>
                  </div>
                </article>
              );
            })}

            {/* Mystery promo panel */}
            <article className="relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-xl border border-gold-300 bg-navy-900 p-5 text-white shadow-lg">
              <Image
                src={SERVICE_PHOTO[mystery.key]}
                alt={ts("items.mystery.name")}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-900/20" />
              <div className="relative">
                <span className="inline-flex rounded-full bg-gold-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-navy-950">
                  {t("mystery.tag")}
                </span>
                <h3 className="mt-3 font-serif text-xl font-bold">{t("mystery.title")}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-navy-100">{t("mystery.desc")}</p>
                <ul className="mt-3 space-y-1 text-[11px] text-navy-100">
                  {(["0", "1", "2"] as const).map((i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-gold-300" aria-hidden="true">✓</span>
                      {t(`mystery.items.${i}`)}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/pesan?service=${mystery.key}`}
                  className="mt-4 block rounded-lg bg-gold-500 px-4 py-2.5 text-center text-xs font-bold text-navy-950 transition hover:bg-gold-400"
                >
                  {t("mystery.cta")}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2">
            <StarRow value={5} />
            <span className="text-xs font-bold text-navy-900">{t("testimonials.ratingLabel")}</span>
          </div>
          <SectionTitle center className="mt-3">
            {t("testimonials.title")}
          </SectionTitle>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
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
    </div>
  );
}
