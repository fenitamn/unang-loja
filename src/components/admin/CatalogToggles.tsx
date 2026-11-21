"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rupiah } from "@/lib/admin-ui";
import type { ServiceKey } from "@/lib/data";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold disabled:opacity-60 ${
        published
          ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
          : "border-gold-300 bg-gold-50 text-gold-700 hover:bg-gold-100"
      }`}
    >
      {busy ? "…" : published ? "Terbit · Sembunyikan" : "Tampilkan"}
    </button>
  );
}

const SERVICE_PRICE: Record<ServiceKey, { price: number; unit: string }> = {
  pemanduan: { price: 300_000, unit: "per booking" },
  penitipan: { price: 25_000, unit: "per koper / hari" },
  antarDekat: { price: 75_000, unit: "per trip" },
  antarLintas: { price: 150_000, unit: "per trip" },
  fleksibel: { price: 350_000, unit: "per booking" },
  mystery: { price: 350_000, unit: "per booking" },
};

export function ServiceToggle({
  serviceKey,
  active,
  label,
  emoji,
}: {
  serviceKey: ServiceKey;
  active: boolean;
  label: string;
  emoji: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await fetch(`/api/admin/services/${serviceKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const meta = SERVICE_PRICE[serviceKey];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-cream-deep text-lg" aria-hidden="true">
          {emoji}
        </span>
        <div>
          <p className="font-serif text-sm font-bold text-navy-900">{label}</p>
          <p className="text-[10px] text-ink-soft">
            {rupiah(meta.price)} · {meta.unit}
          </p>
          <span
            className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${
              active
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-line bg-cream-deep text-ink-soft"
            }`}
          >
            {active ? "Tersedia untuk dipesan" : "Disembunyikan dari pemesanan"}
          </span>
        </div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={toggle}
        className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold disabled:opacity-60 ${
          active
            ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
            : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {busy ? "…" : active ? "Nonaktifkan" : "Aktifkan"}
      </button>
    </div>
  );
}
