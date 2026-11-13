"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DEMO_ORDERS,
  formatIDR,
  getService,
  type DemoOrder,
  type ServiceKey,
} from "@/lib/data";
import type { OrderRow } from "@/lib/supabase";
import { Eyebrow, StarRow } from "@/components/ui";

/** Petakan baris database → bentuk tampilan DemoOrder (Fase 2A). */
function dbToDemo(o: OrderRow): DemoOrder {
  const STATE_OF_STATUS: Record<string, number> = {
    BARU: 0,
    DIKONFIRMASI: 1,
    DITUGASKAN: 2,
    DIJEMPUT: 3,
    SELESAI: 4,
    BATAL: 0,
  };
  return {
    orderNo: o.resi,
    resi: o.resi,
    sealNo: `SLG-${o.resi.slice(-4).padStart(4, "0")}`,
    serviceKey: o.service_key as ServiceKey,
    zone: undefined,
    date: o.date,
    stateIndex: STATE_OF_STATUS[o.status] ?? 0,
    owner: o.name,
    guide: "-",
    luggage: o.suitcases > 0,
  };
}

/** Barcode dummy deterministik dari string resi. */
function Barcode({ seed, className = "" }: { seed: string; className?: string }) {
  let h = 11;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 99991;
  const bars: number[] = [];
  for (let i = 0; i < 48; i++) {
    h = (h * 1103515245 + 12345) % 2147483648;
    bars.push((h >> 7) % 3 + 1);
  }
  return (
    <svg viewBox="0 0 120 24" preserveAspectRatio="none" className={className} aria-hidden="true">
      {bars.map((w, i) => (
        <rect key={i} x={i * 2.5} y="0" width={w} height="24" fill="#1d3a5c" />
      ))}
    </svg>
  );
}

