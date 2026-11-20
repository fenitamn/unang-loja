"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ReviewForm({ orderResi }: { orderResi: string }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderResi, rating, comment }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) setMessage({ kind: "error", text: data.error ?? "Gagal mengirim." });
      else {
        setMessage({ kind: "ok", text: t("detail.reviewSent") });
        setComment("");
        router.refresh();
      }
    } catch {
      setMessage({ kind: "error", text: "Tidak dapat menghubungi server." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-4">
      <p className="text-[11px] leading-relaxed text-ink-soft">{t("detail.reviewHint")}</p>
      <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label={t("detail.reviewTitle")}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            onClick={() => setRating(value)}
            className={`text-xl leading-none transition ${
              value <= rating ? "text-gold-500" : "text-line"
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-1 text-[10px] text-ink-soft">{rating}/5</span>
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={3}
        minLength={10}
        maxLength={1000}
        placeholder={t("detail.reviewPlaceholder")}
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-xs outline-none focus:border-navy-700"
      />
      <button
        type="submit"
        disabled={loading || comment.trim().length < 10}
        className="mt-2 rounded-lg bg-navy-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-navy-800 disabled:opacity-50"
      >
        {loading ? "Mengirim…" : t("detail.reviewSubmit")}
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
