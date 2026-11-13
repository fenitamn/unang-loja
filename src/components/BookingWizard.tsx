"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CROSS_SELL,
  MEETING_POINTS,
  PAYMENT_METHODS,
  SERVICES,
  UPSELL,
  formatIDR,
  getService,
  type MysteryTheme,
  type PaymentMethodKey,
  type ServiceKey,
  type ZoneKey,
} from "@/lib/data";
import { Eyebrow } from "@/components/ui";

interface FormState {
  serviceKey: ServiceKey | null;
  theme: MysteryTheme | null;
  addOns: ServiceKey[];
  date: string;
  meetingPoint: string;
  zone: ZoneKey | null;
  suitcases: number;
  participants: number;
  notes: string;
  name: string;
  phone: string;
  email: string;
  referral: string;
  method: PaymentMethodKey | null;
  proofName: string | null;
}

const INITIAL: FormState = {
  serviceKey: null,
  theme: null,
  addOns: [],
  date: "",
  meetingPoint: MEETING_POINTS[0],
  zone: null,
  suitcases: 1,
  participants: 1,
  notes: "",
  name: "",
  phone: "",
  email: "",
  referral: "",
  method: null,
  proofName: null,
};

/** Kode QR dummy deterministik dari nomor pesanan (Fase 1). */
function QrCode({ seed }: { seed: string }) {
  const size = 21;
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100003;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) % 2147483648;
    cells.push((h >> 5) % 3 !== 0);
  }
  // Tiga penjuru (finder pattern)
  const finder = (r: number, c: number) => {
    const inBox =
      (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
    return inBox;
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden="true">
      <rect width={size} height={size} fill="#fff" />
      {cells.map((on, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        if (finder(r, c)) return null;
        if (!on) return null;
        return <rect key={i} x={c} y={r} width="1" height="1" fill="#1d3a5c" />;
      })}
      {[
        [0, 0],
        [0, size - 7],
        [size - 7, 0],
      ].map(([r, c], i) => (
        <g key={i}>
          <rect x={c} y={r} width="7" height="7" fill="#1d3a5c" />
          <rect x={c + 1} y={r + 1} width="5" height="5" fill="#fff" />
          <rect x={c + 2} y={r + 2} width="3" height="3" fill="#1d3a5c" />
        </g>
      ))}
    </svg>
  );
}

