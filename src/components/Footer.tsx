"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tc = useTranslations("common");

  return (
    <footer className="mt-12 bg-lake-950 text-lake-100">
      <div className="ulos-stripe" aria-hidden="true" />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Image
            src="/logo.png"
            alt="Logo UNANG LOJA"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-lake-800 bg-white object-cover"
          />
          <p className="mt-2 text-lg font-extrabold text-white">UNANG LOJA</p>
          <p className="mt-2 text-sm text-lake-200">{t("about")}</p>
          <span className="mt-3 inline-block rounded-full bg-lake-900 px-2.5 py-1 text-[10px] font-medium text-lake-300">
            {tc("dummy")}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t("contactTitle")}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-lake-200">
            <li>{t("address")}</li>
            <li>
              <a
                className="underline decoration-ulos-500 underline-offset-2 hover:text-white"
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp +62 812-3456-7890
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
        <div>
          <p className="text-sm font-semibold text-white">{t("linksTitle")}</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {[
              { href: "/", key: "home" },
              { href: "/layanan", key: "services" },
              { href: "/pemandu", key: "guides" },
              { href: "/pesan", key: "book" },
              { href: "/status", key: "status" },
              { href: "/bantuan", key: "help" },
            ].map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="text-lake-200 hover:text-white">
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-lake-900 py-4 text-center text-xs text-lake-300">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
