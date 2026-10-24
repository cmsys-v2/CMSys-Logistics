"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ── Ambient background: aurora blobs + tactical grid + grain ─────────────── */
export function BackgroundFX({ dense = false }: { dense?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-70" />
      <div
        className="aurora animate-aurora-a"
        style={{
          width: "52vw",
          height: "52vw",
          top: "-18vw",
          right: "-10vw",
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 55%, transparent), transparent 66%)",
        }}
      />
      <div
        className="aurora animate-aurora-b"
        style={{
          width: "44vw",
          height: "44vw",
          bottom: "-16vw",
          left: "-12vw",
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 42%, transparent), transparent 68%)",
        }}
      />
      {dense && (
        <div
          className="aurora animate-aurora-c"
          style={{
            width: "30vw",
            height: "30vw",
            top: "35%",
            left: "45%",
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--chart-5) 30%, transparent), transparent 68%)",
          }}
        />
      )}
      <div className="absolute inset-0 noise" />
      <div className="absolute inset-x-0 top-0 h-[38vh] bg-gradient-to-b from-black/20 to-transparent dark:from-black/40" />
    </div>
  );
}

/* ── Count-up number, respects reduced motion ────────────────────────────── */
export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  duration = 1100,
  className,
  startOnMount = true,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  startOnMount?: boolean;
}) {
  const [display, setDisplay] = useState(startOnMount ? 0 : value);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const raf = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(raf);
    }
    const from = fromRef.current;
    const delta = value - from;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + delta * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return <span className={cn("tabular-nums", className)}>{format(display)}</span>;
}

/* ── Sparkline with gradient area ────────────────────────────────────────── */
export function Sparkline({
  data,
  className,
  stroke = "var(--primary)",
  height = 34,
  fill = true,
}: {
  data: number[];
  className?: string;
  stroke?: string;
  height?: number;
  fill?: boolean;
}) {
  const rawId = useId();
  const id = `sp-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const points = data.length > 1 ? data : [0, 0];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const w = 100;
  const h = height;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => {
    const x = i * step;
    const y = h - 4 - ((v - min) / span) * (h - 8);
    return [x, y] as const;
  });
  const line = coords
    .map(([x, y], i) => {
      if (i === 0) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
      const [px, py] = coords[i - 1];
      const cx = (px + x) / 2;
      return `C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.42" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id}-g)`} />}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ── Radial gauge ────────────────────────────────────────────────────────── */
export function RadialGauge({
  value,
  size = 64,
  thickness = 6,
  label,
  color = "var(--primary)",
}: {
  value: number;
  size?: number;
  thickness?: number;
  label?: string;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--border) 90%, transparent)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold tabular-nums">
        {label ?? `${Math.round(clamped)}%`}
      </span>
    </div>
  );
}

/* ── Section header for panels ───────────────────────────────────────────── */
export function PanelHeading({
  title,
  subtitle,
  icon: Icon,
  actions,
  accent = "var(--primary)",
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 34%, transparent)`,
              background: `linear-gradient(150deg, color-mix(in srgb, ${accent} 22%, transparent), transparent)`,
              color: accent,
            }}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-[11.5px] font-medium leading-snug text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Segmented control (used for view switches) ──────────────────────────── */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-border/70 bg-secondary/60 p-1 backdrop-blur",
        className
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all duration-200",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className={cn("h-3.5 w-3.5", active ? "text-primary" : "opacity-70")} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
