"use client";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { AnimatedNumber } from "./fx";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "blue" | "green" | "amber" | "red" | "purple" | "pink";
  sub?: string;
}

const accentMap = {
  blue: { hex: "#2f8dff", iconBg: "from-blue-500/25 to-blue-600/5 text-blue-500 dark:text-blue-400 border-blue-500/35" },
  green: { hex: "#22d3a7", iconBg: "from-emerald-500/25 to-teal-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/35" },
  amber: { hex: "#f0b429", iconBg: "from-amber-500/25 to-orange-600/5 text-amber-600 dark:text-amber-400 border-amber-500/35" },
  red: { hex: "#f05252", iconBg: "from-red-500/25 to-rose-600/5 text-red-600 dark:text-red-400 border-red-500/35" },
  purple: { hex: "#a175ff", iconBg: "from-violet-500/25 to-purple-600/5 text-violet-600 dark:text-violet-400 border-violet-500/35" },
  pink: { hex: "#ec4899", iconBg: "from-pink-500/25 to-rose-600/5 text-pink-600 dark:text-pink-400 border-pink-500/35" },
};

export function StatCard({ label, value, icon: Icon, accent = "blue", sub }: StatCardProps) {
  const config = accentMap[accent] || accentMap.blue;
  const numeric = typeof value === "number" ? value : null;

  return (
    <div className="panel panel-hover group relative overflow-hidden p-4">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
        style={{ background: `radial-gradient(circle, ${config.hex}, transparent 70%)` }}
      />
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-xs transition-transform duration-300 group-hover:scale-105",
            config.iconBg
          )}
        >
          <Icon className="h-4.5 w-4.5 stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[9.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-[19px] font-black leading-none tracking-tight tabular-nums text-foreground">
            {numeric !== null ? <AnimatedNumber value={numeric} /> : value}
          </p>
          {sub && <p className="mt-1.5 truncate text-[10px] font-medium text-muted-foreground">{sub}</p>}
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${config.hex}, transparent)` }}
      />
    </div>
  );
}
