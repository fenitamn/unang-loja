import Image from "next/image";

export default function Logo({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="Logo UNANG LOJA"
        width={44}
        height={44}
        priority
        className="h-11 w-11 rounded-lg border border-line bg-white object-cover shadow-sm"
      />
      <span className="leading-none">
        <span
          className={`block font-serif text-[15px] font-bold tracking-wide ${
            light ? "text-white" : "text-navy-900"
          }`}
        >
          UNANG LOJA
        </span>
        {!compact && (
          <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-gold-600">
            Samosir · Danau Toba
          </span>
        )}
      </span>
    </span>
  );
}
