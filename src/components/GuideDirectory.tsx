"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  GUIDES,
  formatIDR,
  type Guide,
  type GuideArea,
  type GuideCategory,
} from "@/lib/data";
import Scene from "@/components/Scene";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { StarRow } from "@/components/ui";

type SortKey = "rating" | "experience" | "price";

const AREA_KEYS: GuideArea[] = ["tomok", "tuktuk", "pusuk", "holbung"];
const CATEGORY_KEYS: GuideCategory[] = [
  "history",
  "photo",
  "culinary",
  "nature",
  "architecture",
];
const LANGUAGE_OPTIONS = [
  "Batak Toba",
  "Indonesia",
  "English",
  "Deutsch",
  "Dutch",
  "Mandarin",
];
const SORT_KEYS: SortKey[] = ["rating", "experience", "price"];
const PAGE_SIZE = 3;

/* ---------- Ikon kecil (SVG, konsisten dengan design system) ---------- */
function IconSearch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconShield({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconStar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9L12 2.5Z" />
    </svg>
  );
}

function IconPin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-[12px] font-medium text-navy-900">{children}</dd>
    </div>
  );
}

export default function GuideDirectory({ guides = GUIDES }: { guides?: Guide[] }) {
  const t = useTranslations("guides");

  const [query, setQuery] = useState("");
  const [area, setArea] = useState<GuideArea | "all">("all");
  const [lang, setLang] = useState<string>("all");
  const [category, setCategory] = useState<GuideCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("rating");
  const [page, setPage] = useState(1);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  /* Escape + kunci scroll saat modal terbuka */
  useEffect(() => {
    if (!activeGuide) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveGuide(null);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [activeGuide]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = guides.filter((g) => {
      const specialty = t(`people.${g.id}.specialty`).toLowerCase();
      const cert = t(`people.${g.id}.cert`).toLowerCase();
      const focus = t(`people.${g.id}.focus`).toLowerCase();
      const matchQuery =
        !q ||
        g.name.toLowerCase().includes(q) ||
        specialty.includes(q) ||
        cert.includes(q) ||
        focus.includes(q) ||
        g.license.toLowerCase().includes(q);
      const matchArea = area === "all" || g.area === area;
      const matchLang =
        lang === "all" || g.languages.some((l) => l === lang);
      const matchCategory = category === "all" || g.category === category;
      return matchQuery && matchArea && matchLang && matchCategory;
    });

    return [...list].sort((a, b) => {
      if (sort === "experience") return b.years - a.years;
      if (sort === "price") return a.price - b.price;
      return b.rating - a.rating;
    });
  }, [query, area, lang, category, sort, t]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const active: Guide | undefined = activeGuide
    ? guides.find((g) => g.id === activeGuide)
    : undefined;

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      {/* Panel filter (menumpuk di atas hero) */}
      <div className="card relative z-10 -mt-7 p-4 shadow-toba md:p-5">
        <div className="grid gap-3 md:grid-cols-12">
          <label className="relative md:col-span-6">
            <span className="sr-only">{t("filters.searchPlaceholder")}</span>
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              placeholder={t("filters.searchPlaceholder")}
              className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-gold-500"
            />
          </label>

          <label className="md:col-span-3">
            <span className="sr-only">{t("filters.areaAll")}</span>
            <select
              value={area}
              onChange={(e) =>
                resetPage(setArea)((e.target.value || "all") as GuideArea | "all")
              }
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gold-500"
            >
              <option value="all">{t("filters.areaAll")}</option>
              {AREA_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(`filters.areas.${key}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-3">
            <span className="sr-only">{t("filters.langAll")}</span>
            <select
              value={lang}
              onChange={(e) => resetPage(setLang)(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gold-500"
            >
              <option value="all">{t("filters.langAll")}</option>
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
            {t("filters.categoryLabel")}
          </span>
          {(["all", ...CATEGORY_KEYS] as const).map((key) => {
            const selected = category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => resetPage(setCategory)(key)}
                aria-pressed={selected}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  selected
                    ? "bg-navy-900 text-white"
                    : "border border-line bg-white text-ink-soft hover:border-gold-500 hover:text-navy-800"
                }`}
              >
                {t(`categories.${key}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kepala direktori + sortir */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy-900 md:text-2xl">
            {t("directory.title")}
          </h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            {t("directory.subtitle", { count: filtered.length })}
          </p>
        </div>
        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          {t("sort.label")}
          <select
            value={sort}
            onChange={(e) => resetPage(setSort)(e.target.value as SortKey)}
            className="rounded-lg border border-line bg-white px-2.5 py-2 text-[12px] font-semibold normal-case tracking-normal text-navy-900 outline-none focus:border-gold-500"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`sort.${key}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Kartu pemandu */}
      {visible.length > 0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((g) => (
            <article key={g.id} className="card flex flex-col overflow-hidden">
              <div className="relative aspect-[16/10] w-full">
                <Scene variant={g.scene} className="absolute inset-0 h-full w-full" />
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded bg-white/95 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-navy-800 shadow-sm">
                  <IconShield className="h-3 w-3 text-gold-600" />
                  {t("card.officialBadge")}
                </span>
                <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded bg-navy-900/92 px-2 py-1 text-[11px] font-bold text-white">
                  <IconStar className="h-3 w-3 text-gold-500" />
                  {g.rating.toFixed(2)}
                  <span className="text-[10px] font-medium text-navy-200">
                    ({g.reviews})
                  </span>
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-serif text-lg font-bold leading-snug text-navy-900">
                  {g.name}
                </h3>
                <p className="mt-0.5 text-[12px] font-semibold leading-snug text-brand-600">
                  {t(`people.${g.id}.specialty`)}
                </p>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-cream px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                    <IconShield className="h-3 w-3 text-navy-700" />
                    {t("card.license")}: {g.license}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded border border-gold-200/60 bg-gold-50 px-2 py-0.5 text-[10px] font-semibold text-gold-700">
                    🏅 {t(`people.${g.id}.cert`)}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5 border-y border-line py-3">
                  <DetailRow label={t("card.experience")}>
                    {g.years} {t("card.years")}
                  </DetailRow>
                  <DetailRow label={t("card.languages")}>
                    {g.languages.join(" · ")}
                  </DetailRow>
                  <DetailRow label={t("card.focus")}>
                    <span className="inline-flex items-center gap-1">
                      <IconPin className="h-3 w-3 shrink-0 text-brand-600" />
                      {t(`people.${g.id}.focus`)}
                    </span>
                  </DetailRow>
                </dl>

                <blockquote className="mt-3 border-l-2 border-gold-200 pl-3 text-[12px] italic leading-relaxed text-ink-soft">
                  “{t(`people.${g.id}.quote`)}”
                </blockquote>

                <div className="mt-auto pt-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                    {t(`people.${g.id}.tariffLabel`)}
                  </p>
                  <p className="font-serif text-lg font-bold text-brand-600">
                    {formatIDR(g.price)}
                    <span className="ml-1 font-sans text-[11px] font-medium text-ink-soft">
                      {t(`people.${g.id}.tariffNote`)}
                    </span>
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveGuide(g.id)}
                      className="rounded-lg border border-navy-200 px-3 py-2 text-[11px] font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
                    >
                      {t("card.viewProfile")}
                    </button>
                    <Link
                      href={`/pesan?guide=${g.id}`}
                      className="rounded-lg bg-brand-600 px-3 py-2 text-center text-[11px] font-bold text-white transition hover:bg-brand-700"
                    >
                      {t("card.choose")}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="card mt-5 p-8 text-center text-sm text-ink-soft">
          {t("card.empty")}
        </p>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-1.5"
          aria-label={t("directory.title")}
        >
          <button
            type="button"
            onClick={() => setPage(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            aria-label={t("pagination.prev")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-navy-800 transition hover:border-gold-500 disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === safePage ? "page" : undefined}
              aria-label={t("pagination.page", { page: n })}
              className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold transition ${
                n === safePage
                  ? "bg-brand-600 text-white"
                  : "border border-line bg-white text-navy-800 hover:border-gold-500"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(Math.min(pages, safePage + 1))}
            disabled={safePage === pages}
            aria-label={t("pagination.next")}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-navy-800 transition hover:border-gold-500 disabled:opacity-40"
          >
            ›
          </button>
        </nav>
      )}

      {/* Modal profil pemandu */}
      {active && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto bg-navy-950/60 p-4 py-8 backdrop-blur-sm"
          role="presentation"
          onClick={() => setActiveGuide(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="relative h-44 md:h-56">
              <Scene variant={active.scene} className="absolute inset-0 h-full w-full" />
              <div
                className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                aria-label={t("modal.close")}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy-900 shadow transition hover:bg-white"
              >
                ✕
              </button>
              <div className="absolute inset-x-5 bottom-4 text-white">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy-900">
                  <IconShield className="h-3 w-3" />
                  {t("modal.certified")}
                </span>
                <h2
                  id="guide-modal-title"
                  className="mt-1.5 font-serif text-xl font-bold md:text-2xl"
                >
                  {active.name}
                </h2>
                <p className="text-[12px] text-navy-100">
                  {t(`people.${active.id}.specialty`)}
                </p>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-[12px] font-bold text-brand-700">
                  <IconStar className="h-3.5 w-3.5 text-gold-500" />
                  {active.rating.toFixed(2)}
                </span>
                <StarRow value={active.rating} className="text-sm" />
                <span className="text-[11px] text-ink-soft">
                  {t("modal.ratingLabel", {
                    rating: active.rating.toFixed(2),
                    count: active.reviews,
                  })}
                </span>
              </div>

              <dl className="mt-4 grid gap-2.5 rounded-xl bg-cream p-4 sm:grid-cols-2">
                <DetailRow label={t("card.experience")}>
                  {active.years} {t("card.years")}
                </DetailRow>
                <DetailRow label={t("card.license")}>
                  {active.license} · {t(`people.${active.id}.cert`)}
                </DetailRow>
                <DetailRow label={t("card.languages")}>
                  {active.languages.join(" · ")}
                </DetailRow>
                <DetailRow label={t("card.focus")}>
                  {t(`filters.areas.${active.area}`)} — {t(`people.${active.id}.focus`)}
                </DetailRow>
              </dl>

              <blockquote className="mt-4 border-l-2 border-gold-500 pl-3 text-[13px] italic leading-relaxed text-ink">
                “{t(`people.${active.id}.quote`)}”
              </blockquote>

              <div className="mt-5">
                <p className="font-serif text-sm font-bold text-navy-900">
                  {t("modal.availability")}
                </p>
                <AvailabilityCalendar guideId={active.id} />
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                    {t(`people.${active.id}.tariffLabel`)}
                  </p>
                  <p className="font-serif text-xl font-bold text-brand-600">
                    {formatIDR(active.price)}
                    <span className="ml-1 font-sans text-[11px] font-medium text-ink-soft">
                      {t(`people.${active.id}.tariffNote`)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveGuide(null)}
                    className="rounded-lg border border-navy-200 px-4 py-2.5 text-xs font-bold text-navy-800 transition hover:border-gold-500"
                  >
                    {t("modal.close")}
                  </button>
                  <Link
                    href={`/pesan?guide=${active.id}`}
                    className="rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700"
                  >
                    {t("modal.book")}
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-ink-soft">{t("modal.responseNote")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
