import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("forgot");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-toba">
        <div className="ulos-stripe" aria-hidden="true" />
        <div className="p-6 sm:p-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-navy-900">{t("title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("subtitle")}</p>

          <ol className="mt-6 space-y-3">
            {(["0", "1", "2"] as const).map((key, index) => (
              <li key={key} className="flex gap-3 rounded-xl border border-line bg-cream/60 p-3.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-900 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <p className="pt-0.5 text-sm leading-relaxed text-ink">{t(`steps.${key}`)}</p>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://wa.me/6281268008622?text=Halo%20admin%20UNANG%20LOJA%2C%20saya%20ingin%20mengatur%20ulang%20kata%20sandi%20akun%20saya."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              {t("whatsapp")}
            </a>
            <Link
              href="/masuk"
              className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-5 py-3 text-sm font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
            >
              {t("back")}
            </Link>
          </div>

          <p className="mt-5 border-t border-line pt-4 text-[10px] leading-relaxed text-ink-soft">
            UNANG LOJA · Samosir, Danau Toba · +62 812-6800-8622
          </p>
        </div>
      </div>
    </div>
  );
}