/** Foto mock "4 sisi koper" — SVG sederhana per sisi (aman offline). */
function SealPhoto({ side, seed }: { side: number; seed: string }) {
  const positions = [
    <g key="p"><rect x="40" y="52" width="120" height="26" rx="4" fill="#b03a2e" /><circle cx="112" cy="65" r="4" fill="#f2c94c" /></g>,
    <g key="p"><rect x="88" y="34" width="24" height="60" rx="4" fill="#b03a2e" /><circle cx="100" cy="64" r="4" fill="#f2c94c" /></g>,
    <g key="p"><rect x="40" y="106" width="120" height="14" rx="4" fill="#b03a2e" /><circle cx="150" cy="113" r="4" fill="#f2c94c" /></g>,
    <g key="p"><rect x="40" y="120" width="120" height="10" rx="4" fill="#b03a2e" /><circle cx="52" cy="125" r="3.5" fill="#f2c94c" /></g>,
  ];
  let h = 5;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 65521;
  h += side * 977;
  return (
    <svg viewBox="0 0 200 150" className="h-32 w-full rounded-lg" aria-hidden="true">
      <defs>
        <linearGradient id={`ph-${side}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dce7f2" />
          <stop offset="1" stopColor="#b9cfe4" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#ph-${side})`} />
      {/* koper */}
      <rect x="40" y="30" width="120" height="100" rx="10" fill="#2d547f" />
      <rect x="52" y="42" width="96" height="76" rx="6" fill="#35608d" opacity="0.5" />
      {/* garis segel sesuai sisi */}
      {positions[side % 4]}
      {/* noise deterministik supaya tiap sisi terlihat beda */}
      <circle cx={30 + (h % 14)} cy={20 + (h % 10)} r="3" fill="#ffffff" opacity="0.35" />
      <circle cx={160 - (h % 18)} cy={132 - (h % 12)} r="2.5" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

const TIMELINE_ICONS = ["🧾", "🔒", "🛺", "🏨"];

export default function StatusLookup({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const t = useTranslations("status");
  const ts = useTranslations("services");
  const tc = useTranslations("common");
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<DemoOrder | null | undefined>(
    initialQuery ? undefined : undefined,
  );

  async function search(q: string) {
    const s = q.trim().toUpperCase();
    // 1) Coba database live (Fase 2A)
    try {
      const res = await fetch(`/api/orders?resi=${encodeURIComponent(s)}`);
      if (res.ok) {
        const data = (await res.json()) as { order: OrderRow };
        setResult(dbToDemo(data.order));
        return;
      }
      // 404 = resi tidak ada di database → tampilkan tidak ditemukan
      if (res.status === 404) {
        setResult(null);
        return;
      }
      // 503 = database belum dikonfigurasi → lanjut ke fallback demo
    } catch {
      /* koneksi gagal → fallback demo */
    }
    // 2) Fallback: data demo Fase 1
    const found = DEMO_ORDERS.find(
      (o) => o.orderNo === s || o.resi === s || o.sealNo === s,
    );
    setResult(found ?? null);
  }

  const firstSearch = () => void search(query);

  // Pencarian awal jika dibuka dengan ?q=…
  useEffect(() => {
    if (initialQuery) void search(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Tampilan hasil ---------- */
  if (result) {
    // stateIndex 0..4 → langkah timeline 0..3
    const stepOfState = [0, 0, 1, 2, 3][Math.min(4, Math.max(0, result.stateIndex))];
    const service = getService(result.serviceKey);

    return (
      <div className="space-y-6">
        {/* Kartu utama */}
        <div className="overflow-hidden rounded-2xl bg-navy-900 text-white shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-navy-800 px-5 py-3">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500" />
              </span>
              {t("hero.liveBadge")}
            </span>
            <span className="rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {t("badge")}
            </span>
          </div>
          <div className="grid gap-4 px-5 py-5 md:grid-cols-[auto_1fr]">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-brand-600 text-2xl" aria-hidden="true">
              🧳
            </div>
            <div>
              <p className="font-mono text-lg font-extrabold tracking-wider text-gold-200">
                {result.resi}
              </p>
              <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-navy-100 sm:grid-cols-3">
                <p>
                  <span className="text-navy-200">{t("hero.owner")}: </span>
                  <span className="font-semibold text-white">{result.owner}</span>
                </p>
                <p>
                  <span className="text-navy-200">{t("hero.route")}: </span>
                  <span className="font-semibold text-white">Tomok → Tuk Tuk</span>
                </p>
                <p>
                  <span className="text-navy-200">{t("hero.etaLabel")}: </span>
                  <span className="font-semibold text-white">{result.date}</span>
                </p>
              </div>
              <p className="mt-2 inline-block rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-900">
                {t(`timeline.steps.${stepOfState}.title`)}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline 4 langkah */}
        <section className="card p-5 md:p-6">
          <ol className="grid gap-4 md:grid-cols-4">
            {(["0", "1", "2", "3"] as const).map((i) => {
              const idx = Number(i);
              const done = idx < stepOfState;
              const current = idx === stepOfState;
              return (
                <li
                  key={i}
                  className={`rounded-xl border p-4 ${
                    current
                      ? "border-gold-500 bg-gold-50"
                      : done
                        ? "border-line bg-white"
                        : "border-line bg-cream opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-sm ${
                        done || current
                          ? "bg-navy-900 text-white"
                          : "bg-navy-50 text-ink-soft"
                      }`}
                      aria-hidden="true"
                    >
                      {done ? "✓" : TIMELINE_ICONS[idx]}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                      {t(`timeline.steps.${i}.title`)}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                    {t(`timeline.steps.${i}.desc`)}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Kurir & pemandu */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-navy-800 text-lg" aria-hidden="true">
              🛺
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                {t("crew.courier")}
              </p>
              <p className="font-serif text-base font-bold text-navy-900">Bang Oloan H.</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <StarRow value={5} className="text-xs" />
                <span className="text-[11px] font-semibold text-ink-soft">{t("crew.rating")}</span>
              </div>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-lg" aria-hidden="true">
              🎓
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                {t("crew.guideLabel")}
              </p>
              {result.guide !== "-" ? (
                <>
                  <p className="font-serif text-base font-bold text-navy-900">{result.guide}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-soft">
                    <span className="rounded bg-cream px-1.5 py-0.5 font-mono text-[10px] font-bold text-navy-800">
                      {t("crew.guideLicense")}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-ink-soft">—</p>
              )}
            </div>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-brand-700"
            >
              {t("crew.contact")}
            </a>
          </div>
        </section>

        {/* Foto segel 4 sisi */}
        <section className="card p-5 md:p-6">
          <Eyebrow icon="📸">{t("seals.eyebrow")}</Eyebrow>
          <h2 className="mt-3 font-serif text-xl font-bold text-navy-900">
            {t("seals.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] text-ink-soft">
            {t("seals.subtitle")}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["0", "1", "2", "3"] as const).map((i) => (
              <figure key={i} className="overflow-hidden rounded-xl border border-line bg-white">
                <div className="relative">
                  <SealPhoto side={Number(i)} seed={result.sealNo} />
                  <span className="absolute left-2 top-2 rounded-full bg-navy-900/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-200">
                    {t(`seals.sides.${i}.label`)}
                  </span>
                </div>
                <figcaption className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-navy-900">{t(`seals.sides.${i}.title`)}</p>
                    <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-700">
                      ✓ {t(`seals.sides.${i}.chip`)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                    {t(`seals.sides.${i}.desc`)}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-navy-200 px-3.5 py-2 text-[11px] font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
            >
              🔍 {t("seals.refreshCta")}
            </button>
            <button
              type="button"
              className="rounded-lg border border-brand-100 bg-brand-50 px-3.5 py-2 text-[11px] font-bold text-brand-700 transition hover:bg-brand-100"
            >
              🚨 {t("seals.reportCta")}
            </button>
          </div>
          <p className="mt-4 rounded-xl bg-cream p-3.5 text-[11px] leading-relaxed text-ink-soft">
            {t("seals.note")}
          </p>
        </section>

        {/* Rute */}
        <section className="card p-5 md:p-6">
          <h2 className="font-serif text-lg font-bold text-navy-900">{t("route.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="rounded-xl border border-line p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                {t("route.origin.label")}
              </p>
              <p className="mt-1 font-serif text-sm font-bold text-navy-900">
                {t("route.origin.name")}
              </p>
              <p className="mt-1 text-[11px] text-ink-soft">{t("route.origin.desc")}</p>
            </div>
            <span className="mx-auto text-2xl text-gold-600" aria-hidden="true">
              ➜
            </span>
            <div className="rounded-xl border border-line p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                {t("route.dest.label")}
              </p>
              <p className="mt-1 font-serif text-sm font-bold text-navy-900">
                {t("route.dest.name")}
              </p>
              <p className="mt-1 text-[11px] text-ink-soft">{t("route.dest.desc")}</p>
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink">
            📌 {t("route.instructions")}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-ink">
            🌧️ {t("route.weather")}
          </p>
        </section>

        {/* Rincian biaya */}
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-5 py-3">
            <h2 className="font-serif text-sm font-bold text-navy-900">{t("cost.title")}</h2>
            <span className="rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-900">
              {t("cost.statusLunas")}
            </span>
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-[1fr_240px]">
            <div>
              <ul className="space-y-3">
                {(["0", "1", "2"] as const).map((i) => (
                  <li key={i} className="flex items-start justify-between gap-3 text-xs">
                    <span>
                      <span className="block font-bold text-navy-900">{t(`cost.items.${i}.title`)}</span>
                      <span className="block text-[11px] text-ink-soft">{t(`cost.items.${i}.desc`)}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-navy-900">
                      {i === "2" ? formatIDR(service.price) : tc("included")}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("cost.totalLabel")}
                </span>
                <span className="text-lg font-extrabold text-brand-600">
                  {formatIDR(service.price)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-ink-soft">
                {t("cost.methodLabel")}: Transfer Bank BCA
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-cream p-4 text-center">
              <Barcode seed={result.resi} className="h-10 w-full max-w-[180px]" />
              <p className="mt-2 font-mono text-xs font-bold tracking-wider text-navy-900">
                {result.resi}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {t("cost.barcodeLabel")}
              </p>
            </div>
          </div>
        </section>

        {/* Kartu bantuan */}
        <section className="rounded-2xl bg-navy-900 p-5 text-white md:p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="font-serif text-base font-bold">{t("helpCard.title")}</h2>
              <p className="mt-1 max-w-xl text-[13px] text-navy-100">{t("helpCard.desc")}</p>
              <p className="mt-2 font-mono text-sm font-bold text-gold-200">{t("helpCard.phone")}</p>
            </div>
            <a
              href="https://wa.me/6281234567890?text=Halo%2C%20saya%20butuh%20bantuan%20resi"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gold-500 px-5 py-2.5 text-xs font-bold text-navy-900 transition hover:bg-gold-600 hover:text-white"
            >
              💬 {t("helpCard.whatsapp")}
            </a>
          </div>
        </section>

        {/* Catatan + aksi bawah */}
        <p className="rounded-xl bg-cream px-4 py-3 text-[11px] text-ink-soft">
          ℹ️ {t("manualNote")} — {t("demoNote")}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResult(undefined);
            }}
            className="rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-xs font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
          >
            {t("otherCta")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-xs font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
          >
            ⬇ {t("downloadCta")}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Tampilan pencarian ---------- */
  return (
    <div>
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && firstSearch()}
          placeholder={t("placeholder")}
          className="flex-1 rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold-500"
        />
        <button
          type="button"
          onClick={firstSearch}
          className="rounded-lg bg-navy-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-800"
        >
          {t("search")}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-soft">
        <span>{t("resiHint")}</span>
        <button
          type="button"
          onClick={() => {
            setQuery(DEMO_ORDERS[0].orderNo);
            search(DEMO_ORDERS[0].orderNo);
          }}
          className="rounded-full border border-gold-200 bg-white px-2.5 py-1 font-bold text-gold-700 hover:bg-gold-50"
        >
          {t("sample")}
        </button>
      </div>

      {result === null && (
        <p className="card mt-6 border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {t("notFound")}
        </p>
      )}
    </div>
  );
}
