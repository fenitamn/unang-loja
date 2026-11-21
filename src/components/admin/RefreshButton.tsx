"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/admin/Icon";

export default function RefreshButton({ label = "Muat ulang" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-2 text-[10px] font-bold text-navy-800 hover:border-navy-300 disabled:opacity-60"
    >
      <Icon name="refresh" className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Memuat…" : label}
    </button>
  );
}
