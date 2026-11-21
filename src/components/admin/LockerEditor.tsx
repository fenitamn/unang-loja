"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/admin/AdminUI";
import type { LockerRecord } from "@/lib/store";

export default function LockerEditor({
  locker,
  occupied,
}: {
  locker: LockerRecord;
  occupied: number;
}) {
  const router = useRouter();
  const [officer, setOfficer] = useState(locker.officer);
  const [capacity, setCapacity] = useState(String(locker.capacity));
  const [keys, setKeys] = useState(String(locker.keys));
  const [active, setActive] = useState(locker.active);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setOfficer(locker.officer);
    setCapacity(String(locker.capacity));
    setKeys(String(locker.keys));
    setActive(locker.active);
  }, [locker]);

  async function save(payload: Record<string, unknown>, note: string) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/lockers/${locker.id}`, {
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

  const available = Math.max(0, locker.capacity - occupied);
  const percent = locker.capacity > 0 ? Math.round((occupied / locker.capacity) * 100) : 0;

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-serif text-sm font-bold text-navy-900">{locker.name}</p>
          <p className="text-[10px] text-ink-soft">{locker.location}</p>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
            active
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-line bg-cream-deep text-ink-soft"
          }`}
        >
          {active ? "Beroperasi" : "Tutup"}
        </span>
      </div>

      <div className="mt-3 rounded-lg bg-cream p-2.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-navy-900">{occupied} koper tersimpan</span>
          <span className="text-ink-soft">{percent}%</span>
        </div>
        <div className="mt-1.5">
          <Progress value={occupied} max={locker.capacity} tone={percent > 85 ? "bg-brand-600" : "bg-navy-800"} />
        </div>
        <p className="mt-1 text-[9px] text-ink-soft">
          {available} slot tersedia dari {locker.capacity} loker · {locker.keys} kunci fisik
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <label className="block sm:col-span-3">
          <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            Petugas jaga
          </span>
          <input
            value={officer}
            onChange={(e) => setOfficer(e.target.value)}
            className="w-full rounded-lg border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-navy-700"
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            Kapasitas
          </span>
          <input
            type="number"
            min={1}
            max={200}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full rounded-lg border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-navy-700"
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            Kunci
          </span>
          <input
            type="number"
            min={0}
            max={200}
            value={keys}
            onChange={(e) => setKeys(e.target.value)}
            className="w-full rounded-lg border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-navy-700"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => save({ officer, capacity: Number(capacity), keys: Number(keys), active }, "Loker tersimpan.")}
            className="w-full rounded-lg bg-navy-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {saving ? "…" : "Simpan"}
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            const next = !active;
            setActive(next);
            void save({ active: next }, next ? "Loker dibuka." : "Loker ditutup.");
          }}
          className="text-[10px] font-bold text-brand-700 underline underline-offset-2 disabled:opacity-60"
        >
          {active ? "Tutup loker sementara" : "Buka loker kembali"}
        </button>
        {message && <span className="text-[10px] text-ink-soft">{message}</span>}
      </div>
    </div>
  );
}
