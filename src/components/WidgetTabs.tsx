"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MEETING_POINTS, normalizeResi } from "@/lib/data";

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
  const [origin, setOrigin] = useState<string>(MEETING_POINTS[0]);
  const [destination, setDestination] = useState<string>(DESTINATIONS[0]);
  const [date, setDate] = useState("");
  const [suitcases, setSuitcases] = useState(2);
  const [resi, setResi] = useState("");

  function searchService() {
    const params = new URLSearchParams({
      meeting: origin,
      destination,
      suitcases: String(suitcases),
    });
    if (date) params.set("date", date);
    router.push(`/pesan?${params.toString()}`);
  }

  function searchResi() {
    const clean = normalizeResi(resi);
    router.push(clean ? `/status?q=${encodeURIComponent(clean)}` : "/status");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-navy-900/10">
      <div className="grid grid-cols-2 bg-cream">
        {(
          [
            { id: "service", label: t("tabService"), icon: "🧳" },
            { id: "resi", label: t("tabResi"), icon: "📍" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center justify-center gap-1.5 px-2 py-3 text-[10px] font-bold uppercase leading-snug tracking-wide transition sm:px-3 sm:text-[11px] md:text-xs ${
              tab === item.id
                ? "bg-white text-navy-900 shadow-[0_-2px_0_0_var(--color-gold-500)_inset]"
                : "text-ink-soft hover:text-navy-700"
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-5">
        {tab === "service" ? (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("origin")}
                </span>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                >
                  {MEETING_POINTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("destination")}
                </span>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                >
                  {DESTINATIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("date")}
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("suitcases")}
                </span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={suitcases}
                  onChange={(e) => setSuitcases(Math.max(1, Number(e.target.value) || 1))}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={searchService}
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t("searchCta")}
            </button>
            <p className="text-center text-[10px] leading-relaxed text-ink-soft">
              {t("serviceNote")}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                {t("resiLabel")}
              </span>
              <input
                value={resi}
                onChange={(e) => setResi(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchResi();
                }}
                placeholder={t("resiPlaceholder")}
                className="rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none focus:border-gold-500"
              />
            </label>
            <button
              type="button"
              onClick={searchResi}
              className="rounded-lg bg-navy-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-navy-900"
            >
              {t("resiCta")}
            </button>
            <p className="text-center text-[10px] leading-relaxed text-ink-soft">
              {t("resiNote")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
