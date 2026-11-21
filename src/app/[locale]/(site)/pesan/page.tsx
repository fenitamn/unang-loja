import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BookingWizard from "@/components/BookingWizard";
import { Breadcrumb, Eyebrow } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { listGuides, listServices } from "@/lib/store";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ guide?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { guide } = await searchParams;
  const t = await getTranslations("booking");
  const tnav = await getTranslations("nav");

  const [user, services, guides] = await Promise.all([
    getSession(),
    listServices().catch(() => []),
    listGuides().catch(() => []),
  ]);
  const activeServiceKeys = services.filter((service) => service.active).map((service) => service.key);
  const guideRates = Object.fromEntries(
    guides.filter((record) => record.active).map((record) => [record.slug, record.price]),
  );
  const validGuide =
    guide && guides.some((record) => record.slug === guide && record.active) ? guide : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <div className="py-8">
        <Breadcrumb items={[tnav("book")]} homeLabel={tnav("home")} />
        <div className="mt-4 max-w-2xl">
          <Eyebrow icon="🧳">{t("sidebar.calc")}</Eyebrow>
          <h1 className="mt-3 font-serif text-3xl font-bold text-navy-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            {t("subtitle")}
          </p>
          {!user && (
            <p className="mt-4 rounded-lg border border-gold-200 bg-gold-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-gold-700">
              {t("accountHint")}{" "}
              <Link
                href={`/masuk?next=${encodeURIComponent(`/${locale}/pesan`)}`}
                className="font-bold underline decoration-gold-400 underline-offset-2"
              >
                {t("loginLink")}
              </Link>
            </p>
          )}
        </div>
      </div>
      <BookingWizard
        initialGuideId={validGuide}
        loggedIn={Boolean(user)}
        activeServiceKeys={activeServiceKeys}
        guideRates={guideRates}
        account={
          user
            ? { name: user.name, phone: user.phone ?? "", email: user.email }
            : null
        }
      />
    </div>
  );
}
