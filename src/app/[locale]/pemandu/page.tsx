import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GUIDES } from "@/lib/data";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guides");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-lake-900">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">{t("subtitle")}</p>

      <div className="mt-8 space-y-6">
        {GUIDES.map((g) => (
          <article
            key={g.id}
            className="rounded-2xl border border-lake-100 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="flex flex-col gap-5 md:flex-row">
              {/* Kartu profil */}
              <div className="md:w-1/2">
                <div className="flex items-center gap-4">
                  <span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-lake-700 text-lg font-bold text-white"
                    aria-hidden="true"
                  >
                    {g.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-lake-900">{g.name}</h2>
                    <p className="text-sm text-ulos-600">
                      {t(`specialties.${g.specialty}`)}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-400">{t("languages")}</dt>
                    <dd className="font-medium">{g.languages.join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">{t("rating")}</dt>
                    <dd className="font-medium">
                      ★ {g.rating.toLocaleString(locale === "en" ? "en-US" : "id-ID")}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-neutral-400">
                      {t("experience", { years: g.years })}
                    </dt>
                  </div>
                </dl>
                <Link
                  href="/pesan"
                  className="mt-4 inline-block rounded-full bg-lake-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-lake-800"
                >
                  {t("book")}
                </Link>
              </div>

              {/* Kalender */}
              <div className="md:w-1/2">
                <AvailabilityCalendar guideId={g.id} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-neutral-400">{tc("dummy")}</p>
    </div>
  );
}
