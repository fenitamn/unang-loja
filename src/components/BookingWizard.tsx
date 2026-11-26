"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  CROSS_SELL,
  GUIDES,
  MEETING_POINTS,
  PAYMENT_METHODS,
  SERVICES,
  UPSELL,
  formatIDR,
  getGuide,
  getService,
  type MysteryTheme,
  type PaymentMethodKey,
  type ServiceKey,
  type ZoneKey,
} from "@/lib/data";
import { Eyebrow } from "@/components/ui";

type SuitcaseSize = "kabin" | "medium" | "large";
type LanguageKey = "id" | "en" | "de" | "zh" | "btk";
type DeliveryMode = "titip" | "dekat" | "lintas";

interface FormState {
  serviceKey: ServiceKey | null;
  guideId: string | null;
  theme: MysteryTheme | null;
  addOns: ServiceKey[];
  date: string;
  time: string;
  meetingPoint: string;
  destination: string;
  zone: ZoneKey | null;
  suitcaseSize: SuitcaseSize;
  suitcases: number;
  participants: number;
  insurance: boolean;
  language: LanguageKey;
  notes: string;
  name: string;
  phone: string;
  email: string;
  referral: string;
  method: PaymentMethodKey | null;
  proofName: string | null;
  proofData: string | null;
}

type PriceLine = {
  key: string;
  label: string;
  code?: string;
  qty: number;
  unit: number;
  note?: string;
};

const INITIAL: FormState = {
  serviceKey: null,
  guideId: null,
  theme: null,
  addOns: [],
  date: "",
  time: "09:00",
  meetingPoint: MEETING_POINTS[0],
  destination: "",
  zone: null,
  suitcaseSize: "medium",
  suitcases: 1,
  participants: 1,
  insurance: false,
  language: "id",
  notes: "",
  name: "",
  phone: "",
  email: "",
  referral: "",
  method: null,
  proofName: null,
  proofData: null,
};

const SECTION_IDS = ["step-1", "step-2", "step-3", "step-4"] as const;

/** Kode QR deterministik dari nomor pesanan (bukan pembayaran). */
function QrCode({ seed }: { seed: string }) {
  const size = 21;
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100003;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) % 2147483648;
    cells.push((h >> 5) % 3 !== 0);
  }
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

