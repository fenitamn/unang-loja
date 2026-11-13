"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const locale = useLocale();
  const other = locale === "id" ? "en" : "id";

  return (
    <footer className="mt-14 bg-navy-950 text-navy-100">
      <div className="ulos-stripe" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Kolom kiri: logo + tagline */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo UNANG LOJA"
                width={52}
                height={52}
                className="h-13 w-13 rounded-lg border border-navy-700 bg-white object-cover"
              />
              <span className="font-serif text-xl font-bold text-white">UNANG LOJA</span>
            </div>
            <p className="mt-3 max-w-xs font-serif text-sm italic text-gold-200">
              “{t("slogan")}”
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-navy-200">{t("about")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1.5 text-[11px] font-medium text-gold-200">
                🌴 {t("tagSamosir")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1.5 text-[11px] font-medium text-gold-200">
                🤝 {t("tagMitra")}
              </span>
            </div>
          </div>

          {/* Kolom kanan: tautan */}
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400">
                {t("linksTitle")}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  { href: "/", key: "home" },
                  { href: "/layanan", key: "services" },
                  { href: "/pemandu", key: "guides" },
                  { href: "/pesan", key: "book" },
                  { href: "/status", key: "status" },
                  { href: "/bantuan", key: "help" },
                ].map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} className="text-navy-200 transition hover:text-white">
                      {tNav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400">
                {t("contactTitle")}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-navy-200">
                <li>{t("address")}</li>
                <li>
                  <a
                    className="text-gold-200 underline underline-offset-2 hover:text-white"
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("hotline")}
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="mailto:hello@unangloja.example">
                    hello@unangloja.example
                  </a>
                </li>
                <li>{t("hours")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-navy-800 pt-5 text-xs text-navy-300 md:flex-row">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p className="flex items-center gap-2">
            <span>{tc("dummy")}</span>
            <span className="text-navy-700">|</span>
            <Link href={pathname} className="font-medium text-gold-200 hover:text-white">
              {t("langCurrent")}
            </Link>
            <span className="text-navy-700">|</span>
            <Link href={pathname} locale={other} className="hover:text-white">
              {t("langOther")}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
