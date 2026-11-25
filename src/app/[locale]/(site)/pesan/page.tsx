import { getTranslations, setRequestLocale } from "next-intl/server";
import BookingWizard from "@/components/BookingWizard";
import { Breadcrumb, Eyebrow } from "@/components/ui";
import { requireUserPage } from "@/lib/auth";
import { listGuides, listServices } from "@/lib/store";

// Halaman pemesanan membaca sesi pelanggan untuk mengisi data kontak.
export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    guide?: string;
    service?: string;
    meeting?: string;
    destination?: string;
    date?: string;
    suitcases?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { guide, service, meeting, destination, date, suitcases } = await searchParams;
  const user = await requireUserPage(locale, `/${locale}/pesan`);
  const t = await getTranslations("booking");
  const tnav = await getTranslations("nav");

  const [services, guides] = await Promise.all([
    listServices().catch(() => []),
    listGuides().catch(() => []),
  ]);
  const activeServiceKeys = services.filter((service) => service.active).map((service) => service.key);
  const guideRates = Object.fromEntries(
    guides.filter((record) => record.active).map((record) => [record.slug, record.price]),
  );
  const activeGuideSlugs = guides.filter((record) => record.active).map((record) => record.slug);
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
        </div>
      </div>
      <BookingWizard
        initialGuideId={validGuide}
        initialServiceKey={service}
        initialMeetingPoint={meeting}
        initialDestination={destination}
        initialDate={date}
        initialSuitcases={suitcases ? Number(suitcases) : undefined}
        loggedIn={Boolean(user)}
        activeServiceKeys={activeServiceKeys}
        guideRates={guideRates}
        activeGuideSlugs={activeGuideSlugs}
        account={
          user
            ? { name: user.name, phone: user.phone ?? "", email: user.email }
            : null
        }
      />
    </div>
  );
}
