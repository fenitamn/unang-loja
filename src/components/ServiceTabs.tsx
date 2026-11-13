"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SERVICES, formatIDR, type ServiceKey } from "@/lib/data";
import { StarRow } from "@/components/ui";

type TabKey = "all" | "storage" | "guide" | "bundle";

const TAB_OF: Record<ServiceKey, TabKey> = {
  pemanduan: "guide",
  penitipan: "storage",
  antarDekat: "storage",
  antarLintas: "storage",
  fleksibel: "bundle",
  mystery: "bundle",
};

export default function ServiceTabs() {
  const t = useTranslations("services");
  const tc = useTranslations("common");
  const [tab, setTab] = useState<TabKey>("all");

  const visible = SERVICES.filter((s) => tab === "all" || TAB_OF[s.key] === tab);

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(t.raw("tabs")) as TabKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === key
                ? "bg-navy-900 text-white shadow"
                : "border border-line bg-white text-ink-soft hover:border-gold-500 hover:text-navy-800"
            }`}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </div>

      {/* Kartu layanan */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((s) => (
          <div key={s.key} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                {t(`badges.${s.key}`)}
              </span>
              <span className="rounded-full bg-cream px-2 py-0.5 font-mono text-[10px] font-bold text-navy-800">
                {t(`items.${s.key}.code`)}
              </span>
            </div>
            <h3 className="mt-2 font-serif text-lg font-bold text-navy-900">
              {t(`items.${s.key}.name`)}
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <StarRow value={5} className="text-xs" />
              <span className="text-[11px] font-semibold text-ink-soft">
                {t(`items.${s.key}.rating`)}
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              {t(`items.${s.key}.desc`)}
            </p>
            <ul className="mt-3 space-y-1.5">
              {(["0", "1", "2"] as const).map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs text-ink">
                  <span className="mt-0.5 text-gold-600" aria-hidden="true">✓</span>
                  {t(`items.${s.key}.bullets.${b}`)}
                </li>
              ))}
            </ul>

            {s.key === "mystery" && (
              <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-[11px] text-gold-700">
                🎁 {t("mysteryThemes.situs")} · {t("mysteryThemes.senja")}
              </p>
            )}

            <div className="mt-auto pt-4">
              <div className="flex items-end justify-between border-t border-line pt-4">
                <p>
                  <span className="text-lg font-extrabold text-brand-600">{formatIDR(s.price)}</span>
                  <span className="ml-1 text-[11px] text-ink-soft">{tc(s.unit)}</span>
                </p>
                {s.key === "fleksibel" && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700">
                    {t("items.fleksibel.saveLabel")}
                  </span>
                )}
              </div>
              <Link
                href="/pesan"
                className="mt-3 block rounded-lg bg-brand-600 px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-brand-700"
              >
                {tc("bookNow")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
