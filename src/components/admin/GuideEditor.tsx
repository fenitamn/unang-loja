"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GUIDE_CATEGORY_LABEL, rupiah } from "@/lib/admin-ui";
import type { GuideRecord } from "@/lib/store";

export default function GuideEditor({ guide }: { guide: GuideRecord }) {
  const router = useRouter();
  const [name, setName] = useState(guide.name);
  const [phone, setPhone] = useState(guide.phone);
  const [price, setPrice] = useState(String(guide.price));
  const [schedule, setSchedule] = useState(guide.schedule);
  const [active, setActive] = useState(guide.active);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(guide.name);
    setPhone(guide.phone);
    setPrice(String(guide.price));
    setSchedule(guide.schedule);
    setActive(guide.active);
  }, [guide]);

  async function save(payload: Record<string, unknown>, note: string) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/guides/${encodeURIComponent(guide.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) setMessage(data.error ?? "Gagal menyimpan.");
      else {
        setMessage(note);
        router.refresh();
      }
    } catch {
      setMessage("Tidak dapat menghubungi server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-sm font-bold text-navy-900">{guide.name}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                active
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-line bg-cream-deep text-ink-soft"
              }`}
            >
              {active ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-ink-soft">
            {GUIDE_CATEGORY_LABEL[guide.category] ?? guide.category} · {guide.area} · ★ {guide.rating} (
            {guide.reviews} ulasan) · {guide.years} th
          </p>
          <p className="text-[10px] text-ink-soft">Lisensi: {guide.license}</p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            const next = !active;
            setActive(next);
            void save({ active: next }, next ? "Pemandu diaktifkan." : "Pemandu dinonaktifkan.");
          }}
          className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold disabled:opacity-60 ${
            active
              ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
              : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          {active ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">Nama</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-navy-700"
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            WhatsApp
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="62xxxx"
            className="w-full rounded-lg border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-navy-700"
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            Tarif pemanduan (Rp)
          </span>
          <input
            type="number"
            min={0}
            max={2_000_000}
            step={10_000}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-navy-700"
          />
          <span className="mt-0.5 block text-[9px] text-ink-soft">{rupiah(Number(price) || 0)}</span>
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            Jadwal
          </span>
          <input
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="08:00 - 16:00 WIB"
            className="w-full rounded-lg border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-navy-700"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            save(
              { name, phone, price: Number(price), schedule, active },
              "Data pemandu tersimpan.",
            )
          }
          className="rounded-lg bg-navy-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
        {message && <span className="text-[10px] font-semibold text-navy-700">{message}</span>}
      </div>
    </div>
  );
}
