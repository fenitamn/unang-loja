"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MEETING_POINTS } from "@/lib/data";

const DESTINATIONS = [
  "Hotel Carolina, Tuk Tuk",
  "Wisma Bolon, Tomok",
  "Homestay Ambarita",
  "Penginapan Simanindo",
  "Pangururan (lintas zona)",
];

export default function WidgetTabs() {
  const t = useTranslations("home.widget");
  const router = useRouter();
  const [tab, setTab] = useState<"service" | "resi">("service");
  const [resi, setResi] = useState("");

  return (
    <div className="card overflow-hidden shadow-lg shadow-navy-900/10">
      {/* Tab */}
      <div className="grid grid-cols-2 bg-cream">
        {(
          [
            { id: "service", label: t("tabService") },
            { id: "resi", label: t("tabResi") },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3 py-3 text-[11px] font-bold uppercase tracking-wide transition md:text-xs ${
              tab === item.id
                ? "bg-white text-navy-900 shadow-[0_-2px_0_0_var(--color-gold-500)_inset]"
                : "text-ink-soft hover:text-navy-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-5 md:p-6">
        {tab === "service" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                {t("origin")}
              </span>
              <select className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500">
                {MEETING_POINTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                {t("destination")}
              </span>
              <select className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500">
                {DESTINATIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                {t("date")}
              </span>
              <input type="date" className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500" />
            </label>
            <label className="grid gap-1.5 text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                {t("suitcases")}
              </span>
              <input type="number" min={1} max={20} defaultValue={2} className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500" />
            </label>
            <button
              type="button"
              onClick={() => router.push("/pesan")}
              className="md:col-span-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t("searchCta")}
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            <input
              value={resi}
              onChange={(e) => setResi(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && resi.trim()) router.push(`/status?q=${encodeURIComponent(resi.trim())}`);
              }}
              placeholder={t("resiPlaceholder")}
              className="rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none focus:border-gold-500"
            />
            <button
              type="button"
              onClick={() => router.push(resi.trim() ? `/status?q=${encodeURIComponent(resi.trim())}` : "/status")}
              className="rounded-lg bg-navy-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-navy-900"
            >
              {t("resiCta")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
