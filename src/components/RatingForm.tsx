"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function RatingForm() {
  const t = useTranslations("help");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="mt-4 rounded-xl bg-lake-50 px-4 py-4 text-sm font-medium text-lake-800">
        🙏 {t("ratingThanks")}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (rating > 0) setSent(true);
      }}
      className="mt-4 grid gap-4"
    >
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
                (hover || rating) >= n ? "text-ulos-500" : "text-neutral-300"
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
          placeholder="UL-…"
          className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">{t("ratingComment")}</span>
        <textarea
          rows={3}
          className="rounded-xl border border-lake-200 px-3 py-2.5 text-sm outline-none focus:border-lake-500"
        />
      </label>
      <button
        type="submit"
        disabled={rating === 0}
        className="justify-self-start rounded-full bg-ulos-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-ulos-600 disabled:opacity-40"
      >
        {t("ratingSubmit")}
      </button>
    </form>
  );
}
