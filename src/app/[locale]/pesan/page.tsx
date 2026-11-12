import { getTranslations, setRequestLocale } from "next-intl/server";
import BookingWizard from "@/components/BookingWizard";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-lake-900">{t("title")}</h1>
      <div className="mt-6">
        <BookingWizard />
      </div>
    </div>
  );
}
