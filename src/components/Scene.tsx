/**
 * Ilustrasi SVG flat sebagai pengganti foto pada prototipe (aman offline,
 * tanpa aset eksternal). Setiap varian mewakili nuansa layanan UNANG LOJA.
 */

const PALETTES: Record<string, { sky1: string; sky2: string; hill1: string; hill2: string; water: string; sun: string }> = {
  hero: { sky1: "#dff0fa", sky2: "#f6efe2", hill1: "#2d547f", hill2: "#1d3a5c", water: "#7fb6d9", sun: "#f2c94c" },
  culture: { sky1: "#f3e8d8", sky2: "#fdf6e6", hill1: "#7c5a33", hill2: "#5d431f", water: "#a58b5e", sun: "#e8a625" },
  delivery: { sky1: "#e8f2fa", sky2: "#fbf8f0", hill1: "#35608d", hill2: "#24476f", water: "#a8cbe4", sun: "#f2c94c" },
  locker: { sky1: "#fdf3dd", sky2: "#f9ece9", hill1: "#a5342b", hill2: "#7c2a21", water: "#d9a86c", sun: "#e8a625" },
  sunset: { sky1: "#fbe0c3", sky2: "#fdf6e6", hill1: "#5d431f", hill2: "#3d2c14", water: "#d98a5e", sun: "#f2994a" },
  guide: { sky1: "#e3f0e4", sky2: "#f9f6ee", hill1: "#3f6d50", hill2: "#2c4d39", water: "#93c2a2", sun: "#f2c94c" },
};

export type SceneVariant = "hero" | "culture" | "delivery" | "locker" | "sunset" | "guide";

export default function Scene({
  variant = "hero",
  className = "",
}: {
  variant?: SceneVariant;
  className?: string;
}) {
  const c = PALETTES[variant] ?? PALETTES.hero;
  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.sky1} />
          <stop offset="1" stopColor={c.sky2} />
        </linearGradient>
        <linearGradient id={`water-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.water} />
          <stop offset="1" stopColor={c.hill2} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* langit & matahari */}
      <rect width="400" height="260" fill={`url(#sky-${variant})`} />
      <circle cx="318" cy="64" r="26" fill={c.sun} opacity="0.9" />

      {/* bukit berlapis (siluet Samosir) */}
      <path d="M0 150 Q70 96 150 138 Q230 178 300 132 Q355 96 400 128 L400 260 L0 260 Z" fill={c.hill1} opacity="0.75" />
      <path d="M0 190 Q90 140 190 180 Q290 220 400 172 L400 260 L0 260 Z" fill={c.hill2} opacity="0.9" />

      {/* danau */}
      <rect y="206" width="400" height="54" fill={`url(#water-${variant})`} />

      {/* motif khas per varian */}
      {variant === "hero" && (
        <>
          {/* sampan (perahu danau Toba) */}
          <path d="M168 222 Q200 236 236 222 L228 232 Q200 240 176 232 Z" fill="#3a2a18" />
          <path d="M198 222 L198 200 L212 208 L212 222 Z" fill="#5d431f" />
          <path d="M212 210 Q226 216 212 222 Z" fill="#8c2c24" />
          <ellipse cx="290" cy="236" rx="30" ry="3" fill="#ffffff" opacity="0.35" />
          <ellipse cx="110" cy="242" rx="22" ry="2.5" fill="#ffffff" opacity="0.3" />
        </>
      )}
      {variant === "culture" && (
        <>
          {/* rumah bolon (rumah adat Batak) */}
          <path d="M150 176 L200 150 L250 176 L242 180 L242 208 L158 208 L158 180 Z" fill="#4a3320" />
          <path d="M144 178 L200 148 L256 178 L250 186 L200 158 L150 186 Z" fill="#2c1d0e" />
          <rect x="186" y="188" width="28" height="20" fill="#1c1208" />
          <path d="M158 180 L242 180" stroke="#e8a625" strokeWidth="3" />
        </>
      )}
      {variant === "delivery" && (
        <>
          {/* van kurir bagasi */}
          <rect x="140" y="182" width="86" height="34" rx="6" fill="#24476f" />
          <rect x="196" y="188" width="26" height="20" rx="3" fill="#dce7f2" />
          <circle cx="158" cy="220" r="9" fill="#1a1c1e" />
          <circle cx="158" cy="220" r="3.5" fill="#9aa3ab" />
          <circle cx="210" cy="220" r="9" fill="#1a1c1e" />
          <circle cx="210" cy="220" r="3.5" fill="#9aa3ab" />
          <rect x="150" y="172" width="18" height="14" rx="3" fill="#b03a2e" />
        </>
      )}
      {variant === "locker" && (
        <>
          {/* loker penitipan bagasi */}
          <rect x="132" y="140" width="136" height="76" rx="8" fill="#24476f" />
          {[0, 1, 2].map((col) =>
            [0, 1].map((row) => (
              <rect
                key={`${col}-${row}`}
                x={144 + col * 42}
                y={150 + row * 32}
                width="32"
                height="24"
                rx="3"
                fill={row === 0 ? "#8c2c24" : "#dce7f2"}
              />
            )),
          )}
          <rect x="264" y="168" width="30" height="48" rx="6" fill="#5d431f" />
          <rect x="272" y="186" width="14" height="5" rx="2.5" fill="#e8a625" />
        </>
      )}
      {variant === "sunset" && (
        <>
          <circle cx="200" cy="196" r="34" fill={c.sun} opacity="0.95" />
          <rect x="0" y="206" width="400" height="6" fill="#3d2c14" opacity="0.4" />
          <path d="M96 230 Q120 222 150 230" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M240 236 Q270 228 300 236" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.4" />
        </>
      )}
      {variant === "guide" && (
        <>
          {/* pramuwisata dengan peta */}
          <circle cx="200" cy="164" r="16" fill="#4a3320" />
          <path d="M176 214 Q200 186 224 214 L224 226 L176 226 Z" fill="#a5342b" />
          <rect x="216" y="196" width="26" height="18" rx="3" fill="#fdf6e6" transform="rotate(-8 216 196)" />
          <path d="M220 200 L236 196 M220 205 L236 201" stroke="#b4831d" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
