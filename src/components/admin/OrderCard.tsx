"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Icon from "@/components/admin/Icon";
import { PaymentPill, StatusPill } from "@/components/admin/AdminUI";
import {
  PAYMENT_LABEL,
  STATUS_LABEL,
  formatDate,
  formatDateTime,
  orderDetail,
  paymentMethodLabel,
  rupiah,
  serviceLabel,
} from "@/lib/admin-ui";
import type { GuideRecord, OrderRecord } from "@/lib/store";

type Props = {
  order: OrderRecord;
  guides: Pick<GuideRecord, "id" | "name">[];
  defaultOpen?: boolean;
  showProof?: boolean;
  showCustomer?: boolean;
};

export default function OrderCard({
  order,
  guides,
  defaultOpen = false,
  showProof = false,
  showCustomer = true,
}: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const [status, setStatus] = useState(order.status);
  const [payment, setPayment] = useState(order.payment_status);
  const [guideId, setGuideId] = useState(order.guide_id ?? "");
  const [seal, setSeal] = useState(order.seal_code ?? "");
  const [note, setNote] = useState(order.admin_note ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setStatus(order.status);
    setPayment(order.payment_status);
    setGuideId(order.guide_id ?? "");
    setSeal(order.seal_code ?? "");
    setNote(order.admin_note ?? "");
  }, [order]);

  async function patch(payload: Record<string, unknown>, success: string) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessage({ kind: "error", text: data.error ?? "Gagal menyimpan." });
      } else {
        setMessage({ kind: "ok", text: success });
        router.refresh();
      }
    } catch {
      setMessage({ kind: "error", text: "Tidak dapat menghubungi server." });
    } finally {
      setSaving(false);
    }
  }

  const guideName = guides.find((g) => g.id === order.guide_id)?.name;
  const wa = `https://wa.me/${order.phone.replace(/[^0-9]/g, "")}`;

  return (
    <article className="rounded-xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs font-bold text-navy-900">{order.resi}</p>
            <StatusPill status={order.status} />
            <PaymentPill status={order.payment_status} />
          </div>
          <p className="mt-1 text-[10px] text-ink-soft">
            Masuk {formatDateTime(order.created_at)} · {serviceLabel(order.service_key)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-[10px] font-bold text-navy-800 hover:border-green-400 hover:text-green-700"
          >
            <Icon name="phone" className="h-3 w-3" /> WA
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg bg-navy-900 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-navy-800"
          >
            {open ? "Tutup" : "Kelola"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-3 text-[11px] sm:grid-cols-2 lg:grid-cols-4">
        {showCustomer && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Pelanggan</p>
            <p className="mt-0.5 font-semibold text-navy-900">{order.name}</p>
            <p className="text-[10px] text-ink-soft">{order.phone}</p>
            {order.email && <p className="truncate text-[10px] text-ink-soft">{order.email}</p>}
          </div>
        )}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Layanan & Detail</p>
          <p className="mt-0.5 font-semibold text-navy-900">{serviceLabel(order.service_key)}</p>
          <p className="text-[10px] text-ink-soft">{orderDetail(order)}</p>
          {order.add_ons.length > 0 && (
            <p className="text-[10px] text-ink-soft">+ {order.add_ons.join(", ")}</p>
          )}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Jadwal & Titik</p>
          <p className="mt-0.5 font-semibold text-navy-900">{formatDate(order.date)}</p>
          <p className="text-[10px] text-ink-soft">{order.meeting_point}</p>
          {order.zone && <p className="text-[10px] text-ink-soft">Zona: {order.zone}</p>}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Total</p>
          <p className="mt-0.5 font-serif text-sm font-bold text-navy-900">{rupiah(order.total)}</p>
          <p className="text-[10px] text-ink-soft">{paymentMethodLabel(order.payment_method)}</p>
          {guideName && <p className="mt-0.5 text-[10px] text-ink-soft">Pemandu: {guideName}</p>}
          {order.seal_code && (
            <p className="mt-0.5 font-mono text-[10px] text-brand-700">Segel {order.seal_code}</p>
          )}
        </div>
      </div>

      {showProof && order.payment_proof && (
        <div className="border-t border-line px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Bukti pembayaran</p>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="text-[10px] font-bold text-navy-800 underline underline-offset-2"
            >
              {preview ? "Sembunyikan" : "Lihat bukti"}
            </button>
          </div>
          {preview && (
            <a href={order.payment_proof} target="_blank" rel="noreferrer" className="mt-2 block w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.payment_proof}
                alt={`Bukti pembayaran ${order.resi}`}
                className="max-h-64 rounded-lg border border-line object-contain"
              />
            </a>
          )}
          {order.payment_status === "PENDING" && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => patch({ payment_status: "PAID" }, "Pembayaran diverifikasi.")}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-green-700 disabled:opacity-60"
              >
                Terima &amp; Konfirmasi
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  patch(
                    { payment_status: "REJECTED", admin_note: note || "Bukti pembayaran tidak valid." },
                    "Pembayaran ditolak.",
                  )
                }
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                Tolak
              </button>
            </div>
          )}
          {order.verified_at && (
            <p className="mt-1.5 text-[10px] text-green-700">
              Diverifikasi {formatDateTime(order.verified_at)} oleh {order.verified_by ?? "admin"}
            </p>
          )}
        </div>
      )}

      {open && (
        <div className="border-t border-line bg-cream/60 px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                Status pesanan
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderRecord["status"])}
                className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] text-ink outline-none focus:border-navy-700"
              >
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                Pembayaran
              </span>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value as OrderRecord["payment_status"])}
                className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] text-ink outline-none focus:border-navy-700"
              >
                {Object.entries(PAYMENT_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                Pemandu
              </span>
              <select
                value={guideId}
                onChange={(e) => setGuideId(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] text-ink outline-none focus:border-navy-700"
              >
                <option value="">— Belum ditugaskan —</option>
                {guides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                Kode segel bagasi
              </span>
              <input
                value={seal}
                onChange={(e) => setSeal(e.target.value)}
                placeholder="SLG-XXXX"
                className="w-full rounded-lg border border-line bg-white px-2.5 py-2 font-mono text-[11px] text-ink outline-none focus:border-navy-700"
              />
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
              Catatan internal / pesan untuk pelanggan
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={1000}
              className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] text-ink outline-none focus:border-navy-700"
              placeholder="Contoh: Koper telah tiba di resepsionis hotel."
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                patch(
                  {
                    status,
                    payment_status: payment,
                    guide_id: guideId || null,
                    seal_code: seal || null,
                    admin_note: note || null,
                  },
                  "Pesanan diperbarui.",
                )
              }
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-[11px] font-bold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Menyimpan…" : "Simpan perubahan"}
            </button>
            <a
              href={`/${locale}/status?resi=${order.resi}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-bold text-navy-800 hover:border-navy-300"
            >
              <Icon name="external" className="h-3 w-3" /> Halaman lacak
            </a>
            {message && (
              <span
                className={`text-[10px] font-semibold ${
                  message.kind === "ok" ? "text-green-700" : "text-red-600"
                }`}
              >
                {message.text}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