export default function BookingWizard() {
  const t = useTranslations("booking");
  const ts = useTranslations("services");
  const tc = useTranslations("common");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const service = form.serviceKey ? getService(form.serviceKey) : null;

  const lines = useMemo(() => {
    if (!service) return [];
    const out: { key: ServiceKey; qty: number; unit: number }[] = [];
    out.push({
      key: service.key,
      qty: form.serviceKey === "penitipan" ? form.suitcases : 1,
      unit: service.price,
    });
    for (const k of form.addOns) {
      const s = getService(k);
      out.push({ key: k, qty: k === "penitipan" ? form.suitcases : 1, unit: s.price });
    }
    return out;
  }, [service, form.addOns, form.suitcases, form.serviceKey]);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.unit, 0),
    [lines],
  );

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function toggleAddOn(key: ServiceKey) {
    setForm((f) => ({
      ...f,
      addOns: f.addOns.includes(key)
        ? f.addOns.filter((k) => k !== key)
        : [...f.addOns, key],
    }));
  }

  function validate(current: number): boolean {
    if (current === 0 && !form.serviceKey) {
      setError(t("errors.service"));
      return false;
    }
    if (current === 1 && !form.date) {
      setError(t("errors.date"));
      return false;
    }
    if (current === 2 && (!form.name.trim() || !form.phone.trim())) {
      setError(t("errors.contact"));
      return false;
    }
    if (current === 3 && !form.proofName && !form.method) {
      setError(t("errors.payment"));
      return false;
    }
    setError(null);
    return true;
  }

  function next() {
    if (!validate(step)) return;
    if (step === 3) {
      // Simulasi nomor pesanan otomatis (Fase 1; Fase 2 dibuat server).
      const d = new Date();
      const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
      const seq = String(Math.floor(Math.random() * 9000) + 1000);
      setOrderNo(`UL-${stamp}-${seq}`);
      setStep(4);
      return;
    }
    setStep((s) => s + 1);
  }

  function reset() {
    setForm(INITIAL);
    setOrderNo(null);
    setStep(0);
    setError(null);
  }

  /* ---------- Layar sukses: voucher boarding pass ---------- */
  if (step === 4 && orderNo) {
    const name = form.name.trim() || "Traveler";
    const waLink = `https://wa.me/6281234567890?text=${encodeURIComponent(
      `Halo UNANG LOJA, saya ${name}. Nomor pesanan saya ${orderNo}.`,
    )}`;
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Eyebrow icon="✓">{t("success.eyebrow")}</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-2xl font-bold text-navy-900 md:text-3xl">
            {t("success.title", { name })}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft">
            {t("success.subtitle")}
          </p>
        </div>

        {/* Voucher boarding pass */}
        <div className="card overflow-hidden shadow-lg">
          <div className="grid lg:grid-cols-[1fr_240px]">
            {/* Sisi kiri */}
            <div className="p-5 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-serif text-base font-bold text-navy-900">
                  {t("success.boarding")}
                </span>
                <span className="rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {t("success.secureTag")}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                {t("success.voucherNote")}
              </p>

              <div className="mt-4 rounded-xl bg-cream p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                  {t("success.codeLabel")}
                </p>
                <p className="mt-0.5 font-mono text-xl font-extrabold tracking-wider text-navy-900">
                  {orderNo}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                    {t("success.dropoff")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-navy-900">{form.meetingPoint}</p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">{t("success.dropoffDesc")}</p>
                </div>
                <div className="rounded-xl border border-line p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                    {t("success.destination")}
                  </p>
                  <p className="mt-1 text-sm font-bold text-navy-900">{t("success.destinationDesc")}</p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">
                    {form.date} · {form.suitcases} 🧳
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {(
                  [
                    ["bagasi", "🧳"],
                    ["protocol", "🔒"],
                    ["guide", "🎓"],
                  ] as const
                ).map(([k, icon]) => (
                  <div key={k} className="rounded-xl bg-navy-900 p-3.5 text-white">
                    <span className="text-base" aria-hidden="true">{icon}</span>
                    <p className="mt-1 text-[11px] font-bold">{t(`success.tiles.${k}.title`)}</p>
                    <p className="text-[10px] text-navy-200">{t(`success.tiles.${k}.desc`)}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
                ℹ️ {t("success.note")}
              </p>
            </div>

            {/* Sisi kanan (stub) */}
            <div className="relative border-t border-dashed border-line bg-cream p-5 text-center lg:border-l lg:border-t-0">
              <span
                aria-hidden="true"
                className="absolute -left-2.5 top-1/2 hidden h-5 w-5 rounded-full bg-cream lg:block"
              />
              <span
                aria-hidden="true"
                className="absolute -right-2.5 top-1/2 hidden h-5 w-5 rounded-full bg-cream lg:block"
              />
              <div className="mx-auto h-28 w-28 rounded-lg border border-line bg-white p-1.5">
                <QrCode seed={orderNo} />
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {t("success.qr")}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-navy-800">{t("success.scan")}</p>
              <p className="mt-3 border-t border-line pt-3 text-[10px] text-ink-soft">
                {t("success.staffLabel")}
              </p>
            </div>
          </div>
        </div>

        {/* Aksi */}
        <div className="flex flex-wrap gap-3">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="rounded-lg bg-navy-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800"
          >
            ⬇ {t("success.downloadPdf")}
          </a>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            💬 {t("success.sendWa")}
          </a>
          <Link
            href="/status"
            className="rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-xs font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
          >
            📍 {t("success.trackCta")}
          </Link>
        </div>

        {/* 3 langkah penyerahan */}
        <section>
          <h3 className="font-serif text-lg font-bold text-navy-900">
            {t("success.stepsTitle")}
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(["0", "1", "2"] as const).map((i) => (
              <div key={i} className="card p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 font-serif text-sm font-bold text-navy-900">
                  {Number(i) + 1}
                </span>
                <h4 className="mt-3 font-serif text-sm font-bold text-navy-900">
                  {t(`success.steps.${i}.title`)}
                </h4>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  {t(`success.steps.${i}.desc`)}
                </p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-gold-600">
                  {t(`success.steps.${i}.note`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Rekap pembayaran */}
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-navy-900 px-5 py-3.5 text-white">
            <h3 className="font-serif text-sm font-bold">{t("success.recap.title")}</h3>
            <span className="rounded-full bg-gold-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy-900">
              {t("success.recap.statusLunas")}
            </span>
          </div>
          <div className="p-5">
            <p className="text-[11px] text-ink-soft">
              {t("success.recap.refLabel")}: <span className="font-mono font-bold text-navy-900">{orderNo}</span>
            </p>
            <table className="mt-3 w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-wide text-ink-soft">
                  <th className="py-2">{t("success.recap.colItem")}</th>
                  <th className="py-2 text-center">{t("success.recap.colQty")}</th>
                  <th className="py-2 text-right">{t("success.recap.colPrice")}</th>
                  <th className="py-2 text-right">{t("success.recap.colSubtotal")}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.key} className="border-b border-line/60">
                    <td className="py-2.5 font-medium text-navy-900">
                      {ts(`items.${l.key}.name`)}
                      <span className="ml-1.5 font-mono text-[10px] text-ink-soft">
                        {ts(`items.${l.key}.code`)}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">{l.qty}</td>
                    <td className="py-2.5 text-right">{formatIDR(l.unit)}</td>
                    <td className="py-2.5 text-right font-semibold text-navy-900">
                      {formatIDR(l.qty * l.unit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t("step4.method")}</dt>
                <dd className="font-semibold text-navy-900">
                  {form.method ? t(`step4.methods.${form.method}`) : tc("whatsapp")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t("success.recap.time")}</dt>
                <dd className="font-semibold text-navy-900">
                  {new Date().toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t("success.recap.ppn")}</dt>
                <dd className="font-semibold text-navy-900">{tc("included")}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm">
                <dt className="font-bold text-navy-900">{t("success.recap.totalLabel")}</dt>
                <dd className="font-extrabold text-brand-600">{formatIDR(total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-ink-soft">{t("success.recap.totalNote")}</p>
          </div>
        </section>

        {/* Protokol kuning */}
        <section className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
          <h3 className="flex items-center gap-2 font-serif text-sm font-bold text-navy-900">
            ⚠️ {t("success.protocol.title")}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-ink">
            {t("success.protocol.desc")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-gold-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-700">
              🧑‍✈️ {t("success.protocol.staff")}
            </span>
            <span className="rounded-full border border-gold-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-700">
              🛺 {t("success.protocol.courier")}
            </span>
          </div>
        </section>

        <div className="text-center">
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-navy-700 underline underline-offset-4 hover:text-gold-700"
          >
            ← {t("back")}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Wizard + Sidebar ---------- */
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card p-5 md:p-7">
        {/* Indikator langkah */}
        <ol className="flex items-center gap-2 text-xs md:gap-0">
          {(["0", "1", "2", "3"] as const).map((_, i) => (
            <li key={i} className="flex flex-1 items-center gap-2 md:flex-col md:gap-1">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  i < step
                    ? "bg-gold-500 text-navy-900"
                    : i === step
                      ? "bg-brand-600 text-white"
                      : "bg-navy-50 text-ink-soft"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span
                className={`hidden text-[10px] font-bold uppercase tracking-wide md:block ${
                  i === step ? "text-brand-600" : "text-ink-soft"
                }`}
              >
                {t(`steps.${i}`)}
              </span>
              {i < 3 && (
                <span
                  className={`h-0.5 flex-1 md:hidden ${
                    i < step ? "bg-gold-500" : "bg-line"
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-ink-soft md:hidden">
          {t("stepOf", { current: step + 1, total: 4 })} — {t(`steps.${step}`)}
        </p>

        <h2 className="mt-5 font-serif text-lg font-bold text-navy-900 md:text-xl">
          {step === 0 && t("step1.title")}
          {step === 1 && t("step2.title")}
          {step === 2 && t("step3.title")}
          {step === 3 && t("step4.title")}
        </h2>

        {/* Langkah 1: layanan */}
        {step === 0 && (
          <div className="mt-4">
            <p className="text-[13px] text-ink-soft">{t("step1.select")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => {
                const selected = form.serviceKey === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        serviceKey: s.key,
                        theme: s.key === "mystery" ? f.theme : null,
                        addOns: [],
                      }))
                    }
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      selected
                        ? "border-brand-600 bg-brand-50"
                        : "border-line bg-white hover:border-gold-500"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-navy-700">
                        {ts(`items.${s.key}.code`)}
                      </span>
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] text-white ${
                          selected ? "border-brand-600 bg-brand-600" : "border-navy-200"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </div>
                    <p className="mt-2 font-serif text-sm font-bold text-navy-900">
                      {ts(`items.${s.key}.name`)}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-brand-600">
                      {formatIDR(s.price)}
                      <span className="ml-1 text-[11px] font-medium text-ink-soft">
                        {tc(s.unit)}
                      </span>
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Tema Mystery Tour */}
            {form.serviceKey === "mystery" && (
              <div className="mt-4 rounded-xl bg-gold-50 p-4">
                <p className="text-sm font-semibold text-navy-900">{t("step1.theme")}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(["situs", "senja"] as const).map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => set("theme", th)}
                      className={`rounded-lg border-2 p-3 text-left text-sm ${
                        form.theme === th
                          ? "border-gold-500 bg-white"
                          : "border-transparent bg-white/70"
                      }`}
                    >
                      {ts(`mysteryThemes.${th}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upsell / cross-sell */}
            {form.serviceKey && (
              <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 p-4">
                <p className="text-sm font-bold text-gold-700">
                  💡 {t("step1.suggestions")}
                </p>
                <div className="mt-2 space-y-2">
                  {[
                    ...(UPSELL[form.serviceKey] ? [UPSELL[form.serviceKey]!] : []),
                    ...(CROSS_SELL[form.serviceKey] ?? []),
                  ]
                    .filter((k) => k !== form.serviceKey)
                    .map((k) => {
                      const s = getService(k);
                      const sk = form.serviceKey;
                      const isUpsell = sk !== null && UPSELL[sk] === k;
                      return (
                        <div
                          key={k}
                          className="flex items-center justify-between gap-3 rounded-lg bg-white p-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-navy-900">
                              {ts(`items.${k}.name`)}{" "}
                              <span className="ml-1 rounded-full bg-navy-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-200">
                                {isUpsell ? "UPSELL" : "ADD-ON"}
                              </span>
                            </p>
                            <p className="text-xs text-ink-soft">
                              {formatIDR(s.price)} · {tc(s.unit)}
                            </p>
                            {isUpsell && (
                              <p className="mt-0.5 text-[11px] text-gold-700">
                                {t("step1.upsellNote", { saving: formatIDR(25_000) })}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              isUpsell
                                ? setForm((f) => ({ ...f, serviceKey: k, addOns: [] }))
                                : toggleAddOn(k)
                            }
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                              isUpsell
                                ? "bg-brand-600 text-white hover:bg-brand-700"
                                : form.addOns.includes(k)
                                  ? "bg-navy-900 text-white"
                                  : "border border-navy-200 text-navy-800 hover:border-gold-500"
                            }`}
                          >
                            {isUpsell
                              ? t("step1.switch")
                              : form.addOns.includes(k)
                                ? t("step1.added")
                                : t("step1.add")}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Langkah 2: tanggal & lokasi */}
        {step === 1 && (
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step2.date")}</span>
              <input
                type="date"
                min={todayISO}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
              />
              <span className="text-[11px] text-ink-soft">{t("step2.dateMin")}</span>
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step2.meetingPoint")}</span>
              <select
                value={form.meetingPoint}
                onChange={(e) => set("meetingPoint", e.target.value)}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
              >
                {MEETING_POINTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>

            {(form.serviceKey === "antarDekat" || form.serviceKey === "antarLintas" || form.addOns.some((k) => k === "antarDekat" || k === "antarLintas")) && (
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">{t("step2.zone")}</span>
                <select
                  value={form.zone ?? ""}
                  onChange={(e) => set("zone", (e.target.value || null) as ZoneKey | null)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                >
                  <option value="">{t("step2.zones.dekat")}</option>
                  <option value="lintas">{t("step2.zones.lintas")}</option>
                </select>
              </label>
            )}

            {(form.serviceKey === "penitipan" || form.addOns.includes("penitipan")) && (
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">{t("step2.suitcases")}</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.suitcases}
                  onChange={(e) => set("suitcases", Math.max(1, Number(e.target.value)))}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </label>
            )}

            {form.serviceKey !== "penitipan" && (
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">{t("step2.participants")}</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.participants}
                  onChange={(e) =>
                    set("participants", Math.max(1, Number(e.target.value)))
                  }
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </label>
            )}

            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step2.notes")}</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder={t("step2.notesPlaceholder")}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
              />
            </label>
          </div>
        )}

        {/* Langkah 3: data pelanggan */}
        {step === 2 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step3.name")}</span>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step3.phone")}</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+62…"
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step3.email")}</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step3.referral")}</span>
              <input
                value={form.referral}
                onChange={(e) => set("referral", e.target.value.toUpperCase())}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-gold-500"
              />
              <span className="text-[11px] text-ink-soft">
                {t("step3.referralNote")}
              </span>
            </label>

            {/* Ringkasan */}
            <div className="rounded-xl bg-cream p-4 md:col-span-2">
              <p className="text-sm font-bold text-navy-900">{t("step3.summary")}</p>
              <ul className="mt-2 space-y-1 text-[13px] text-ink">
                <li>
                  • {service && ts(`items.${service.key}.name`)}
                  {form.serviceKey === "mystery" &&
                    form.theme &&
                    ` — ${ts(`mysteryThemes.${form.theme}`)}`}
                </li>
                {form.addOns.map((k) => (
                  <li key={k}>• {ts(`items.${k}.name`)}</li>
                ))}
                <li>
                  • {form.date || "—"} · {form.meetingPoint}
                  {form.zone ? ` · ${t(`step2.zones.${form.zone}`)}` : ""}
                </li>
              </ul>
              <p className="mt-2 text-sm font-bold text-navy-900">
                {t("step4.amount")}: {formatIDR(total)}
              </p>
            </div>
          </div>
        )}

        {/* Langkah 4: pembayaran */}
        {step === 3 && (
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step4.method")}</span>
              <select
                value={form.method ?? ""}
                onChange={(e) => set("method", (e.target.value || null) as PaymentMethodKey | null)}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
              >
                {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.emoji} {t(`step4.methods.${k}`)}
                  </option>
                ))}
              </select>
            </label>

            {form.method && (
              <div className="rounded-xl bg-navy-900 p-4 text-sm text-white">
                <p className="font-medium">
                  {t("step4.method")}: {t(`step4.methods.${form.method}`)}
                </p>
                <p className="mt-1 text-navy-100">
                  {t("step4.account")}:{" "}
                  <span className="font-mono font-bold text-gold-200">
                    {PAYMENT_METHODS[form.method].account}
                  </span>
                </p>
                <p className="text-[11px] text-navy-200">{t("step4.holder")}</p>
              </div>
            )}

            <div className="rounded-xl bg-brand-50 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                {t("step4.amount")}
              </p>
              <p className="text-2xl font-extrabold text-brand-600">{formatIDR(total)}</p>
            </div>

            <div>
              <p className="text-sm font-medium">{t("step4.upload")}</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => set("proofName", e.target.files?.[0]?.name ?? null)}
                className="mt-2 block w-full rounded-lg border border-line px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              {form.proofName && (
                <p className="mt-1 text-[11px] text-navy-700">
                  {t("step4.uploading", { file: form.proofName })}
                </p>
              )}
              <p className="mt-1 text-[11px] text-ink-soft">{t("step4.uploadHint")}</p>
            </div>

            <p className="rounded-xl bg-cream p-3 text-xs text-ink-soft">
              {t("step4.note")}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
            {error}
          </p>
        )}

        {/* Navigasi */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-bold text-navy-800 transition hover:border-gold-500 disabled:opacity-40"
          >
            ← {t("back")}
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            {step === 3 ? t("step4.submit") : `${t("next")} →`}
          </button>
        </div>
      </div>

      {/* Sidebar: kalkulator transparan */}
      <aside className="space-y-4">
        <div className="card sticky top-24 p-5">
          <p className="font-serif text-base font-bold text-navy-900">
            {t("sidebar.title")}
          </p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
            {t("sidebar.calc")}
          </p>

          <div className="mt-4 space-y-2.5 border-y border-line py-3.5">
            {lines.length === 0 && (
              <p className="text-xs text-ink-soft">{t("step1.select")}</p>
            )}
            {lines.map((l) => (
              <div key={l.key} className="flex items-start justify-between gap-2 text-xs">
                <span className="text-ink">
                  {ts(`items.${l.key}.name`)}
                  {l.qty > 1 && <span className="ml-1 text-ink-soft">×{l.qty}</span>}
                </span>
                <span className="shrink-0 font-semibold text-navy-900">
                  {formatIDR(l.qty * l.unit)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              {t("sidebar.total")}
            </span>
            <span className="text-lg font-extrabold text-brand-600">{formatIDR(total)}</span>
          </div>
          <p className="mt-1 text-[10px] text-ink-soft">{t("sidebar.totalNote")}</p>

          <button
            type="button"
            onClick={next}
            className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            {t("sidebar.cta")}
          </button>

          <div className="mt-4 border-t border-line pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
              {t("sidebar.methods")}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.values(PAYMENT_METHODS).map((m, i) => (
                <span
                  key={i}
                  className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-semibold text-navy-800"
                >
                  {m.emoji} {t(`step4.methods.${Object.keys(PAYMENT_METHODS)[i]}`)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <p className="font-serif text-sm font-bold text-navy-900">
            {t("sidebar.guarantees.title")}
          </p>
          <ul className="mt-3 space-y-3">
            {(["0", "1", "2"] as const).map((i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-50 text-[10px] text-gold-600" aria-hidden="true">
                  ✓
                </span>
                <span>
                  <span className="block text-xs font-bold text-navy-900">
                    {t(`sidebar.guarantees.items.${i}.title`)}
                  </span>
                  <span className="block text-[11px] text-ink-soft">
                    {t(`sidebar.guarantees.items.${i}.desc`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
