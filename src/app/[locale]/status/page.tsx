import { getTranslations, setRequestLocale } from "next-intl/server";
import StatusLookup from "@/components/StatusLookup";

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("status");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-lake-900">{t("title")}</h1>
      <p className="mt-2 text-sm text-neutral-600">{t("subtitle")}</p>
      <div className="mt-6">
        <StatusLookup />
      </div>
    </div>
  );
}
