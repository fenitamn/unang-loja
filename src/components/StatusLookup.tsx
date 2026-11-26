"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatIDR, type ServiceKey } from "@/lib/data";
import { Eyebrow } from "@/components/ui";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bca: "Transfer BCA",
  bsi: "Transfer BSI",
  gopay: "GoPay",
  ovo: "OVO",
  dana: "DANA",
};

const CHECKPOINT_ICONS = ["🧾", "💳", "🔐", "🛺", "🏨", "✅"];

type TrackedOrder = {
  orderNo: string;
  resi: string;
  sealNo: string;
  serviceKey: ServiceKey;
  zone?: string;
  date: string;
  owner: string;
  guide: string;
  guideName: string | null;
  total: number;
  paymentStatus: string;
  paymentMethod: string | null;
  meetingPoint: string;
  status: string;
  suitcases: number;
  participants: number;
  checkpoint: number;
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

const STATUS_TO_CHECKPOINT: Record<string, number> = {
  BARU: 0,
  DIKONFIRMASI: 1,
  DITUGASKAN: 2,
  DIJEMPUT: 3,
  SELESAI: 5,
  BATAL: 0,
};

/** Petakan data API pelacakan → bentuk tampilan. */
function toTracked(o: TrackPayload): TrackedOrder {
  let checkpoint = STATUS_TO_CHECKPOINT[o.status] ?? 0;
  if (o.payment_status === "PAID" && checkpoint < 1) checkpoint = 1;
  if (o.seal_code && checkpoint < 2) checkpoint = 2;
  if (o.status === "DIJEMPUT") checkpoint = 3;
  if (o.status === "SELESAI") checkpoint = 5;
  return {
    orderNo: o.resi,
    resi: o.resi,
    sealNo: o.seal_code ?? "",
    serviceKey: o.service_key as ServiceKey,
    zone: o.zone ?? undefined,
    date: o.date,
    owner: o.name,
    guide: o.guide_name ?? "-",
    guideName: o.guide_name,
    total: o.total,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    meetingPoint: o.meeting_point,
    status: o.status,
    suitcases: o.suitcases,
    participants: o.participants,
    checkpoint,
  };
}

/** Barcode deterministik dari string resi (bukan barcode pembayaran). */
function Barcode({ seed, className = "" }: { seed: string; className?: string }) {
  let h = 11;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 99991;
  const bars: number[] = [];
  for (let i = 0; i < 48; i++) {
    h = (h * 1103515245 + 12345) % 2147483648;
    bars.push(((h >> 7) % 3) + 1);
  }
  return (
    <svg viewBox="0 0 120 24" preserveAspectRatio="none" className={className} aria-hidden="true">
      {bars.map((w, i) => (
        <rect key={i} x={i * 2.5} y="0" width={w} height="24" fill="#1d3a5c" />
      ))}
    </svg>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

/** Ilustrasi rute operasional — bukan peta GPS real-time. */
function RouteMap({ origin }: { origin: string }) {
  const t = useTranslations("status");
  return (
    <div className="relative mt-3 h-44 overflow-hidden rounded-xl border border-line bg-[#dce8ea]">
      <svg viewBox="0 0 400 180" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M0 130 Q60 90 120 112 T235 86 T330 104 T400 60" fill="none" stroke="#b9d0d3" strokeWidth="26" />
        <path d="M0 130 Q60 90 120 112 T235 86 T330 104 T400 60" fill="none" stroke="#f7f4ec" strokeWidth="14" />
        <path
          d="M25 126 Q70 95 125 108 T230 87 T330 102 T378 64"
          fill="none"
          stroke="#ab3333"
          strokeWidth="2.5"
          strokeDasharray="6 5"
        />
        <circle cx="25" cy="126" r="7" fill="#1d3a5c" />
        <circle cx="25" cy="126" r="3" fill="#f7f4ec" />
        <circle cx="378" cy="64" r="7" fill="#ab3333" />
        <circle cx="378" cy="64" r="3" fill="#fff" />
      </svg>
      <span className="absolute left-3 top-3 max-w-[45%] rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-navy-900 shadow-sm">
        📍 {origin}
      </span>
      <span className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-navy-900 shadow-sm">
        🏨 {t("route.dest.name")}
      </span>
      <span className="absolute bottom-2 left-3 rounded-full bg-navy-900/85 px-2 py-0.5 text-[9px] text-white">
        {t("mapNote")}
      </span>
    </div>
  );
}

export default function StatusLookup({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const t = useTranslations("status");
  const ts = useTranslations("services");
  const locale = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<TrackedOrder | null | undefined>(undefined);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function search(q: string) {
    const s = q.trim().toUpperCase();
    if (!s) return;
    setLoading(true);
    setUnavailable(false);
    try {
      const res = await fetch(`/api/track?resi=${encodeURIComponent(s)}`);
      if (res.ok) {
        const data = (await res.json()) as { order: TrackPayload };
        setResult(toTracked(data.order));
        return;
      }
      if (res.status === 401) {
        window.location.assign(
          `/${locale}/masuk?next=${encodeURIComponent(
            window.location.pathname + window.location.search,
          )}`,
        );
        return;
      }
      if (res.status === 404) {
        setResult(null);
        return;
      }
      setUnavailable(true);
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }

  const firstSearch = () => void search(query);

  // Pencarian awal jika dibuka dengan ?q=… atau ?resi=…
  useEffect(() => {
    if (initialQuery) void search(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyResi() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.resi);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  /* ---------- Tampilan hasil ---------- */
  if (result) {
    const completed = result.status === "SELESAI";
    const statusLabel = t(`statusLabels.${result.status}`);
    const serviceLabel = ts(`items.${result.serviceKey}.name`);
    const paymentLabel = t(`payment.${result.paymentStatus}`);
    const methodLabel = result.paymentMethod
      ? PAYMENT_METHOD_LABEL[result.paymentMethod] ?? result.paymentMethod
      : "—";
    const checkoutText = `Halo admin UNANG LOJA, saya ingin bertanya tentang resi ${result.resi}.`;
    const waHref = `https://wa.me/6285143180788?text=${encodeURIComponent(checkoutText)}`;

    return (
      <div className="space-y-6">
        {/* Header resi + tindakan */}
        <div className="overflow-hidden rounded-2xl bg-navy-900 text-white shadow-xl shadow-navy-900/15">
          <div className="ulos-stripe" aria-hidden="true" />
          <div className="p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-300">
                  {t("voucher.label")} · UNANG LOJA
                </p>
                <p className="mt-1 font-mono text-2xl font-extrabold tracking-wider text-gold-200 md:text-3xl">
                  {result.resi}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-950">
                    {statusLabel}
                  </span>
                  <span className="rounded-full border border-navy-700 bg-navy-800 px-3 py-1 text-[10px] font-semibold text-navy-100">
                    {paymentLabel}
                  </span>
                  <span className="text-[10px] text-navy-200">{t("manualNote")}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResi}
                  className="rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-[11px] font-bold text-white transition hover:border-gold-500"
                >
                  {copied ? `✓ ${t("copied")}` : `⧉ ${t("copy")}`}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg bg-gold-500 px-3 py-2 text-[11px] font-bold text-navy-950 transition hover:bg-gold-400"
                >
                  ⬇ {t("downloadCta")}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-2 border-t border-navy-800 pt-4 text-xs sm:grid-cols-3">
              <p>
                <span className="text-navy-300">{t("hero.owner")}: </span>
                <span className="font-semibold text-white">{result.owner}</span>
              </p>
              <p>
                <span className="text-navy-300">{t("hero.route")}: </span>
                <span className="font-semibold text-white">{result.meetingPoint}</span>
              </p>
              <p>
                <span className="text-navy-300">{t("hero.serviceDate")}: </span>
                <span className="font-semibold text-white">{formatDate(result.date)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {/* Timeline 6 checkpoint */}
            <section className="card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Eyebrow icon="📍">{t("badge")}</Eyebrow>
                  <h2 className="mt-2 font-serif text-xl font-bold text-navy-900">
                    {t("timelineTitle")}
                  </h2>
                  <p className="mt-1 text-[12px] text-ink-soft">{t("timelineDesc")}</p>
                </div>
                <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  {result.checkpoint + 1}/6
                </span>
              </div>

              <ol className="relative mt-5 space-y-1.5">
                {(["0", "1", "2", "3", "4", "5"] as const).map((i) => {
                  const idx = Number(i);
                  const done = completed || idx < result.checkpoint;
                  const current = !completed && idx === result.checkpoint;
                  const waiting = !done && !current;
                  return (
                    <li key={i} className="relative flex gap-3 pb-3 last:pb-0">
                      {idx < 5 && (
                        <span
                          aria-hidden="true"
                          className={`absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 ${
                            done ? "bg-gold-500" : "bg-line"
                          }`}
                        />
                      )}
                      <span
                        className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm ${
                          done
                            ? "bg-gold-500 text-navy-950"
                            : current
                              ? "bg-brand-600 text-white ring-4 ring-brand-100"
                              : "bg-cream text-ink-soft"
                        }`}
                        aria-hidden="true"
                      >
                        {done ? "✓" : CHECKPOINT_ICONS[idx]}
                      </span>
                      <div
                        className={`min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 ${
                          current
                            ? "border-brand-200 bg-brand-50"
                            : done
                              ? "border-line bg-white"
                              : "border-line bg-cream/60"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <p className={`text-[12px] font-bold ${waiting ? "text-ink-soft" : "text-navy-900"}`}>
                            {t(`checkpoints.${i}.title`)}
                          </p>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wide ${
                              done ? "text-gold-700" : current ? "text-brand-600" : "text-ink-soft"
                            }`}
                          >
                            {done
                              ? t("checkpointDone")
                              : current
                                ? t("checkpointCurrent")
                                : t("checkpointWaiting")}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">
                          {t(`checkpoints.${i}.desc`)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Rute */}
            <section className="card p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-lg font-bold text-navy-900">{t("route.title")}</h2>
                <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                  {serviceLabel}
                </span>
              </div>
              <RouteMap origin={result.meetingPoint} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                    {t("route.origin.label")}
                  </p>
                  <p className="mt-1 font-serif text-sm font-bold text-navy-900">{result.meetingPoint}</p>
                  <p className="mt-0.5 text-[10px] text-ink-soft">{t("route.origin.desc")}</p>
                </div>
                <div className="rounded-xl border border-line p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                    {t("route.dest.label")}
                  </p>
                  <p className="mt-1 font-serif text-sm font-bold text-navy-900">{t("route.dest.name")}</p>
                  <p className="mt-0.5 text-[10px] text-ink-soft">{t("destinationNote")}</p>
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
                ℹ️ {t("route.instructions")}
              </p>
            </section>

            {/* Segel 4 sisi */}
            <section className="card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Eyebrow icon="🔐">{t("seals.eyebrow")}</Eyebrow>
                  <h2 className="mt-2 font-serif text-lg font-bold text-navy-900">{t("seals.title")}</h2>
                </div>
                {result.sealNo && (
                  <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                    ✓ {t("crew.sealVerified")}
                  </span>
                )}
              </div>
              {result.sealNo ? (
                <>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold-200 bg-gold-50 px-3.5 py-2.5">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-gold-700">
                        {t("seals.codeLabel")}
                      </p>
                      <p className="font-mono text-base font-bold text-navy-900">{result.sealNo}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-gold-700">4/4 {t("seals.title")}</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {(["0", "1", "2", "3"] as const).map((i) => (
                      <div key={i} className="rounded-lg border border-line bg-white p-3">
                        <div className="flex items-center gap-2">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-green-600 text-[9px] text-white">
                            ✓
                          </span>
                          <p className="text-[11px] font-bold text-navy-900">{t(`seals.sides.${i}.title`)}</p>
                        </div>
                        <p className="mt-1 text-[10px] leading-relaxed text-ink-soft">
                          {t(`seals.sides.${i}.desc`)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] leading-relaxed text-ink-soft">
                    {t("seals.note", { code: result.sealNo })}
                  </p>
                </>
              ) : (
                <p className="mt-3 rounded-xl bg-cream px-3.5 py-2.5 text-[11px] leading-relaxed text-ink-soft">
                  {t("seals.notSealed")}
                </p>
              )}
            </section>

            {/* Biaya */}
            <section className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-5 py-3">
                <h2 className="font-serif text-sm font-bold text-navy-900">{t("cost.title")}</h2>
                <span className="rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-900">
                  {paymentLabel}
                </span>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-[1fr_180px]">
                <div>
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <span className="font-bold text-navy-900">{t("cost.serviceLine")}</span>
                    <span className="shrink-0 font-semibold text-navy-900">{formatIDR(result.total)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                      {result.paymentStatus === "PAID" ? t("cost.totalLabel") : t("cost.totalDueLabel")}
                    </span>
                    <span className="text-lg font-extrabold text-brand-600">{formatIDR(result.total)}</span>
                  </div>
                  <dl className="mt-2 space-y-1 text-[11px] text-ink-soft">
                    <div className="flex justify-between gap-2">
                      <dt>{t("cost.methodLabel")}</dt>
                      <dd className="font-semibold text-navy-900">{methodLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>{t("cost.paymentStatus")}</dt>
                      <dd className="font-semibold text-navy-900">{paymentLabel}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl bg-cream p-3 text-center">
                  <Barcode seed={result.resi} className="h-9 w-full max-w-[160px]" />
                  <p className="mt-1 font-mono text-[10px] font-bold tracking-wider text-navy-900">
                    {result.resi}
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                    {t("cost.barcodeLabel")}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Kolom kanan */}
          <aside className="space-y-4">
            <section className="card p-5">
              <h2 className="font-serif text-base font-bold text-navy-900">{t("summary.title")}</h2>
              <dl className="mt-3 space-y-2.5 text-[11px]">
                {[
                  [t("summary.order"), result.resi, true],
                  [t("summary.customer"), result.owner, false],
                  [t("summary.service"), serviceLabel, false],
                  [t("summary.schedule"), `${formatDate(result.date)} · ${result.suitcases}🧳`, false],
                  [t("summary.bags"), `${result.suitcases} koper · ${result.participants} peserta`, false],
                  [t("summary.seal"), result.sealNo || "—", true],
                  [t("summary.guide"), result.guideName || t("crew.guideUnassigned"), false],
                ].map(([label, value, mono]) => (
                  <div key={String(label)} className="flex items-start justify-between gap-3 border-b border-line/70 pb-2 last:border-0 last:pb-0">
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className={`max-w-[170px] text-right font-semibold text-navy-900 ${mono ? "font-mono text-[10px]" : ""}`}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Voucher resi digital — tanpa tombol kembali di dalam kartu */}
            <section className="card overflow-hidden">
              <div className="bg-navy-900 px-4 py-3 text-white">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-gold-300">
                  {t("voucher.label")}
                </p>
                <p className="mt-0.5 font-serif text-sm font-bold">{t("voucher.title")}</p>
              </div>
              <div className="p-4">
                <div className="rounded-lg bg-cream p-3 text-center">
                  <Barcode seed={result.resi} className="mx-auto h-10 w-full max-w-[170px]" />
                  <p className="mt-1 font-mono text-[11px] font-bold tracking-wider text-navy-900">
                    {result.resi}
                  </p>
                </div>
                <dl className="mt-3 space-y-1.5 text-[10px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("voucher.issued")}</dt>
                    <dd className="text-right font-semibold text-navy-900">{result.owner}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("voucher.service")}</dt>
                    <dd className="text-right font-semibold text-navy-900">{serviceLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("voucher.schedule")}</dt>
                    <dd className="text-right font-semibold text-navy-900">{formatDate(result.date)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-soft">{t("voucher.bags")}</dt>
                    <dd className="text-right font-semibold text-navy-900">{result.suitcases}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-line pt-1.5">
                    <dt className="font-bold text-navy-900">{t("voucher.total")}</dt>
                    <dd className="font-extrabold text-brand-600">{formatIDR(result.total)}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-3 w-full rounded-lg bg-navy-900 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-navy-800"
                >
                  ⬇ {t("receiptPrint")}
                </button>
                <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">{t("voucher.note")}</p>
              </div>
            </section>

            <section className="rounded-2xl bg-navy-900 p-5 text-white">
              <h2 className="font-serif text-sm font-bold">{t("helpCard.title")}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-navy-100">{t("helpCard.desc")}</p>
              <p className="mt-2 font-mono text-xs font-bold text-gold-200">{t("helpCard.phone")}</p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block rounded-lg bg-gold-500 px-3 py-2 text-center text-[11px] font-bold text-navy-950 transition hover:bg-gold-400"
              >
                💬 {t("helpCard.whatsapp")}
              </a>
            </section>
          </aside>
        </div>

        <p className="rounded-xl bg-cream px-4 py-3 text-[11px] text-ink-soft">ℹ️ {t("manualNote")}</p>

        <div className="flex flex-wrap gap-2">
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
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            💬 {t("crew.contact")}
          </a>
        </div>

        {/* Hanya untuk cetak PDF */}
        <div className="print-receipt">
          <div className="mx-auto max-w-2xl border border-[#d8d2c4] p-8 text-[#16243a]">
            <div className="flex items-start justify-between border-b border-[#d8d2c4] pb-4">
              <div>
                <p className="font-serif text-2xl font-bold tracking-wide">UNANG LOJA</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#a87f17]">
                  {t("voucher.label")} · {t("voucher.title")}
                </p>
              </div>
              <div className="text-right text-[10px] leading-relaxed">
                <p className="font-bold">Samosir · Danau Toba</p>
                <p>+62 812-6800-8622</p>
                <p>admin@unangloja.id</p>
              </div>
            </div>
            <div className="mt-5 flex items-start justify-between gap-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#6b7280]">
                  {t("summary.order")}
                </p>
                <p className="mt-1 font-mono text-xl font-bold">{result.resi}</p>
                <p className="mt-3 text-[10px] text-[#6b7280]">{t("voucher.issued")}</p>
                <p className="text-sm font-semibold">{result.owner}</p>
                <p className="text-[11px]">{result.meetingPoint}</p>
              </div>
              <div className="w-36">
                <Barcode seed={result.resi} className="h-10 w-full" />
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 border-y border-[#d8d2c4] py-4 text-[11px]">
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("voucher.service")}</dt>
                <dd className="font-semibold">{serviceLabel}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("voucher.route")}</dt>
                <dd className="font-semibold">{result.meetingPoint} → {t("route.dest.name")}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("voucher.schedule")}</dt>
                <dd className="font-semibold">{formatDate(result.date)}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("voucher.bags")}</dt>
                <dd className="font-semibold">{result.suitcases} koper · {result.participants} peserta</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("voucher.seal")}</dt>
                <dd className="font-semibold">{result.sealNo || "—"}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("voucher.payment")}</dt>
                <dd className="font-semibold">{methodLabel} · {paymentLabel}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-[#16243a] pt-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">{t("voucher.total")}</span>
              <span className="text-lg font-bold">{formatIDR(result.total)}</span>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-[#6b7280]">{t("voucher.note")}</p>
            <p className="mt-6 border-t border-[#d8d2c4] pt-3 text-center text-[9px] text-[#6b7280]">
              UNANG LOJA · Samosir, Danau Toba · +62 812-6800-8622
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Tampilan pencarian ---------- */
  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="bg-navy-900 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500 text-lg text-navy-950">
              📍
            </span>
            <div>
              <p className="font-serif text-base font-bold">{t("timelineTitle")}</p>
              <p className="text-[10px] text-navy-200">{t("resiHint")}</p>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-5">
          <div className="flex flex-col gap-2 sm:flex-row">
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
              disabled={loading}
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? t("searching") : t("search")}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold text-ink-soft">
              🔄 {t("manualNote")}
            </span>
            <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold text-ink-soft">
              🔐 {t("seals.eyebrow")}
            </span>
            <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold text-ink-soft">
              💬 {t("helpCard.whatsapp")}
            </span>
          </div>
        </div>
      </div>

      {result === null && (
        <p className="card border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">{t("notFound")}</p>
      )}
      {unavailable && (
        <p className="card border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-700">{t("unavailable")}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["🧾", t("checkpoints.0.title"), t("checkpoints.0.desc")],
          ["🔐", t("checkpoints.2.title"), t("checkpoints.2.desc")],
          ["🏨", t("checkpoints.4.title"), t("checkpoints.4.desc")],
        ].map(([icon, title, desc]) => (
          <div key={String(title)} className="card p-4">
            <span className="text-lg" aria-hidden="true">{icon}</span>
            <p className="mt-2 text-[12px] font-bold text-navy-900">{title}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-ink-soft">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
