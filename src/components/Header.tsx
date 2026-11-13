"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";

const NAV = [
  { href: "/", key: "home" },
  { href: "/layanan", key: "services" },
  { href: "/pemandu", key: "guides" },
  { href: "/status", key: "status" },
  { href: "/bantuan", key: "help" },
] as const;

function LangSwitch() {
  const pathname = usePathname();
  const locale = useLocale();
  const other = locale === "id" ? "en" : "id";
  return (
    <span className="hidden items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1.5 text-[10px] font-bold text-navy-800 md:inline-flex">
      <span>{locale.toUpperCase()}</span>
      <span className="text-line">|</span>
      <Link href={pathname} locale={other} className="text-ink-soft hover:text-navy-700">
        {other.toUpperCase()}
      </Link>
    </span>
  );
}

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo UNANG LOJA"
            width={48}
            height={48}
            priority
            className="h-12 w-12 rounded-lg border border-line object-cover shadow-sm"
          />
          <span className="ml-2.5 hidden leading-none sm:block">
            <span className="block font-serif text-base font-bold tracking-wide text-navy-900">
              UNANG LOJA
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-gold-600">
              Samosir · Danau Toba
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-ink transition hover:bg-cream hover:text-navy-700"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch />
          <Link
            href="/pesan"
            className="hidden rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 md:block"
          >
            {t("bookCta")}
          </Link>
          <button
            type="button"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-line p-2 text-navy-800 lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-white px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/pesan"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-bold text-white"
          >
            {t("bookCta")}
          </Link>
          <div className="flex items-center gap-1 px-3 py-2 text-xs">
            <span className="font-bold text-navy-800">{locale.toUpperCase()}</span>
            <span className="text-line">|</span>
            <OtherLocaleLink />
          </div>
        </nav>
      )}
    </header>
  );
}

function OtherLocaleLink() {
  const pathname = usePathname();
  const locale = useLocale();
  const other = locale === "id" ? "en" : "id";
  return (
    <Link href={pathname} locale={other} className="text-ink-soft hover:text-navy-700">
      {other.toUpperCase()}
    </Link>
  );
}