export default function BookingWizard({
  initialGuideId,
  initialServiceKey,
  initialMeetingPoint,
  initialDestination,
  initialDate,
  initialSuitcases,
  loggedIn = false,
  activeServiceKeys,
  guideRates,
  activeGuideSlugs,
  account,
}: {
  initialGuideId?: string;
  initialServiceKey?: string;
  initialMeetingPoint?: string;
  initialDestination?: string;
  initialDate?: string;
  initialSuitcases?: number;
  loggedIn?: boolean;
  activeServiceKeys?: string[];
  guideRates?: Record<string, number>;
  activeGuideSlugs?: string[];
  account?: { name: string; phone: string; email: string } | null;
}) {
  const t = useTranslations("booking");
  const ts = useTranslations("services");
  const tg = useTranslations("guides");
  const tc = useTranslations("common");
  const locale = useLocale();

  const availableServices = useMemo(
    () =>
      activeServiceKeys
        ? SERVICES.filter((service) => activeServiceKeys.includes(service.key))
        : SERVICES,
    [activeServiceKeys],
  );
  const guideList = useMemo(
    () => GUIDES.filter((guide) => !activeGuideSlugs || activeGuideSlugs.includes(guide.id)),
    [activeGuideSlugs],
  );
  const initialGuide = initialGuideId ? getGuide(initialGuideId) : undefined;
  const validInitialService =
    initialServiceKey && availableServices.some((service) => service.key === initialServiceKey)
      ? (initialServiceKey as ServiceKey)
      : null;
  const initialState: FormState = {
    ...INITIAL,
    serviceKey: validInitialService ?? (initialGuide ? "pemanduan" : null),
    guideId: initialGuide ? initialGuide.id : null,
    meetingPoint:
      initialMeetingPoint && MEETING_POINTS.includes(initialMeetingPoint as (typeof MEETING_POINTS)[number])
        ? initialMeetingPoint
        : MEETING_POINTS[0],
    destination: initialDestination ?? "",
    date: initialDate ?? "",
    suitcases: Math.max(1, Math.min(20, initialSuitcases || 1)),
    name: account?.name ?? "",
    phone: account?.phone ?? "",
    email: account?.email ?? "",
  };

  const [form, setForm] = useState<FormState>(initialState);
  const [activeStep, setActiveStep] = useState(0);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const service = form.serviceKey ? getService(form.serviceKey) : null;
  const guide = form.guideId ? getGuide(form.guideId) : undefined;
  const guidePrice = guide ? guideRates?.[guide.id] ?? guide.price : 0;

  const deliveryMode: DeliveryMode =
    form.serviceKey === "antarLintas" || form.addOns.includes("antarLintas")
      ? "lintas"
      : form.serviceKey === "antarDekat" || form.addOns.includes("antarDekat")
        ? "dekat"
        : "titip";

  function setDeliveryMode(mode: DeliveryMode) {
    setForm((f) => {
      const isStorageService =
        f.serviceKey === "penitipan" ||
        f.serviceKey === "antarDekat" ||
        f.serviceKey === "antarLintas";
      const withoutDelivery = f.addOns.filter(
        (key) => key !== "antarDekat" && key !== "antarLintas",
      );
      if (isStorageService) {
        return {
          ...f,
          serviceKey:
            mode === "titip" ? "penitipan" : mode === "dekat" ? "antarDekat" : "antarLintas",
          zone: mode === "lintas" ? "lintas" : mode === "dekat" ? "dekat" : null,
          addOns: withoutDelivery,
        };
      }
      if (mode === "titip") return { ...f, addOns: withoutDelivery, zone: null };
      return {
        ...f,
        addOns: [...withoutDelivery, mode === "dekat" ? "antarDekat" : "antarLintas"],
        zone: mode === "lintas" ? "lintas" : "dekat",
      };
    });
  }

  function selectService(key: ServiceKey) {
    setForm((f) => ({
      ...f,
      serviceKey: key,
      theme: key === "mystery" ? f.theme : null,
      addOns: [],
      guideId: key === "pemanduan" ? f.guideId ?? guideList[0]?.id ?? null : f.guideId,
    }));
  }

  function toggleAddOn(key: ServiceKey) {
    setForm((f) => ({
      ...f,
      addOns: f.addOns.includes(key)
        ? f.addOns.filter((item) => item !== key)
        : [...f.addOns, key],
    }));
  }

  const lines = useMemo<PriceLine[]>(() => {
    if (!service) return [];
    const out: PriceLine[] = [];
    const baseUnit =
      form.serviceKey === "pemanduan" && guide && guidePrice > 0 ? guidePrice : service.price;
    out.push({
      key: service.key,
      label: ts(`items.${service.key}.name`),
      code: ts(`items.${service.key}.code`),
      qty: form.serviceKey === "penitipan" ? form.suitcases : 1,
      unit: baseUnit,
      note: form.serviceKey === "pemanduan" && guide ? guide.name : undefined,
    });

    for (const key of form.addOns) {
      if (key === form.serviceKey) continue;
      const addOn = getService(key);
      const isGuideAddOn = key === "pemanduan";
      out.push({
        key,
        label: ts(`items.${key}.name`),
        code: ts(`items.${key}.code`),
        qty: key === "penitipan" ? form.suitcases : 1,
        unit: isGuideAddOn && guide && guidePrice > 0 ? guidePrice : addOn.price,
        note: isGuideAddOn && guide ? guide.name : undefined,
      });
    }

    if (guide && form.serviceKey !== "pemanduan" && !form.addOns.includes("pemanduan")) {
      out.push({
        key: "guide",
        label: `${t("step3.selected")}: ${guide.name}`,
        qty: 1,
        unit: guidePrice,
      });
    }

    if (form.insurance) {
      out.push({
        key: "asuransi",
        label: t("step2.insurance"),
        qty: form.suitcases,
        unit: 10_000,
      });
    }
    return out;
  }, [service, guide, guidePrice, form.serviceKey, form.addOns, form.suitcases, form.insurance, t, ts]);

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty * line.unit, 0),
    [lines],
  );

  const suggestions = useMemo(() => {
    if (!form.serviceKey) return [] as ServiceKey[];
    return [
      ...(UPSELL[form.serviceKey] ? [UPSELL[form.serviceKey]!] : []),
      ...(CROSS_SELL[form.serviceKey] ?? []),
    ].filter((key, index, array) => key !== form.serviceKey && array.indexOf(key) === index);
  }, [form.serviceKey]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function onProofFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError(null);
    if (!file) {
      set("proofName", null);
      set("proofData", null);
      return;
    }
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      setError(t("errors.proof"));
      event.target.value = "";
      set("proofName", null);
      set("proofData", null);
      return;
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    set("proofName", file.name);
    set("proofData", data);
  }

  function validate(): boolean {
    if (!form.serviceKey) {
      setError(t("errors.service"));
      scrollToSection(SECTION_IDS[0]);
      return false;
    }
    if (!form.date) {
      setError(t("errors.date"));
      scrollToSection(SECTION_IDS[0]);
      return false;
    }
    if (deliveryMode !== "titip" && !form.destination.trim()) {
      setError(t("errors.destination"));
      scrollToSection(SECTION_IDS[0]);
      return false;
    }
    if (!form.name.trim() || !form.phone.trim()) {
      setError(t("errors.contact"));
      scrollToSection(SECTION_IDS[3]);
      return false;
    }
    if (form.phone.replace(/[^0-9]/g, "").length < 8) {
      setError(t("errors.phone"));
      scrollToSection(SECTION_IDS[3]);
      return false;
    }
    if (!form.method) {
      setError(t("errors.payment"));
      scrollToSection(SECTION_IDS[3]);
      return false;
    }
    setError(null);
    return true;
  }

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToStep(index: number) {
    setActiveStep(index);
    scrollToSection(SECTION_IDS[index]);
  }

  async function submit() {
    if (!validate() || !form.serviceKey) return;
    setSubmitting(true);
    setError(null);
    try {
      const extraNotes = [
        `Tujuan: ${form.destination.trim() || "-"}`,
        `Jam layanan: ${form.time || "-"}`,
        `Ukuran bagasi: ${t(`step2.sizes.${form.suitcaseSize}.name`)} (${t(`step2.sizes.${form.suitcaseSize}.cap`)})`,
        `Bahasa komunikasi: ${t(`step4.languages.${form.language}`)}`,
        `Asuransi: ${form.insurance ? "Ya" : "Tidak"}`,
        form.notes.trim() ? `Catatan: ${form.notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceKey: form.serviceKey,
          serviceLabel: ts(`items.${form.serviceKey}.name`),
          addOns: form.addOns,
          guideId: form.guideId,
          date: form.date,
          meetingPoint: form.meetingPoint,
          zone: form.zone ?? (deliveryMode === "titip" ? null : deliveryMode),
          suitcases: form.suitcases,
          participants: form.participants,
          notes: extraNotes,
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          paymentMethod: form.method,
          paymentProof: form.proofData,
          total,
        }),
      });
      if (res.status === 401) {
        window.location.assign(
          `/${locale}/masuk?next=${encodeURIComponent(
            window.location.pathname + window.location.search,
          )}`,
        );
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        order?: { resi: string; payment_status?: string };
      };
      if (!res.ok || !data.order) {
        setError(data.error ?? t("submitError"));
        return;
      }
      setOrderNo(data.order.resi);
      setPaymentStatus(data.order.payment_status ?? "UNPAID");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t("networkError"));
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Layar sukses: voucher resi digital + PDF terpisah ---------- */
  if (orderNo) {
    const name = form.name.trim() || "Traveler";
    const waLink = `https://wa.me/6285143180788?text=${encodeURIComponent(
      `Halo UNANG LOJA, saya ${name}. Nomor pesanan saya ${orderNo}.`,
    )}`;
    const paymentLabel = form.method ? t(`step4.methods.${form.method}`) : "—";
    const serviceLabel = form.serviceKey ? ts(`items.${form.serviceKey}.name`) : "—";

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Eyebrow icon="✓">{t("success.eyebrow")}</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-2xl font-bold text-navy-900 md:text-3xl">
            {t("success.title", { name })}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            {t("success.subtitle")}
          </p>
        </div>

        {/* Voucher resi digital — tetap tampil sebagai resi, tanpa tombol kembali */}
        <div className="card overflow-hidden shadow-lg">
          <div className="grid lg:grid-cols-[1fr_250px]">
            <div className="p-5 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-serif text-base font-bold text-navy-900">
                    {t("success.digitalLabel")}
                  </span>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
                    {t("success.voucherNote")}
                  </p>
                </div>
                <span className="rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {t("success.secureTag")}
                </span>
              </div>

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
                  <p className="mt-1 text-sm font-bold text-navy-900">
                    {form.destination.trim() || t("success.destinationDesc")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-soft">
                    {form.date} · {form.time} · {form.suitcases} 🧳
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {(
                  [
                    ["bagasi", "🧳", `${form.suitcases} ${t("step2.suitcases")} · ${t(`step2.sizes.${form.suitcaseSize}.name`)}`],
                    ["protocol", "🔒", t("success.tiles.protocol.desc")],
                    ["guide", "🎓", guide ? guide.name : t("step3.noGuide")],
                  ] as const
                ).map(([key, icon, value]) => (
                  <div key={key} className="rounded-xl bg-navy-900 p-3.5 text-white">
                    <span className="text-base" aria-hidden="true">{icon}</span>
                    <p className="mt-1 text-[11px] font-bold">{t(`success.tiles.${key}.title`)}</p>
                    <p className="text-[10px] text-navy-200">{value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
                ℹ️ {t("success.note")}
              </p>
            </div>

            <div className="relative border-t border-dashed border-line bg-cream p-5 text-center lg:border-l lg:border-t-0">
              <span aria-hidden="true" className="absolute -left-2.5 top-1/2 hidden h-5 w-5 rounded-full bg-cream lg:block" />
              <span aria-hidden="true" className="absolute -right-2.5 top-1/2 hidden h-5 w-5 rounded-full bg-cream lg:block" />
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

        {/* Aksi — PDF tetap fitur unduhan terpisah */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-navy-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800"
          >
            ⬇ {t("success.downloadPdf")}
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700"
          >
            💬 {t("success.sendWa")}
          </a>
          <Link
            href={`/status?resi=${encodeURIComponent(orderNo)}`}
            className="rounded-lg border border-navy-200 bg-white px-5 py-2.5 text-xs font-bold text-navy-800 transition hover:border-gold-500 hover:text-gold-700"
          >
            📍 {t("success.trackCta")}
          </Link>
          <Link
            href={loggedIn ? "/akun" : "/masuk?next=%2Fakun"}
            className="rounded-lg border border-gold-500 bg-gold-50 px-5 py-2.5 text-xs font-bold text-gold-700 transition hover:bg-gold-100"
          >
            {loggedIn ? t("accountCta") : t("loginLink")}
          </Link>
        </div>
        <p className="text-[11px] leading-relaxed text-ink-soft">{t("success.printNote")}</p>
        {!loggedIn && (
          <p className="rounded-lg border border-line bg-cream px-4 py-3 text-[11px] leading-relaxed text-ink-soft">
            {t("guestNote")}
          </p>
        )}

        {/* 3 langkah penyerahan */}
        <section>
          <h3 className="font-serif text-lg font-bold text-navy-900">{t("success.stepsTitle")}</h3>
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
              {paymentStatus === "PAID"
                ? t("success.recap.statusLunas")
                : paymentStatus === "PENDING"
                  ? t("success.recap.statusPending")
                  : t("success.recap.statusUnpaid")}
            </span>
          </div>
          <div className="p-5">
            <p className="text-[11px] text-ink-soft">
              {t("success.recap.refLabel")}:{" "}
              <span className="font-mono font-bold text-navy-900">{orderNo}</span>
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
                {lines.map((line) => (
                  <tr key={line.key} className="border-b border-line/60">
                    <td className="py-2.5 font-medium text-navy-900">
                      {line.label}
                      {line.code && (
                        <span className="ml-1.5 font-mono text-[10px] text-ink-soft">{line.code}</span>
                      )}
                      {line.note && <span className="mt-0.5 block text-[10px] text-ink-soft">{line.note}</span>}
                    </td>
                    <td className="py-2.5 text-center">{line.qty}</td>
                    <td className="py-2.5 text-right">{formatIDR(line.unit)}</td>
                    <td className="py-2.5 text-right font-semibold text-navy-900">
                      {formatIDR(line.qty * line.unit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t("step4.method")}</dt>
                <dd className="font-semibold text-navy-900">{paymentLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t("success.recap.time")}</dt>
                <dd className="font-semibold text-navy-900">{new Date().toLocaleString()}</dd>
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
          <p className="mt-2 text-[13px] leading-relaxed text-ink">{t("success.protocol.desc")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-gold-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-700">
              🧑‍✈️ {t("success.protocol.staff")}
            </span>
            <span className="rounded-full border border-gold-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-700">
              🛺 {t("success.protocol.courier")}
            </span>
          </div>
        </section>

        {/* Hanya untuk cetak PDF — bukan tampilan voucher digital */}
        <div className="print-receipt">
          <div className="mx-auto max-w-2xl border border-[#d8d2c4] p-8 text-[#16243a]">
            <div className="flex items-start justify-between border-b border-[#d8d2c4] pb-4">
              <div>
                <p className="font-serif text-2xl font-bold tracking-wide">UNANG LOJA</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#a87f17]">
                  {t("success.receipt.subtitle")}
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
                  {t("success.receipt.title")}
                </p>
                <p className="mt-1 font-mono text-xl font-bold">{orderNo}</p>
                <p className="mt-3 text-[10px] text-[#6b7280]">{t("success.receipt.issuedTo")}</p>
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-[11px]">{form.phone}</p>
                {form.email && <p className="text-[11px]">{form.email}</p>}
              </div>
              <div className="h-24 w-24 shrink-0 border border-[#d8d2c4] p-1">
                <QrCode seed={orderNo} />
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 border-y border-[#d8d2c4] py-4 text-[11px]">
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("success.receipt.service")}</dt>
                <dd className="font-semibold">{serviceLabel}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("success.receipt.route")}</dt>
                <dd className="font-semibold">{form.meetingPoint} → {form.destination || "-"}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("success.receipt.schedule")}</dt>
                <dd className="font-semibold">{form.date} · {form.time}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("success.receipt.bags")}</dt>
                <dd className="font-semibold">
                  {form.suitcases} · {t(`step2.sizes.${form.suitcaseSize}.name`)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("success.receipt.payment")}</dt>
                <dd className="font-semibold">{paymentLabel}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wide text-[#6b7280]">{t("success.receipt.seal")}</dt>
                <dd className="font-semibold">—</dd>
              </div>
            </dl>
            <table className="mt-4 w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#d8d2c4] text-[9px] uppercase tracking-wide text-[#6b7280]">
                  <th className="py-1.5">Item</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Harga</th>
                  <th className="py-1.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.key} className="border-b border-[#ece7dc]">
                    <td className="py-1.5">{line.label}</td>
                    <td className="py-1.5 text-center">{line.qty}</td>
                    <td className="py-1.5 text-right">{formatIDR(line.unit)}</td>
                    <td className="py-1.5 text-right font-semibold">{formatIDR(line.qty * line.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between border-t border-[#16243a] pt-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">{t("success.receipt.total")}</span>
              <span className="text-lg font-bold">{formatIDR(total)}</span>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-[#6b7280]">{t("success.receipt.note")}</p>
            <p className="mt-6 border-t border-[#d8d2c4] pt-3 text-center text-[9px] text-[#6b7280]">
              {t("success.receipt.footer")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Form satu halaman + sidebar ---------- */
  return (
    <div>
      {/* Indikator langkah */}
      <div className="card mb-5 grid gap-0 overflow-hidden sm:grid-cols-4">
        {(["0", "1", "2", "3"] as const).map((i) => {
          const index = Number(i);
          const active = index === activeStep;
          const done = index < activeStep;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goToStep(index)}
              className={`flex items-center gap-2.5 border-b border-line px-4 py-3 text-left transition last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                active ? "bg-cream" : "bg-white hover:bg-cream/60"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  done
                    ? "bg-gold-500 text-navy-950"
                    : active
                      ? "bg-brand-600 text-white"
                      : "bg-navy-50 text-ink-soft"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                  {t("stepOf", { current: index + 1, total: 4 })}
                </span>
                <span className={`block text-[11px] font-bold ${active ? "text-navy-900" : "text-ink"}`}>
                  {t(`steps.${i}`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          {guide && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold-200 bg-gold-50 px-3.5 py-2.5">
              <p className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-navy-900">
                <span aria-hidden="true">🎓</span>
                {t("guideSelected")}:
                <span className="font-bold">{guide.name}</span>
                <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-gold-700">
                  {guide.license}
                </span>
              </p>
              <Link
                href="/pemandu"
                className="text-[11px] font-bold text-brand-600 underline underline-offset-4 hover:text-brand-700"
              >
                {t("guideChange")}
              </Link>
            </div>
          )}

          {/* Langkah 1 */}
          <section
            id="step-1"
            onFocusCapture={() => setActiveStep(0)}
            className="card scroll-mt-24 p-5 md:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                1
              </span>
              <div>
                <h2 className="font-serif text-lg font-bold text-navy-900 md:text-xl">
                  {t("step1.title")}
                </h2>
                <p className="mt-1 text-[12px] text-ink-soft">{t("step1.select")}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {availableServices.map((s) => {
                const selected = form.serviceKey === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => selectService(s.key)}
                    aria-pressed={selected}
                    className={`rounded-xl border-2 p-3.5 text-left transition ${
                      selected
                        ? "border-brand-600 bg-brand-50"
                        : "border-line bg-white hover:border-gold-500"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] font-bold text-navy-700">
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
                    <p className="mt-1.5 font-serif text-sm font-bold leading-snug text-navy-900">
                      {ts(`items.${s.key}.name`)}
                    </p>
                    <p className="mt-0.5 text-[12px] font-bold text-brand-600">
                      {formatIDR(s.price)}
                      <span className="ml-1 text-[10px] font-medium text-ink-soft">{tc(s.unit)}</span>
                    </p>
                  </button>
                );
              })}
            </div>

            {form.serviceKey === "mystery" && (
              <div className="mt-4 rounded-xl bg-gold-50 p-4">
                <p className="text-sm font-semibold text-navy-900">{t("step1.theme")}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(["situs", "senja"] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => set("theme", theme)}
                      className={`rounded-lg border-2 p-3 text-left text-sm ${
                        form.theme === theme
                          ? "border-gold-500 bg-white"
                          : "border-transparent bg-white/70"
                      }`}
                    >
                      {ts(`mysteryThemes.${theme}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {t("step1.dropoffTitle")}
              </p>
              <p className="mt-1 text-[11px] text-ink-soft">{t("step1.dropoffDesc")}</p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {MEETING_POINTS.map((point) => {
                  const selected = form.meetingPoint === point;
                  return (
                    <button
                      key={point}
                      type="button"
                      onClick={() => set("meetingPoint", point)}
                      aria-pressed={selected}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[12px] font-semibold transition ${
                        selected
                          ? "border-brand-600 bg-brand-50 text-navy-900"
                          : "border-line bg-white text-ink hover:border-gold-500"
                      }`}
                    >
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                          selected ? "border-brand-600 bg-brand-600 text-[8px] text-white" : "border-navy-200"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                      📍 {point}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 sm:col-span-2">
                <span className="text-[11px] font-bold text-navy-900">{t("step1.destination")}</span>
                <input
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  placeholder={t("step1.destinationPlaceholder")}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[11px] font-bold text-navy-900">{t("step2.date")}</span>
                <input
                  type="date"
                  min={todayISO}
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-ink-soft">{t("step2.dateMin")}</span>
              </label>
              <label className="grid gap-1.5">
                <span className="text-[11px] font-bold text-navy-900">{t("step1.time")}</span>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-ink-soft">{t("step1.timeNote")}</span>
              </label>
            </div>
          </section>

          {/* Langkah 2 */}
          <section
            id="step-2"
            onFocusCapture={() => setActiveStep(1)}
            className="card scroll-mt-24 p-5 md:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                2
              </span>
              <div>
                <h2 className="font-serif text-lg font-bold text-navy-900 md:text-xl">
                  {t("step2.title")}
                </h2>
                <p className="mt-1 text-[12px] text-ink-soft">{t("step2.sizeDesc")}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {(["kabin", "medium", "large"] as const).map((size) => {
                const selected = form.suitcaseSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => set("suitcaseSize", size)}
                    aria-pressed={selected}
                    className={`rounded-xl border-2 p-3.5 text-left transition ${
                      selected
                        ? "border-brand-600 bg-brand-50"
                        : "border-line bg-white hover:border-gold-500"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg" aria-hidden="true">🧳</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${selected ? "text-brand-700" : "text-ink-soft"}`}>
                        {t(`step2.sizes.${size}.cap`)}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] font-bold text-navy-900">{t(`step2.sizes.${size}.name`)}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-ink-soft">{t(`step2.sizes.${size}.desc`)}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-[11px] font-bold text-navy-900">{t("step2.suitcases")}</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => set("suitcases", Math.max(1, form.suitcases - 1))}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-lg font-bold text-navy-800 hover:border-gold-500"
                    aria-label="Kurangi koper"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.suitcases}
                    onChange={(e) => set("suitcases", Math.max(1, Number(e.target.value) || 1))}
                    className="w-16 rounded-lg border border-line bg-white px-2 py-2 text-center text-sm font-bold outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => set("suitcases", Math.min(20, form.suitcases + 1))}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-lg font-bold text-navy-800 hover:border-gold-500"
                    aria-label="Tambah koper"
                  >
                    +
                  </button>
                  <span className="text-[10px] text-ink-soft">{t("step2.suitcasesHint")}</span>
                </div>
              </div>
              {form.serviceKey !== "penitipan" && (
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-bold text-navy-900">{t("step2.participants")}</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={form.participants}
                    onChange={(e) => set("participants", Math.max(1, Number(e.target.value) || 1))}
                    className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                  />
                </label>
              )}
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {t("step2.deliveryTitle")}
              </p>
              <p className="mt-1 text-[11px] text-ink-soft">{t("step2.deliveryDesc")}</p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                {(["titip", "dekat", "lintas"] as const).map((mode) => {
                  const selected = deliveryMode === mode;
                  const modePrice =
                    mode === "titip"
                      ? getService("penitipan").price
                      : mode === "dekat"
                        ? getService("antarDekat").price
                        : getService("antarLintas").price;
                  const unit = mode === "titip" ? tc("perSuitcaseDay") : tc("perTrip");
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDeliveryMode(mode)}
                      aria-pressed={selected}
                      className={`rounded-xl border-2 p-3.5 text-left transition ${
                        selected
                          ? "border-brand-600 bg-brand-50"
                          : "border-line bg-white hover:border-gold-500"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base" aria-hidden="true">
                          {mode === "titip" ? "🔐" : mode === "dekat" ? "🛺" : "🚐"}
                        </span>
                        <span
                          className={`grid h-4 w-4 place-items-center rounded-full border-2 text-[8px] text-white ${
                            selected ? "border-brand-600 bg-brand-600" : "border-navy-200"
                          }`}
                        >
                          {selected ? "✓" : ""}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] font-bold text-navy-900">
                        {t(`step2.delivery.${mode}.name`)}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-ink-soft">
                        {t(`step2.delivery.${mode}.desc`)}
                      </p>
                      <p className="mt-1.5 text-[11px] font-bold text-brand-600">
                        {formatIDR(modePrice)}
                        <span className="ml-0.5 text-[9px] font-medium text-ink-soft">{unit}</span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {t("step2.securityTitle")}
              </p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-600 text-[9px] text-white">
                    ✓
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-navy-900">{t("step2.sealIncluded")}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-ink-soft">
                      {t("step2.sealIncludedDesc")}
                    </p>
                  </div>
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white p-3.5 transition hover:border-gold-500">
                  <input
                    type="checkbox"
                    checked={form.insurance}
                    onChange={(e) => set("insurance", e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#ab3333]"
                  />
                  <span>
                    <span className="block text-[11px] font-bold text-navy-900">
                      {t("step2.insurance")}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-ink-soft">
                      {t("step2.insuranceDesc")}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold text-brand-600">
                      + {formatIDR(10_000 * form.suitcases)}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 p-3.5">
                <p className="text-[11px] font-bold text-gold-700">💡 {t("step1.suggestions")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions.slice(0, 4).map((key) => {
                    const addOn = getService(key);
                    const isUpsell = form.serviceKey !== null && UPSELL[form.serviceKey] === key;
                    const active = form.addOns.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          isUpsell ? selectService(key) : toggleAddOn(key)
                        }
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${
                          isUpsell
                            ? "bg-brand-600 text-white hover:bg-brand-700"
                            : active
                              ? "bg-navy-900 text-white"
                              : "border border-navy-200 bg-white text-navy-800 hover:border-gold-500"
                        }`}
                      >
                        {isUpsell ? t("step1.switch") : active ? t("step1.added") : t("step1.add")}
                        {" · "}
                        {ts(`items.${key}.name`)} {formatIDR(addOn.price)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="mt-4 grid gap-1.5">
              <span className="text-[11px] font-bold text-navy-900">{t("step2.notes")}</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder={t("step2.notesPlaceholder")}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
              />
            </label>
          </section>

          {/* Langkah 3 */}
          <section
            id="step-3"
            onFocusCapture={() => setActiveStep(2)}
            className="card scroll-mt-24 p-5 md:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                3
              </span>
              <div>
                <h2 className="font-serif text-lg font-bold text-navy-900 md:text-xl">
                  {t("step3.title")}
                </h2>
                <p className="mt-1 text-[12px] text-ink-soft">{t("step3.desc")}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => set("guideId", null)}
                aria-pressed={!form.guideId}
                className={`rounded-xl border-2 p-3.5 text-left transition ${
                  !form.guideId
                    ? "border-brand-600 bg-brand-50"
                    : "border-line bg-white hover:border-gold-500"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg" aria-hidden="true">🚶</span>
                  <span
                    className={`grid h-4 w-4 place-items-center rounded-full border-2 text-[8px] text-white ${
                      !form.guideId ? "border-brand-600 bg-brand-600" : "border-navy-200"
                    }`}
                  >
                    {!form.guideId ? "✓" : ""}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] font-bold text-navy-900">{t("step3.noGuide")}</p>
                <p className="mt-0.5 text-[10px] text-ink-soft">{t("step3.noGuideDesc")}</p>
                <p className="mt-1.5 text-[11px] font-bold text-green-700">{tc("gratis")}</p>
              </button>

              {guideList.map((g) => {
                const selected = form.guideId === g.id;
                const price = guideRates?.[g.id] ?? g.price;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => set("guideId", g.id)}
                    aria-pressed={selected}
                    className={`rounded-xl border-2 p-3.5 text-left transition ${
                      selected
                        ? "border-brand-600 bg-brand-50"
                        : "border-line bg-white hover:border-gold-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-[11px] font-bold text-gold-200">
                        {g.name.trim().charAt(0)}
                      </span>
                      <span
                        className={`grid h-4 w-4 place-items-center rounded-full border-2 text-[8px] text-white ${
                          selected ? "border-brand-600 bg-brand-600" : "border-navy-200"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] font-bold leading-snug text-navy-900">{g.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-ink-soft">
                      {tg(`people.${g.id}.specialty`)}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-brand-600">{formatIDR(price)}</span>
                      <span className="font-mono text-[9px] text-ink-soft">{g.license}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-ink-soft">{t("step3.guideNote")}</p>
          </section>

          {/* Langkah 4 */}
          <section
            id="step-4"
            onFocusCapture={() => setActiveStep(3)}
            className="card scroll-mt-24 p-5 md:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                4
              </span>
              <div>
                <h2 className="font-serif text-lg font-bold text-navy-900 md:text-xl">
                  {t("step4.title")}
                </h2>
                <p className="mt-1 text-[12px] text-ink-soft">{t("step4.contactTitle")}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[11px] font-bold text-navy-900">{t("step3.name")}</span>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[11px] font-bold text-navy-900">{t("step3.phone")}</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+62…"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[11px] font-bold text-navy-900">{t("step3.email")}</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[11px] font-bold text-navy-900">{t("step4.language")}</span>
                <select
                  value={form.language}
                  onChange={(e) => set("language", e.target.value as LanguageKey)}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-500"
                >
                  {(["id", "en", "de", "zh", "btk"] as const).map((lang) => (
                    <option key={lang} value={lang}>
                      {t(`step4.languages.${lang}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 sm:col-span-2">
                <span className="text-[11px] font-bold text-navy-900">{t("step3.referral")}</span>
                <input
                  value={form.referral}
                  onChange={(e) => set("referral", e.target.value.toUpperCase())}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-ink-soft">{t("step3.referralNote")}</span>
              </label>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[11px] font-bold text-navy-900">{t("step4.method")}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(PAYMENT_METHODS) as PaymentMethodKey[]).map((key) => {
                  const selected = form.method === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("method", key)}
                      aria-pressed={selected}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[11px] font-semibold transition ${
                        selected
                          ? "border-brand-600 bg-brand-50 text-navy-900"
                          : "border-line bg-white text-ink hover:border-gold-500"
                      }`}
                    >
                      <span className="text-base" aria-hidden="true">
                        {PAYMENT_METHODS[key].emoji}
                      </span>
                      <span className="flex-1">{t(`step4.methods.${key}`)}</span>
                      {selected && <span className="text-brand-600">✓</span>}
                    </button>
                  );
                })}
              </div>

              {form.method && (
                <div className="mt-3 rounded-xl bg-navy-900 p-4 text-sm text-white">
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

              <div className="mt-3 rounded-xl bg-brand-50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  {t("step4.amount")}
                </p>
                <p className="text-2xl font-extrabold text-brand-600">{formatIDR(total)}</p>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-bold text-navy-900">{t("step4.upload")}</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={onProofFile}
                  className="mt-2 block w-full rounded-lg border border-line px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
                {form.proofName && (
                  <p className="mt-1 text-[11px] text-navy-700">
                    {t("step4.uploading", { file: form.proofName })}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-ink-soft">{t("step4.uploadHint")}</p>
              </div>

              <p className="mt-4 rounded-xl bg-cream p-3 text-[11px] leading-relaxed text-ink-soft">
                {t("step4.note")}
              </p>
            </div>

            {error && (
              <p
                id="booking-error"
                role="alert"
                className="mt-4 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-5 w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("submitting") : t("step4.submit")}
            </button>
          </section>
        </div>

        {/* Sidebar: kalkulator transparan */}
        <aside className="space-y-4">
          <div className="card p-5">
            <p className="font-serif text-base font-bold text-navy-900">{t("sidebar.title")}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-600">
              {t("sidebar.calc")}
            </p>

            <dl className="mt-4 space-y-2 border-y border-line py-3.5 text-[11px]">
              <div className="flex items-start justify-between gap-2">
                <dt className="text-ink-soft">{t("sidebar.route")}</dt>
                <dd className="max-w-[170px] text-right font-semibold text-navy-900">
                  {form.meetingPoint} → {form.destination || "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-ink-soft">{t("sidebar.schedule")}</dt>
                <dd className="text-right font-semibold text-navy-900">
                  {form.date || "—"} · {form.time}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="text-ink-soft">{t("sidebar.bags")}</dt>
                <dd className="text-right font-semibold text-navy-900">
                  {form.suitcases} · {t(`step2.sizes.${form.suitcaseSize}.name`)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 space-y-2.5">
              {lines.length === 0 && (
                <p className="text-xs text-ink-soft">{t("step1.select")}</p>
              )}
              {lines.map((line) => (
                <div key={line.key} className="flex items-start justify-between gap-2 text-[11px]">
                  <span className="text-ink">
                    {line.label}
                    {line.qty > 1 && <span className="ml-1 text-ink-soft">×{line.qty}</span>}
                    {line.note && <span className="mt-0.5 block text-[9px] text-ink-soft">{line.note}</span>}
                  </span>
                  <span className="shrink-0 font-semibold text-navy-900">
                    {formatIDR(line.qty * line.unit)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                {form.method ? t("sidebar.total") : t("sidebar.due")}
              </span>
              <span className="text-lg font-extrabold text-brand-600">{formatIDR(total)}</span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-ink-soft">{t("sidebar.totalNote")}</p>

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? t("submitting") : t("sidebar.cta")}
            </button>

            <div className="mt-4 border-t border-line pt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {t("sidebar.methods")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(Object.keys(PAYMENT_METHODS) as PaymentMethodKey[]).map((key) => (
                  <span
                    key={key}
                    className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-semibold text-navy-800"
                  >
                    {PAYMENT_METHODS[key].emoji} {t(`step4.methods.${key}`)}
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
                  <span
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-50 text-[10px] text-gold-600"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold text-navy-900">
                      {t(`sidebar.guarantees.items.${i}.title`)}
                    </span>
                    <span className="block text-[10px] leading-relaxed text-ink-soft">
                      {t(`sidebar.guarantees.items.${i}.desc`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
