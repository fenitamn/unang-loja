import { Link as LocaleLink } from "@/i18n/navigation";

/** Label kecil huruf kapital warna emas di atas judul section. */
export function Eyebrow({
  children,
  icon,
  tone = "gold",
  className = "",
}: {
  children: React.ReactNode;
  icon?: string;
  tone?: "gold" | "cream" | "outline";
  className?: string;
}) {
  const styles =
    tone === "outline"
      ? "border border-gold-200 bg-white text-gold-700"
      : tone === "cream"
        ? "bg-gold-50 text-gold-700 border border-gold-200"
        : "text-gold-600";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${styles} ${className}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

/** Judul section serif besar. */
export function SectionTitle({
  children,
  center = false,
  className = "",
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <h2
      className={`font-serif text-2xl font-bold text-navy-900 md:text-[32px] md:leading-tight ${
        center ? "text-center" : ""
      } ${className}`}
    >
      {children}
    </h2>
  );
}

export function StarRow({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "text-gold-500" : "text-navy-100"}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Garis pemisah dengan ornamen Gorga Simeol-meol di tengah (gaya prototipe). */
export function DividerIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-4 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-line md:w-24" />
      <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white">
        <svg
          viewBox="0 0 32 32"
          className="h-7 w-7 text-gold-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="16" cy="16" r="13" strokeDasharray="2 3" />
          <path
            d="M11 16c0-2.761 2.239-5 5-5s5 2.239 5 5-2.239 5-5 5"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="h-px w-16 bg-line md:w-24" />
    </div>
  );
}

/** Breadcrumb bergaya prototipe: ikon rumah + pemisah garis miring. */
export function Breadcrumb({
  items,
  homeLabel = "Beranda",
}: {
  items: string[];
  homeLabel?: string;
}) {
  return (
    <nav
      className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft"
      aria-label="Breadcrumb"
    >
      <LocaleLink href="/" className="flex items-center gap-1.5 hover:text-navy-800">
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
        {homeLabel}
      </LocaleLink>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-navy-200">/</span>
          <span className={i === items.length - 1 ? "text-navy-800" : ""}>{item}</span>
        </span>
      ))}
    </nav>
  );
}

/** Strip pemisah halaman tipis warna emas-putih. */
export function GoldRule({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-line ${className}`} aria-hidden="true" />;
}

export function dummyLink(href: string) {
  return href;
}
