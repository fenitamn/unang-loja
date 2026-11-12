import { getTranslations, setRequestLocale } from "next-intl/server";
import RatingForm from "@/components/RatingForm";

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("help");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-lake-900">{t("title")}</h1>
      <p className="mt-2 text-sm text-neutral-600">{t("subtitle")}</p>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-lake-900">{t("faqTitle")}</h2>
        <div className="mt-4 space-y-2">
          {(["0", "1", "2", "3", "4", "5"] as const).map((i) => (
            <details
              key={i}
              className="group rounded-xl border border-lake-100 bg-white p-4 shadow-sm"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-lake-900 marker:hidden">
                <span className="mr-2 text-ulos-500 group-open:hidden">＋</span>
                <span className="mr-2 hidden text-ulos-500 group-open:inline">－</span>
                {t(`faq.${i}.q`)}
              </summary>
              <p className="mt-3 text-sm text-neutral-600">{t(`faq.${i}.a`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* WhatsApp */}
      <section className="mt-10 rounded-2xl bg-lake-800 p-6 text-white md:p-8">
        <h2 className="text-xl font-bold">{t("whatsappTitle")}</h2>
        <p className="mt-2 text-sm text-lake-100">{t("whatsappText")}</p>
        <a
          href="https://wa.me/6281234567890?text=Halo%20UNANG%20LOJA"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-[#25d366] px-6 py-3 text-sm font-semibold text-white hover:brightness-95"
        >
          {tc("whatsapp")}
        </a>
      </section>

      {/* Ulasan */}
      <section className="mt-10 rounded-2xl border border-lake-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-lake-900">{t("ratingTitle")}</h2>
        <p className="mt-1 text-sm text-neutral-600">{t("ratingSubtitle")}</p>
        <RatingForm />
      </section>
    </div>
  );
}
