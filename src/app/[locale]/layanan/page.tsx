import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SERVICES, formatIDR } from "@/lib/data";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("services");
  const tc = await getTranslations("common");
  const tNav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-lake-900">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">{t("subtitle")}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <article
            key={s.key}
            className="flex flex-col rounded-2xl border border-lake-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-3xl" aria-hidden="true">{s.emoji}</span>
                <h2 className="mt-2 text-lg font-bold text-lake-900">
                  {t(`items.${s.key}.name`)}
                </h2>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-ulos-600">{formatIDR(s.price)}</p>
                <p className="text-[11px] text-neutral-500">{tc(s.unit)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-neutral-600">{t(`items.${s.key}.desc`)}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-neutral-700">
              {(["0", "1", "2"] as const).map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-lake-600" aria-hidden="true">✓</span>
                  <span>{t(`items.${s.key}.includes.${i}`)}</span>
                </li>
              ))}
            </ul>
            {s.key === "mystery" && (
              <div className="mt-3 rounded-xl bg-sand-100 p-3 text-xs text-neutral-700">
                <p>🎭 {t("mysteryThemes.situs")}</p>
                <p className="mt-1">🌅 {t("mysteryThemes.senja")}</p>
              </div>
            )}
            <div className="mt-4 flex-1" />
            <Link
              href="/pesan"
              className="mt-4 inline-block rounded-full bg-lake-700 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-lake-800"
            >
              {tc("bookNow")}
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-ulos-100 bg-ulos-50 p-5">
        <h2 className="font-semibold text-ulos-700">{t("upsellTitle")}</h2>
        <p className="mt-1 text-sm text-neutral-700">{t("upsellText")}</p>
      </div>

      <p className="mt-6 text-xs text-neutral-400">{tc("currencyNote")}</p>
      <div className="mt-2 text-xs text-neutral-400">{tc("dummy")}</div>
    </div>
  );
}
