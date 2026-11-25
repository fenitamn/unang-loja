import { getTranslations, setRequestLocale } from "next-intl/server";
import StatusLookup from "@/components/StatusLookup";
import { Breadcrumb, Eyebrow } from "@/components/ui";
import { requireUserPage } from "@/lib/auth";

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; resi?: string }>;
}) {
  const { locale } = await params;
  const { q, resi } = await searchParams;
  setRequestLocale(locale);

  const nextParams = new URLSearchParams();
  if (resi) nextParams.set("resi", resi);
  else if (q) nextParams.set("q", q);
  const nextQuery = nextParams.toString();
  await requireUserPage(
    locale,
    `/${locale}/status${nextQuery ? `?${nextQuery}` : ""}`,
  );

  const t = await getTranslations("status");
  const tnav = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <div className="py-8">
        <Breadcrumb items={[tnav("status")]} homeLabel={tnav("home")} />
        <div className="mt-4 max-w-2xl">
          <Eyebrow icon="📍">{t("badge")}</Eyebrow>
          <h1 className="mt-3 font-serif text-3xl font-bold text-navy-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <StatusLookup initialQuery={resi ?? q ?? ""} />
    </div>
  );
}
