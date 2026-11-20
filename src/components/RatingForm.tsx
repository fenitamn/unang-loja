"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function RatingForm() {
  const t = useTranslations("help");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [orderResi, setOrderResi] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ text: string; auth?: boolean } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderResi: orderResi.trim().toUpperCase(),
          rating,
          comment,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (response.status === 401) {
        setError({ text: t("ratingLogin"), auth: true });
        return;
      }
      if (!response.ok) {
        setError({ text: data.error ?? t("ratingError") });
        return;
      }
      setSent(true);
      setComment("");
      setOrderResi("");
    } catch {
      setError({ text: t("ratingError") });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <p className="mt-4 rounded-xl bg-lake-50 px-4 py-4 text-sm font-medium text-lake-800">
        🙏 {t("ratingThanks")}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4">
      <div>
        <p className="text-sm font-medium">{t("ratingLabel")}</p>
        <div className="mt-1 flex gap-1" role="radiogroup" aria-label={t("ratingLabel")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className={`text-3xl leading-none transition ${
                (hover || rating) >= n ? "text-gold-500" : "text-navy-100"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">{t("ratingOrder")}</span>
        <input
          value={orderResi}
          onChange={(event) => setOrderResi(event.target.value.toUpperCase())}
          placeholder="UL-…"
          className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-lake-500"
        />
        <span className="text-[11px] text-ink-soft">{t("ratingOrderHint")}</span>
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">{t("ratingComment")}</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          minLength={10}
          maxLength={1000}
          className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
        />
        <span className="text-[11px] text-ink-soft">{t("ratingCommentHint")}</span>
      </label>
      <button
        type="submit"
        disabled={loading || rating === 0 || !orderResi.trim() || comment.trim().length < 10}
        className="justify-self-start rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
      >
        {loading ? t("ratingSending") : t("ratingSubmit")}
      </button>
      {error && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-[11px] font-semibold text-brand-700">
          {error.text}{" "}
          {error.auth && (
            <Link
              href={`/masuk?next=${encodeURIComponent("/bantuan")}`}
              className="underline underline-offset-2"
            >
              {t("ratingLoginCta")}
            </Link>
          )}
        </p>
      )}
    </form>
  );
}
