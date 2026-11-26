import { getTranslations, setRequestLocale } from "next-intl/server";
import RatingForm from "@/components/RatingForm";
import { Breadcrumb, Eyebrow, SectionTitle, StarRow } from "@/components/ui";
import { requireUserPage } from "@/lib/auth";

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUserPage(locale, `/${locale}/bantuan`);
  const t = await getTranslations("help");
  const tnav = await getTranslations("nav");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      {/* Kepala halaman */}
      <div className="py-8">
        <Breadcrumb items={[tnav("help")]} homeLabel={tnav("home")} />
        <div className="mt-4 max-w-2xl">
          <Eyebrow icon="✦">{t("faqTitle")}</Eyebrow>
          <h1 className="mt-3 font-serif text-3xl font-bold text-navy-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        {/* FAQ */}
        <section>
          <SectionTitle>{t("faqTitle")}</SectionTitle>
          <div className="mt-5 space-y-3">
            {(["0", "1", "2", "3", "4", "5"] as const).map((i) => (
              <details key={i} className="card group p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-navy-900 marker:hidden">
                  <span className="mr-2 text-gold-600 group-open:hidden">＋</span>
                  <span className="mr-2 hidden text-gold-600 group-open:inline">－</span>
                  {t(`faq.${i}.q`)}
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  {t(`faq.${i}.a`)}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Kolom samping */}
        <aside className="space-y-6">
          {/* WhatsApp */}
          <section className="rounded-2xl bg-navy-900 p-6 text-white">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-lg" aria-hidden="true">
              💬
            </span>
            <h2 className="mt-3 font-serif text-lg font-bold">{t("whatsappTitle")}</h2>
            <p className="mt-2 text-[13px] text-navy-100">{t("whatsappText")}</p>
            <a
              href="https://wa.me/6285143180788?text=Halo%20UNANG%20LOJA"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-[#25d366] px-5 py-2.5 text-xs font-bold text-white transition hover:brightness-95"
            >
              {tc("whatsapp")}
            </a>
          </section>

          {/* Ulasan */}
          <section className="card p-6">
            <div className="flex items-center gap-2">
              <StarRow value={5} />
              <span className="text-xs font-bold text-navy-900">4.8 / 5.0</span>
            </div>
            <h2 className="mt-3 font-serif text-lg font-bold text-navy-900">
              {t("ratingTitle")}
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">{t("ratingSubtitle")}</p>
            <RatingForm />
          </section>
        </aside>
      </div>
    </div>
  );
}
