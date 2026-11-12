"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
    <Link
      href={pathname}
      locale={other}
      className="rounded-full border border-lake-200 px-3 py-1.5 text-xs font-semibold text-lake-700 hover:bg-lake-50"
    >
      {other.toUpperCase()}
    </Link>
  );
}

export default function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-lake-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo UNANG LOJA"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-full border border-lake-100 bg-white object-cover"
          />
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-wide text-lake-900">
              UNANG LOJA
            </span>
            <span className="block text-[10px] font-medium text-ulos-600">
              Jelajah Tanpa Koper
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-lake-50 hover:text-lake-800"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/pesan"
            className="ml-2 rounded-full bg-ulos-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ulos-600"
          >
            {t("book")}
          </Link>
          <div className="ml-1">
            <LangSwitch />
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LangSwitch />
          <button
            type="button"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-lake-200 p-2 text-lake-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-lake-100 bg-white px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-lake-50"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/pesan"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg bg-ulos-500 px-3 py-2.5 text-center text-sm font-semibold text-white"
          >
            {t("book")}
          </Link>
          <p className="px-3 py-2 text-[10px] text-neutral-400">{tc("dummy")}</p>
        </nav>
      )}
    </header>
  );
}
