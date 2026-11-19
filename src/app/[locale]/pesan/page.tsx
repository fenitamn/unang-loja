import { getTranslations, setRequestLocale } from "next-intl/server";
import BookingWizard from "@/components/BookingWizard";
import { Breadcrumb, Eyebrow } from "@/components/ui";

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
      <BookingWizard initialGuideId={guide} />
    </div>
  );
}
