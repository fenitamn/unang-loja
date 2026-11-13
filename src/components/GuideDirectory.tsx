"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GUIDES, type GuideSpecialty } from "@/lib/data";
import { GUIDE_PHOTO } from "@/lib/images";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { StarRow } from "@/components/ui";

type CategoryKey = "all" | "history" | "photo" | "culinary" | "nature";

const CATEGORY_OF: Record<GuideSpecialty, CategoryKey> = {
  budaya: "history",
  sejarah: "history",
  foto: "photo",
  kuliner: "culinary",
  alam: "nature",
};

const AVATAR_BG: Record<string, string> = {
  g1: "bg-navy-800",
  g2: "bg-brand-600",
  g3: "bg-gold-600",
  g4: "bg-lake-700",
  g5: "bg-navy-600",
  g6: "bg-brand-700",
};

export default function GuideDirectory() {
  const t = useTranslations("guides");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey>("all");
  const [openCalendar, setOpenCalendar] = useState<string | null>(null);

  const guides = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUIDES.filter((g) => {
      const matchCat = category === "all" || CATEGORY_OF[g.specialty] === category;
      const matchQ =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.languages.some((l) => l.toLowerCase().includes(q)) ||
        g.specialty.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  const categoryKeys = Object.keys(t.raw("categories")) as CategoryKey[];

  return (
    <div>
      {/* Pencarian & kategori */}
      <div className="card p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-gold-500"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {categoryKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
                category === key
                  ? "bg-navy-900 text-white"
                  : "border border-line bg-white text-ink-soft hover:border-gold-500 hover:text-navy-800"
              }`}
            >
              {t(`categories.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 font-serif text-xl font-bold text-navy-900">
        {t("directory.title")}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{t("directory.subtitle")}</p>

      {/* Kartu pemandu */}
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((g) => (
          <div key={g.id} className="card flex flex-col overflow-hidden">
            {/* Foto latar pemandu */}
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={GUIDE_PHOTO[g.id] ?? "/images/hero.jpg"}
                alt={g.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start gap-3">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full font-serif text-base font-bold text-white ${AVATAR_BG[g.id] ?? "bg-navy-800"}`}
                aria-hidden="true"
              >
                {g.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-serif text-base font-bold text-navy-900">
                  {g.name}
                </h3>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <StarRow value={g.rating} className="text-xs" />
                  <span className="text-[11px] font-bold text-gold-700">{g.rating.toFixed(1)}</span>
                </div>
                <span className="mt-1 inline-block rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-800">
                  {t(`categories.${CATEGORY_OF[g.specialty]}`)}
                </span>
              </div>
            </div>

            <dl className="mt-4 space-y-1.5 text-xs">
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-semibold text-ink-soft">{t("card.experience")}</dt>
                <dd className="font-medium text-navy-900">{g.years} th</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-semibold text-ink-soft">{t("card.languages")}</dt>
                <dd className="text-navy-900">{g.languages.join(" · ")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-semibold text-ink-soft">{t("card.focus")}</dt>
                <dd className="text-navy-900">{t(`categories.${CATEGORY_OF[g.specialty]}`)}</dd>
              </div>
            </dl>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
              <button
                type="button"
                onClick={() => setOpenCalendar(openCalendar === g.id ? null : g.id)}
                className="rounded-lg border border-navy-200 px-3 py-2 text-[11px] font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
              >
                {openCalendar === g.id ? "×" : t("card.viewProfile")}
              </button>
              <Link
                href="/pesan"
                className="rounded-lg bg-brand-600 px-3 py-2 text-center text-[11px] font-bold text-white transition hover:bg-brand-700"
              >
                {t("card.choose")}
              </Link>
            </div>

            {openCalendar === g.id && <AvailabilityCalendar guideId={g.id} />}
            </div>
          </div>
        ))}
      </div>

      {guides.length === 0 && (
        <p className="card mt-5 p-6 text-center text-sm text-ink-soft">
          {t("searchPlaceholder")}
        </p>
      )}
    </div>
  );
}
