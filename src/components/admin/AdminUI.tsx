import type { ReactNode } from "react";
import Icon, { type IconName } from "@/components/admin/Icon";
import { PAYMENT_LABEL, PAYMENT_STYLE, STATUS_LABEL, STATUS_STYLE } from "@/lib/admin-ui";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-serif text-2xl font-bold text-navy-900 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  id,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`rounded-xl border border-line bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5 md:px-5">
          <div>
            {title && <h2 className="font-serif text-base font-bold text-navy-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[11px] text-ink-soft">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  navy: "bg-navy-50 text-navy-800",
  gold: "bg-gold-50 text-gold-700",
  brand: "bg-brand-50 text-brand-700",
  lake: "bg-lake-50 text-lake-700",
  green: "bg-green-50 text-green-700",
};

export function StatCard({
  label,
  value,
  note,
  icon,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  note?: string;
  icon: IconName;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${TONES[tone] ?? TONES.navy}`}>
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 font-serif text-2xl font-bold leading-none text-navy-900">{value}</p>
      {note && <p className="mt-1.5 text-[10px] leading-snug text-ink-soft">{note}</p>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
        STATUS_STYLE[status] ?? "border-line bg-cream text-ink-soft"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PaymentPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
        PAYMENT_STYLE[status] ?? "border-line bg-cream text-ink-soft"
      }`}
    >
      {PAYMENT_LABEL[status] ?? status}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  icon = "receipt",
  children,
}: {
  title: string;
  description?: string;
  icon?: IconName;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-cream-deep text-navy-400">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-3 font-serif text-base font-bold text-navy-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-soft">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function Progress({
  value,
  max,
  tone = "bg-navy-800",
}: {
  value: number;
  max: number;
  tone?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-deep">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`whitespace-nowrap px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-ink-soft ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-top text-xs text-ink ${className}`}>{children}</td>;
}
