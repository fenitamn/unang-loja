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

  const total = useMemo(() => {
    if (!service) return 0;
    const addOns = form.addOns.reduce((sum, k) => sum + getService(k).price, 0);
    let price = service.price;
    if (form.serviceKey === "penitipan") price = service.price * form.suitcases;
    return price + addOns;
  }, [service, form.addOns, form.suitcases]);

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

  /* ---------- Layar sukses ---------- */
  if (step === 4 && orderNo) {
    return (
      <div className="rounded-2xl border border-lake-100 bg-white p-6 text-center shadow-sm md:p-10">
        <span className="text-5xl" aria-hidden="true">🎉</span>
        <h2 className="mt-3 text-2xl font-bold text-lake-900">{t("success.title")}</h2>
        <div className="mx-auto mt-4 max-w-sm rounded-xl bg-lake-50 p-4">
          <p className="text-xs text-neutral-500">{t("success.orderNo")}</p>
          <p className="mt-1 text-xl font-extrabold tracking-wide text-lake-900">
            {orderNo}
          </p>
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm text-neutral-600">
          {t("success.next")}
        </p>
        <p className="mt-3 text-xs text-neutral-400">{t("success.simulate")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/status"
            className="rounded-full bg-lake-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-lake-800"
          >
            {t("success.checkStatus")}
          </Link>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-lake-200 px-6 py-2.5 text-sm font-semibold text-lake-800 hover:bg-lake-50"
          >
            {t("success.home")}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Wizard ---------- */
  return (
    <div className="rounded-2xl border border-lake-100 bg-white p-5 shadow-sm md:p-8">
      {/* Indikator langkah */}
      <ol className="flex items-center gap-2 text-xs md:gap-0">
        {(["0", "1", "2", "3"] as const).map((_, i) => (
          <li key={i} className="flex flex-1 items-center gap-2 md:flex-col md:gap-1">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                i < step
                  ? "bg-lake-500 text-white"
                  : i === step
                    ? "bg-ulos-500 text-white"
                    : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span
              className={`hidden text-[11px] font-medium md:block ${
                i === step ? "text-ulos-600" : "text-neutral-400"
              }`}
            >
              {t(`steps.${i}`)}
            </span>
            {i < 3 && <span className="h-px flex-1 bg-lake-100 md:hidden" />}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-neutral-400 md:hidden">
        {t("step", { current: step + 1, total: 4 })} — {t(`steps.${step}`)}
      </p>

      <h2 className="mt-5 text-lg font-bold text-lake-900 md:text-xl">
        {step === 0 && t("step1.title")}
        {step === 1 && t("step2.title")}
        {step === 2 && t("step3.title")}
        {step === 3 && t("step4.title")}
      </h2>

      {/* Langkah 1: layanan */}
      {step === 0 && (
        <div className="mt-4">
          <p className="text-sm text-neutral-500">{t("step1.select")}</p>
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
                      ? "border-ulos-500 bg-ulos-50"
                      : "border-lake-100 bg-white hover:border-lake-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] text-white ${
                        selected
                          ? "border-ulos-500 bg-ulos-500"
                          : "border-neutral-300"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-lake-900">
                    {ts(`items.${s.key}.name`)}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-ulos-600">
                    {formatIDR(s.price)}
                    <span className="ml-1 text-[11px] font-medium text-neutral-500">
                      {tc(s.unit)}
                    </span>
                  </p>
                </button>
              );
            })}
          </div>

          {/* Tema Mystery Tour */}
          {form.serviceKey === "mystery" && (
            <div className="mt-4 rounded-xl bg-sand-100 p-4">
              <p className="text-sm font-semibold text-lake-900">{t("step1.theme")}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(["situs", "senja"] as const).map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => set("theme", th)}
                    className={`rounded-lg border-2 p-3 text-left text-sm ${
                      form.theme === th
                        ? "border-ulos-500 bg-white"
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
            <div className="mt-4 rounded-xl border border-ulos-100 bg-ulos-50 p-4">
              <p className="text-sm font-semibold text-ulos-700">
                {t("step1.suggestions")}
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
                          <p className="text-sm font-medium text-lake-900">
                            {ts(`items.${k}.name`)}{" "}
                            <span className="ml-1 rounded-full bg-lake-100 px-2 py-0.5 text-[10px] font-semibold text-lake-700">
                              {isUpsell ? "UPSELL" : "ADD-ON"}
                            </span>
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatIDR(s.price)} · {tc(s.unit)}
                          </p>
                          {isUpsell && (
                            <p className="mt-0.5 text-[11px] text-ulos-600">
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
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            isUpsell
                              ? "bg-ulos-500 text-white hover:bg-ulos-600"
                              : form.addOns.includes(k)
                                ? "bg-lake-100 text-lake-700"
                                : "border border-lake-300 text-lake-700 hover:bg-lake-50"
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
              className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
            />
            <span className="text-[11px] text-neutral-400">{t("step2.dateMin")}</span>
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium">{t("step2.meetingPoint")}</span>
            <select
              value={form.meetingPoint}
              onChange={(e) => set("meetingPoint", e.target.value)}
              className="rounded-xl border border-lake-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-lake-500"
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
                className="rounded-xl border border-lake-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-lake-500"
              >
                <option value="">{t("step2.zones.dekat")}</option>
                <option value="lintas">{t("step2.zones.lintas")}</option>
              </select>
            </label>
          )}

          {form.serviceKey === "penitipan" && (
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">{t("step2.suitcases")}</span>
              <input
                type="number"
                min={1}
                max={20}
                value={form.suitcases}
                onChange={(e) => set("suitcases", Math.max(1, Number(e.target.value)))}
                className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
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
                className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
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
              className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
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
              className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">{t("step3.phone")}</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+62…"
              className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">{t("step3.email")}</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">{t("step3.referral")}</span>
            <input
              value={form.referral}
              onChange={(e) => set("referral", e.target.value.toUpperCase())}
              className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-lake-500"
            />
            <span className="text-[11px] text-neutral-400">
              {t("step3.referralNote")}
            </span>
          </label>

          {/* Ringkasan */}
          <div className="md:col-span-2 rounded-xl bg-lake-50 p-4">
            <p className="text-sm font-semibold text-lake-900">{t("step3.summary")}</p>
            <ul className="mt-2 space-y-1 text-sm text-neutral-700">
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
            <p className="mt-2 text-sm font-bold text-lake-900">
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
              className="rounded-xl border border-lake-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-lake-500"
            >
              {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.emoji} {t(`step4.methods.${k}`)}
                </option>
              ))}
            </select>
          </label>

          {form.method && (
            <div className="rounded-xl bg-lake-50 p-4 text-sm">
              <p className="font-medium text-lake-900">
                {t("step4.method")}: {t(`step4.methods.${form.method}`)}
              </p>
              <p className="mt-1">
                {t("step4.account")}:{" "}
                <span className="font-mono font-bold text-lake-900">
                  {PAYMENT_METHODS[form.method].account}
                </span>
              </p>
              <p className="text-neutral-500">{t("step4.holder")}</p>
            </div>
          )}

          <div className="rounded-xl bg-ulos-50 p-4 text-center">
            <p className="text-xs text-neutral-500">{t("step4.amount")}</p>
            <p className="text-2xl font-extrabold text-ulos-600">{formatIDR(total)}</p>
          </div>

          <div>
            <p className="text-sm font-medium">{t("step4.upload")}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => set("proofName", e.target.files?.[0]?.name ?? null)}
              className="mt-2 block w-full rounded-xl border border-lake-200 px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-lake-700 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
            {form.proofName && (
              <p className="mt-1 text-[11px] text-lake-700">
                {t("step4.uploading", { file: form.proofName })}
              </p>
            )}
            <p className="mt-1 text-[11px] text-neutral-400">{t("step4.uploadHint")}</p>
          </div>

          <p className="rounded-xl bg-sand-100 p-3 text-xs text-neutral-600">
            {t("step4.note")}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-ulos-50 px-3 py-2 text-sm text-ulos-700">
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
          className="rounded-full border border-lake-200 px-5 py-2.5 text-sm font-semibold text-lake-800 disabled:opacity-40"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-full bg-ulos-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-ulos-600"
        >
          {step === 3 ? t("step4.submit") : t("next")}
        </button>
      </div>
    </div>
  );
}
