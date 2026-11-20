"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProofUpload({ orderId }: { orderId: string }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setMessage(null);
    if (!selected) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(selected.type) || selected.size > 2 * 1024 * 1024) {
      setMessage({ kind: "error", text: t("detail.proofHint") });
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(selected);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!preview) {
      setMessage({ kind: "error", text: t("detail.proofHint") });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/account/orders/${orderId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof: preview, ref }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessage({ kind: "error", text: data.error ?? "Gagal mengunggah." });
      } else {
        setMessage({ kind: "ok", text: t("detail.proofSent") });
        setFile(null);
        setPreview(null);
        setRef("");
        router.refresh();
      }
    } catch {
      setMessage({ kind: "error", text: "Tidak dapat menghubungi server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-lg border border-dashed border-line bg-cream p-3">
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">
          {t("detail.proof")}
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onFile}
          className="block w-full text-[10px] file:mr-2 file:rounded file:border-0 file:bg-navy-900 file:px-2.5 file:py-1.5 file:text-[10px] file:font-bold file:text-white"
        />
        <span className="mt-1 block text-[9px] text-ink-soft">{t("detail.proofHint")}</span>
      </label>
      <label className="mt-2 block">
        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-soft">
          {t("detail.ref")} <span className="font-normal normal-case">(opsional)</span>
        </span>
        <input
          value={ref}
          onChange={(event) => setRef(event.target.value)}
          maxLength={80}
          className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] outline-none focus:border-navy-700"
          placeholder="Nomor referensi transfer"
        />
      </label>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Pratinjau bukti" className="mt-2 max-h-40 rounded border border-line object-contain" />
      )}
      {file && <p className="mt-1 text-[9px] text-ink-soft">{file.name}</p>}
      <button
        type="submit"
        disabled={loading || !preview}
        className="mt-2 rounded-lg bg-brand-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Mengunggah…" : t("detail.sendProof")}
      </button>
      {message && (
        <p
          className={`mt-2 text-[10px] font-semibold ${
            message.kind === "ok" ? "text-green-700" : "text-brand-700"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
