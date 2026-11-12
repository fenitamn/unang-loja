"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { guideAvailability, type Availability } from "@/lib/data";

const WEEKDAYS_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STYLE: Record<Availability, string> = {
  available: "bg-lake-500 text-white",
  limited: "bg-sand-200 text-ink",
  full: "bg-neutral-100 text-neutral-400 line-through",
};

export default function AvailabilityCalendar({ guideId }: { guideId: string }) {
  const t = useTranslations("guides.calendar");
  const locale = useLocale();
  const [offset, setOffset] = useState(0);

  const base = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + offset, 1);
  }, [offset]);

  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDow = (base.getDay() + 6) % 7; // Senin = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const weekdays = locale === "en" ? WEEKDAYS_EN : WEEKDAYS_ID;
  const monthName = locale === "en" ? MONTHS_EN[month] : MONTHS_ID[month];
  const monthLabel = `${monthName} ${year}`;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null as null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="mt-4 rounded-xl border border-lake-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          className="rounded-lg px-2 py-1 text-sm text-lake-700 disabled:text-neutral-300"
          aria-label="Sebelumnya"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-lake-900">
          {t("title", { month: monthLabel })}
        </p>
        <button
          type="button"
          onClick={() => setOffset((o) => Math.min(2, o + 1))}
          disabled={offset === 2}
          className="rounded-lg px-2 py-1 text-sm text-lake-700 disabled:text-neutral-300"
          aria-label="Berikutnya"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-neutral-400">
        {weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const date = new Date(year, month, day);
          const isPast =
            date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const status = guideAvailability(guideId, date);
          return (
            <span
              key={day}
              title={isPast ? "—" : t(status)}
              className={`grid h-8 place-items-center rounded-lg text-xs ${
                isPast ? "bg-neutral-50 text-neutral-300" : STYLE[status]
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-lake-500" /> {t("available")}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-sand-200" /> {t("limited")}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-neutral-100" /> {t("full")}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-neutral-400">{t("legend")}</p>
    </div>
  );
}
