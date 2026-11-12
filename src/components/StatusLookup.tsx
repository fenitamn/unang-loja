"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DEMO_ORDERS,
  STATUS_STATES,
  formatIDR,
  getService,
  type DemoOrder,
} from "@/lib/data";

export default function StatusLookup() {
  const t = useTranslations("status");
  const ts = useTranslations("services");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DemoOrder | null | undefined>(undefined);

  function search() {
    const q = query.trim().toUpperCase();
    const found = DEMO_ORDERS.find(
      (o) => o.orderNo === q || o.resi === q || o.sealNo === q,
    );
    setResult(found ?? null);
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder={t("placeholder")}
          className="flex-1 rounded-xl border border-lake-200 px-4 py-3 text-sm outline-none focus:border-lake-500"
        />
        <button
          type="button"
          onClick={search}
          className="rounded-xl bg-lake-700 px-6 py-3 text-sm font-semibold text-white hover:bg-lake-800"
        >
          {t("search")}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
        <span>{t("resiHint")}</span>
        <button
          type="button"
          onClick={() => {
            setQuery(DEMO_ORDERS[0].orderNo);
            search();
          }}
          className="rounded-full border border-lake-200 px-2.5 py-1 font-medium text-lake-700 hover:bg-lake-50"
        >
          {t("sample")}
        </button>
      </div>

      {result === null && (
        <p className="mt-6 rounded-xl bg-ulos-50 px-4 py-3 text-sm text-ulos-700">
          {t("notFound")}
        </p>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Pesanan */}
          <div className="rounded-2xl border border-lake-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs text-neutral-400">{t("order")}</p>
                <p className="text-lg font-extrabold text-lake-900">{result.orderNo}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">{t("service")}</p>
                <p className="text-sm font-semibold text-lake-800">
                  {ts(`items.${result.serviceKey}.name`)}
                </p>
                <p className="text-xs text-neutral-500">{formatIDR(getService(result.serviceKey).price)}</p>
              </div>
            </div>

            <p className="mt-2 text-sm text-neutral-600">
              {t("date")}: <span className="font-medium">{result.date}</span>
              {result.guide !== "-" && (
                <> · Pemandu: <span className="font-medium">{result.guide}</span></>
              )}
            </p>

            {/* Timeline status */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {t("timeline")}
              </p>
              <ol className="mt-3 flex items-center">
                {STATUS_STATES.map((state, i) => {
                  const done = i <= result.stateIndex;
                  return (
                    <li key={state} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center">
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                            done
                              ? "bg-lake-600 text-white"
                              : "bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          {done ? "✓" : i + 1}
                        </span>
                        <span
                          className={`mt-1 text-center text-[10px] leading-tight ${
                            done ? "text-lake-800 font-medium" : "text-neutral-400"
                          }`}
                        >
                          {t(`states.${state}`)}
                        </span>
                      </div>
                      {i < STATUS_STATES.length - 1 && (
                        <span
                          className={`mx-1 h-0.5 flex-1 ${
                            i < result.stateIndex ? "bg-lake-600" : "bg-neutral-100"
                          }`}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Bagasi */}
          {result.luggage && (
            <div className="rounded-2xl border border-lake-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-lake-900">{t("luggage")}</p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <div className="rounded-xl bg-lake-50 p-3">
                  <dt className="text-xs text-neutral-500">{t("luggageResi")}</dt>
                  <dd className="font-mono font-bold text-lake-900">{result.resi}</dd>
                </div>
                <div className="rounded-xl bg-lake-50 p-3">
                  <dt className="text-xs text-neutral-500">{t("luggageSeal")}</dt>
                  <dd className="font-mono font-bold text-ulos-600">{result.sealNo}</dd>
                </div>
                <div className="col-span-2 rounded-xl bg-sand-100 p-3 md:col-span-1">
                  <dt className="text-xs text-neutral-500">📷</dt>
                  <dd className="text-xs text-neutral-600">{t("luggagePhotos")}</dd>
                </div>
              </dl>
            </div>
          )}

          <p className="rounded-xl bg-sand-100 px-4 py-3 text-xs text-neutral-500">
            ℹ️ {t("manualNote")} — {t("demoNote")}
          </p>
        </div>
      )}
    </div>
  );
}
