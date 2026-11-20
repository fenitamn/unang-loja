"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const locale = useLocale();
  const other = locale === "id" ? "en" : "id";

  // 5 tautan sesuai prototipe — diarahkan ke halaman/ bagian yang relevan.
  const links = [
    { href: "/layanan", key: "sealPolicy" },
    { href: "/layanan", key: "zones" },
    { href: "/pemandu", key: "verifyGuides" },
    { href: "/bantuan", key: "terms" },
    { href: "/bantuan", key: "emergency" },
  ] as const;

  return (
    <footer className="mt-14 bg-navy-900 text-navy-100">
      <div className="ulos-stripe" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Blok atas: identitas + hotline + badge */}
        <div className="flex flex-col gap-8 border-b border-navy-800 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo UNANG LOJA"
                width={52}
                height={52}
                className="h-12 w-12 rounded bg-white object-cover p-0.5"
              />
              <span className="font-serif text-xl font-bold text-white">UNANG LOJA</span>
            </div>
            <p className="mt-3 max-w-xs font-serif text-sm italic text-gold-200">
              “{t("slogan")}”
            </p>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-navy-200">
              {t("about")}
            </p>
            <p className="mt-2 text-[11px] text-navy-300">
              {t("address")} · {t("hours")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="tel:+6281268008622"
              className="flex items-center gap-2.5 rounded-lg border border-navy-700 bg-navy-950 px-3.5 py-2.5 transition hover:border-gold-500"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600/20 text-gold-200" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-gold-200">
                  {t("hotlineLabel")}
                </span>
                <span className="block text-xs font-bold text-white">+62 812-6800-8622</span>
              </span>
            </a>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-navy-700 px-3 py-2 text-[11px] font-semibold text-navy-100">
              🔒 {t("secureBadge")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-navy-700 px-3 py-2 text-[11px] font-semibold text-navy-100">
              ✓ {t("partnerBadge")}
            </span>
          </div>
        </div>

        {/* Baris 5 tautan */}
        <nav className="grid gap-3 py-6 text-[12px] sm:grid-cols-2 lg:grid-cols-5">
          {links.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                item.key === "verifyGuides"
                  ? "font-semibold text-gold-200 underline underline-offset-4 hover:text-white"
                  : "text-navy-200 transition hover:text-white"
              }
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* Baris bawah */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-navy-800 pt-5 text-[11px] text-navy-300 md:flex-row">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p className="flex flex-wrap items-center gap-2">
            <span>{t("madeWith")}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
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
