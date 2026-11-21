"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  formatIDR,
  type DemoOrder,
  type ServiceKey,
} from "@/lib/data";
import { Eyebrow } from "@/components/ui";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bca: "Transfer BCA",
  bsi: "Transfer BSI",
  gopay: "GoPay",
  ovo: "OVO",
  dana: "DANA",
  qris: "QRIS",
  cash: "Tunai di loket",
};

type TrackedOrder = DemoOrder & {
  guideName: string | null;
  total: number;
  paymentStatus: string;
  paymentMethod: string | null;
  meetingPoint: string;
};

type TrackPayload = {
  resi: string;
  status: string;
  payment_status: string;
  service_key: string;
  date: string;
  meeting_point: string;
  zone: string | null;
  suitcases: number;
  participants: number;
  name: string;
  seal_code: string | null;
  guide_name: string | null;
  total: number;
  payment_method: string | null;
};

/** Petakan data API pelacakan → bentuk tampilan. */
function toTracked(o: TrackPayload): TrackedOrder {
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
    sealNo: o.seal_code ?? "",
    serviceKey: o.service_key as ServiceKey,
    zone: undefined,
    date: o.date,
    stateIndex: STATE_OF_STATUS[o.status] ?? 0,
    owner: o.name,
    guide: o.guide_name ?? "-",
    luggage: o.suitcases > 0,
    guideName: o.guide_name,
    total: o.total,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    meetingPoint: o.meeting_point,
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

const TIMELINE_ICONS = ["🧾", "🔒", "🛺", "🏨"];

export default function StatusLookup({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const t = useTranslations("status");
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<TrackedOrder | null | undefined>(undefined);
  const [unavailable, setUnavailable] = useState(false);

  async function search(q: string) {
    const s = q.trim().toUpperCase();
    setUnavailable(false);
    try {
      const res = await fetch(`/api/track?resi=${encodeURIComponent(s)}`);
      if (res.ok) {
        const data = (await res.json()) as { order: TrackPayload };
        setResult(toTracked(data.order));
        return;
      }
      if (res.status === 404) {
        setResult(null);
        return;
      }
      setUnavailable(true);
    } catch {
      setUnavailable(true);
    }
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
                  <span className="font-semibold text-white">{result.meetingPoint}</span>
                </p>
                <p>
                  <span className="text-navy-200">{t("hero.serviceDate")}: </span>
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

        {/* Segel & pemandu */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-navy-800 text-lg" aria-hidden="true">
              🔒
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                {t("crew.sealLabel")}
              </p>
              {result.sealNo ? (
                <>
                  <p className="font-mono text-base font-bold text-navy-900">{result.sealNo}</p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">{t("crew.sealVerified")}</p>
                </>
              ) : (
                <p className="text-[12px] text-ink-soft">{t("seals.notSealed")}</p>
              )}
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
              {result.guideName ? (
                <>
                  <p className="font-serif text-base font-bold text-navy-900">{result.guideName}</p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">{t("crew.guideLicense")}</p>
                </>
              ) : (
                <p className="text-[12px] text-ink-soft">{t("crew.guideUnassigned")}</p>
              )}
            </div>
            <a
              href={`https://wa.me/6281268008622?text=${encodeURIComponent(`Halo admin UNANG LOJA, saya ingin bertanya tentang resi ${result.resi}.`)}`}
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
          {result.sealNo ? (
            <>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gold-700">
                    {t("seals.codeLabel")}
                  </p>
                  <p className="font-mono text-lg font-bold text-navy-900">{result.sealNo}</p>
                </div>
                <span className="rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-900">
                  ✓ {t("badge")}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(["0", "1", "2", "3"] as const).map((i) => (
                  <div key={i} className="rounded-xl border border-line bg-white p-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-900 text-[10px] font-bold text-white">
                        ✓
                      </span>
                      <p className="text-xs font-bold text-navy-900">{t(`seals.sides.${i}.title`)}</p>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                      {t(`seals.sides.${i}.desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-xl border border-line bg-cream px-4 py-3 text-sm leading-relaxed text-ink-soft">
              {t("seals.notSealed")}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void search(result.resi)}
              className="rounded-lg border border-navy-200 px-3.5 py-2 text-[11px] font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
            >
              🔄 {t("seals.refreshCta")}
            </button>
            <a
              href={`https://wa.me/6281268008622?text=${encodeURIComponent(`Halo admin UNANG LOJA, saya ingin melaporkan masalah segel untuk resi ${result.resi}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-brand-100 bg-brand-50 px-3.5 py-2 text-[11px] font-bold text-brand-700 transition hover:bg-brand-100"
            >
              🚨 {t("seals.reportCta")}
            </a>
          </div>
          {result.sealNo && (
            <p className="mt-4 rounded-xl bg-cream p-3.5 text-[11px] leading-relaxed text-ink-soft">
              {t("seals.note", { code: result.sealNo })}
            </p>
          )}
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
                {result.meetingPoint}
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
              {t(`payment.${result.paymentStatus}`)}
            </span>
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-[1fr_240px]">
            <div>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start justify-between gap-3">
                  <span className="font-bold text-navy-900">{t("cost.serviceLine")}</span>
                  <span className="shrink-0 font-semibold text-navy-900">{formatIDR(result.total)}</span>
                </li>
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                  {result.paymentStatus === "PAID"
                    ? t("cost.totalLabel")
                    : t("cost.totalDueLabel")}
                </span>
                <span className="text-lg font-extrabold text-brand-600">
                  {formatIDR(result.total)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-ink-soft">
                {t("cost.methodLabel")}:{" "}
                {result.paymentMethod ? PAYMENT_METHOD_LABEL[result.paymentMethod] ?? result.paymentMethod : "—"}
              </p>
              <p className="mt-1 text-[11px] text-ink-soft">
                {t("cost.paymentStatus")}: {t(`payment.${result.paymentStatus}`)}
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
              href="https://wa.me/6281268008622?text=Halo%2C%20saya%20butuh%20bantuan%20resi"
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
          ℹ️ {t("manualNote")}
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
            onClick={() => window.print()}
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
      </div>

      {result === null && (
        <p className="card mt-6 border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {t("notFound")}
        </p>
      )}
      {unavailable && (
        <p className="card mt-6 border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-700">
          {t("unavailable")}
        </p>
      )}
    </div>
  );
}
