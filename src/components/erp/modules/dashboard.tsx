"use client";

import { useMemo, useState, useEffect } from "react";
import { useFetch, apiRequest } from "@/lib/use-fetch";
import { LoadingState, ErrorState } from "@/components/erp/states";
import { CustomBadge } from "@/components/erp/badges";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  FolderKanban,
  FileText,
  Warehouse,
  PackageCheck,
  ArrowRight,
  ArrowUpRight,
  Percent,
  Coins,
  Trophy,
  PieChart as PieChartIcon,
  Gauge,
  Settings,
  Eye,
  EyeOff,
  Search,
  CheckCheck,
  Square,
  Loader2,
  X,
  AlertTriangle,
  Search as SearchIcon,
  Boxes,
  CalendarClock,
  Radar,
  Activity,
  Layers,
  FileBarChart,
  Anchor,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatCurrency, utilizationColor, projectStatusColor } from "@/lib/constants";
import { ModuleId } from "../nav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AnimatedNumber, PanelHeading, RadialGauge, Segmented, Sparkline } from "../fx";
import { CrestMark } from "@/components/brand/cmsys-brand";

/* ═══════════════════════════════ TYPES ═══════════════════════════════════ */

interface TopProject {
  id: string;
  name: string;
  voteNumber: string;
  voteAllocation: number;
  committed: number;
  actualSpent: number;
  balance: number;
  utilization: number;
  fileCount: number;
  inProcessFiles?: number;
  completedFiles?: number;
  fileValue: number;
  status: string;
}

interface Project {
  id: string;
  name: string;
  nameAbbreviation?: string | null;
  voteNumber: string;
  voteAllocation: number;
  committed: number;
  actualSpent: number;
  utilization?: number;
  status: string;
  projectType?: string | null;
  showOnDashboard?: boolean;
}

interface Stats {
  projects: {
    total: number;
    active: number;
    voteAllocation: number;
    committed: number;
    actualSpent: number;
    balance: number;
  };
  procurement: { total: number; pendingCollection: number };
  stores: { totalItems: number; stockValue: number; lowStock: number; zones: number };
  rateFinder: { rcCount: number };
  collection: { partSupplyActive: number; dailyToday: number; dailyTotal: number };
  topProjects: TopProject[];
}

const DONUT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#64748b",
];

const UTILIZATION_COLORS: Record<string, string> = {
  "Under 50%": "#22c55e",
  "50-70%": "#3b82f6",
  "70-90%": "#f59e0b",
  "Over 90%": "#ef4444",
};

const UTIL_BUCKETS = [
  { name: "Under 50%", min: 0, max: 50 },
  { name: "50-70%", min: 50, max: 70 },
  { name: "70-90%", min: 70, max: 90 },
  { name: "Over 90%", min: 90, max: Infinity },
];

const compactMoney = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rs ${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `Rs ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `Rs ${(n / 1_000).toFixed(0)}K`;
  return `Rs ${Math.round(n)}`;
};

const chartTooltipStyle: React.CSSProperties = {
  background: "color-mix(in srgb, var(--popover) 96%, transparent)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  fontSize: 12,
  padding: "10px 12px",
  boxShadow: "0 20px 44px -22px rgba(0,0,0,0.6)",
  backdropFilter: "blur(14px)",
};

/* ═══════════════════════════════ DASHBOARD ═══════════════════════════════ */

export function Dashboard({ onNavigate }: { onNavigate: (m: ModuleId) => void }) {
  const { data: stats, loading, error, refresh: refreshStats } = useFetch<Stats>("/api/stats");
  const { data: procurement } = useFetch<{ presentPosition: string }[]>("/api/procurement");
  const { data: allProjects, refresh: refreshProjects } = useFetch<Project[]>("/api/projects");
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshProjects();
      refreshStats();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshProjects, refreshStats]);

  const [viewMode, setViewMode] = useState<"value" | "percent">("value");
  const [activeProjectsLimit, setActiveProjectsLimit] = useState<number | "ALL">(6);
  const [manageOpen, setManageOpen] = useState(false);
  const [activeAllocIdx, setActiveAllocIdx] = useState<number | null>(null);
  const [activeUtilIdx, setActiveUtilIdx] = useState<number | null>(null);

  const visibleProjects = useMemo<Project[]>(
    () => (allProjects ?? []).filter((p) => p.showOnDashboard !== false),
    [allProjects]
  );

  const allocationData = useMemo(() => {
    const source = (allProjects ?? []) as Project[];
    const items = source
      .filter((p) => p.showOnDashboard !== false && (p.voteAllocation ?? 0) > 0)
      .map((p) => ({ id: p.id, name: p.name, value: p.voteAllocation ?? 0 }))
      .sort((a, b) => b.value - a.value);
    const top = items.slice(0, 5);
    const rest = items.slice(5);
    const slices = top.map((d, i) => ({
      name: d.name,
      value: d.value,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
      isOthers: false,
    }));
    if (rest.length > 0) {
      slices.push({
        name: `Others (${rest.length})`,
        value: rest.reduce((s, d) => s + d.value, 0),
        color: DONUT_COLORS[5],
        isOthers: true,
      });
    }
    const total = slices.reduce((s, d) => s + d.value, 0);
    return { slices, total, projectCount: items.length };
  }, [allProjects]);

  const utilBucketData = useMemo(() => {
    const source = (allProjects ?? []) as Project[];
    return UTIL_BUCKETS.map((b) => ({
      name: b.name,
      value: source.filter((p) => {
        if (p.showOnDashboard === false) return false;
        const u = p.utilization ?? 0;
        return u >= b.min && u < b.max;
      }).length,
    }));
  }, [allProjects]);
  const totalProjectsCounted = utilBucketData.reduce((s, d) => s + d.value, 0);

  const visibleTopProjects = useMemo<TopProject[]>(() => {
    const tps = stats?.topProjects ?? [];
    if (!allProjects) return tps;
    const visibleIds = new Set(
      allProjects.filter((p) => p.showOnDashboard !== false).map((p) => p.id)
    );
    return tps.filter((p) => visibleIds.has(p.id));
  }, [stats, allProjects]);

  const displayedActiveProjects = useMemo(() => {
    if (activeProjectsLimit === "ALL") return visibleTopProjects;
    return visibleTopProjects.slice(0, activeProjectsLimit);
  }, [visibleTopProjects, activeProjectsLimit]);

  const handleToggleVisibility = async (project: Project, next: boolean) => {
    const res = await apiRequest(`/api/projects/${project.id}`, "PUT", {
      showOnDashboard: next,
    });
    if (res.ok) {
      toast({
        title: next ? "Project pinned to dashboard" : "Project removed from dashboard",
        description: project.name,
      });
      refreshProjects();
      refreshStats();
    } else {
      toast({
        title: "Update failed",
        description: res.error || "Could not update project visibility",
        variant: "destructive",
      });
    }
  };

  if (loading) return <LoadingState label="Loading command metrics…" />;
  if (error || !stats) return <ErrorState message={error || "No data"} />;

  const topProjects = visibleTopProjects;
  const totalProjectsAll = allProjects?.length ?? 0;

  const projectChart = displayedActiveProjects.map((p) => ({
    name: p.name.length > 16 ? p.name.slice(0, 14) + "…" : p.name,
    Allocation: viewMode === "value" ? Math.round(p.voteAllocation / 1000000) : Math.round(p.utilization),
    Committed:
      viewMode === "value"
        ? Math.round(p.committed / 1000000)
        : p.voteAllocation > 0
          ? Math.round((p.committed / p.voteAllocation) * 100)
          : 0,
    Spent: viewMode === "value" ? Math.round(p.actualSpent / 1000000) : Math.round(p.utilization),
  }));

  const posCounts: Record<string, number> = {};
  procurement?.forEach((f) => {
    posCounts[f.presentPosition] = (posCounts[f.presentPosition] || 0) + 1;
  });
  const posChart = Object.entries(posCounts).map(([name, value]) => ({ name, value }));

  const utilizationPct =
    stats.projects.voteAllocation > 0
      ? (stats.projects.actualSpent / stats.projects.voteAllocation) * 100
      : 0;
  const commitmentPct =
    stats.projects.voteAllocation > 0
      ? (stats.projects.committed / stats.projects.voteAllocation) * 100
      : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const kpis = [
    {
      label: "Total vote allocation",
      value: stats.projects.voteAllocation,
      icon: Wallet,
      accent: "#2f8dff",
      sub: `${stats.projects.total} projects on the books`,
      trend: [42, 46, 44, 52, 58, 55, 63, 68, 72, 78],
      trendLabel: "+8.4%",
      trendTone: "text-emerald-400",
    },
    {
      label: "Committed",
      value: stats.projects.committed,
      icon: TrendingUp,
      accent: "#f0b429",
      sub: `${commitmentPct.toFixed(0)}% of allocation`,
      trend: [30, 34, 39, 36, 44, 48, 52, 50, 57, 61],
      trendLabel: `${commitmentPct.toFixed(0)}%`,
      trendTone: "text-amber-400",
    },
    {
      label: "Actual spent",
      value: stats.projects.actualSpent,
      icon: TrendingDown,
      accent: "#f05252",
      sub: `Balance ${compactMoney(stats.projects.balance)}`,
      trend: [62, 58, 55, 51, 47, 44, 40, 37, 33, 30],
      trendLabel: `${utilizationPct.toFixed(0)}%`,
      trendTone: "text-rose-400",
    },
    {
      label: "Active projects",
      value: stats.projects.active,
      icon: FolderKanban,
      accent: "#22d3a7",
      sub: `${stats.procurement.total} procurement files`,
      trend: [4, 5, 5, 6, 6, 7, 7, 8, 8, 9],
      trendLabel: "live",
      trendTone: "text-emerald-400",
      raw: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* ══════════════════ HERO ══════════════════ */}
      <section className="panel relative overflow-hidden p-5 sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--gold) 45%, transparent), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full opacity-45 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--primary) 55%, transparent), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live operations
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <Anchor className="h-2.5 w-2.5 text-[var(--gold)]" />
                SLN Logistics · Trincomalee
              </span>
              {(stats as Stats & { demo?: boolean }).demo && (
                <span className="flex items-center gap-1.5 rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
                  Preview data
                </span>
              )}
            </div>

            <h1 className="mt-3 flex flex-wrap items-baseline gap-x-2.5 text-[26px] font-black leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[34px]">
              {greeting},
              <span className="text-steel">Commander</span>
              <span className="text-gold">.</span>
            </h1>
            <p className="mt-2 max-w-lg text-[12px] font-medium leading-relaxed text-muted-foreground">
              {stats.projects.active} active votes in motion,{" "}
              <span className="font-bold text-foreground">{stats.procurement.pendingCollection}</span>{" "}
              files awaiting collection and{" "}
              <span className="font-bold text-foreground">{stats.stores.lowStock}</span> store lines at
              or below minimum stock.
            </p>

            {/* hero metrics */}
            <div className="mt-5 grid max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { label: "Allocated", value: compactMoney(stats.projects.voteAllocation), tone: "text-foreground" },
                { label: "Committed", value: compactMoney(stats.projects.committed), tone: "text-[var(--chart-3)]" },
                { label: "Spent", value: compactMoney(stats.projects.actualSpent), tone: "text-foreground" },
                { label: "Available", value: compactMoney(stats.projects.balance), tone: "text-emerald-400" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-border/60 bg-card/50 px-3 py-2 backdrop-blur transition-colors hover:border-primary/40"
                >
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {m.label}
                  </p>
                  <p className={cn("mt-1 text-[14.5px] font-bold leading-none tabular-nums", m.tone)}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* crest orb + utilization */}
          <div className="relative flex shrink-0 items-center gap-5 self-start lg:self-center">
            <div className="relative hidden sm:block">
              <div
                className="absolute inset-0 animate-sonar rounded-full border border-primary/30"
                style={{ animationDelay: "0.6s" }}
              />
              <div className="flex h-[124px] w-[124px] items-center justify-center rounded-full border border-border/60 bg-gradient-to-br from-secondary/60 to-transparent">
                <CrestMark size={84} className="animate-float-slow" />
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/50 p-3.5 backdrop-blur">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Vote utilisation
              </p>
              <div className="mt-2 flex items-center gap-3">
                <RadialGauge value={utilizationPct} size={62} thickness={7} color="var(--chart-2)" />
                <div className="space-y-1.5">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Committed
                    </p>
                    <p className="text-[12px] font-bold tabular-nums text-[var(--chart-3)]">
                      {commitmentPct.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Files
                    </p>
                    <p className="text-[12px] font-bold tabular-nums text-foreground">
                      {stats.procurement.total}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* quick action rail */}
        <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
            Quick actions
          </span>
          {[
            { label: "Projects", icon: FolderKanban, target: "projects" as ModuleId },
            { label: "Procurement files", icon: FileText, target: "procurement" as ModuleId },
            { label: "Rate finder", icon: SearchIcon, target: "rate-finder" as ModuleId },
            { label: "Collection", icon: PackageCheck, target: "collection" as ModuleId },
            { label: "Stores", icon: Warehouse, target: "stores" as ModuleId },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.target)}
              className="group flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:text-foreground"
            >
              <a.icon className="h-3 w-3 text-primary" />
              {a.label}
              <ArrowUpRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════ KPI STRIP ══════════════════ */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={cn(
                "panel panel-hover group relative overflow-hidden p-4"
              )}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
                style={{ background: `radial-gradient(circle, ${k.accent}, transparent 70%)` }}
              />
              <div className="flex items-start justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl border"
                  style={{
                    borderColor: `color-mix(in srgb, ${k.accent} 38%, transparent)`,
                    background: `linear-gradient(150deg, color-mix(in srgb, ${k.accent} 24%, transparent), transparent)`,
                    color: k.accent,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "rounded-full border border-border/60 bg-secondary/50 px-1.5 py-0.5 text-[9px] font-bold tabular-nums",
                    k.trendTone
                  )}
                >
                  {k.trendLabel}
                </span>
              </div>

              <p className="mt-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1 text-[21px] font-black leading-none tracking-tight text-foreground">
                {k.raw ? (
                  <AnimatedNumber value={k.value} />
                ) : (
                  <AnimatedNumber value={k.value} format={(n) => compactMoney(n)} />
                )}
              </p>
              <p className="mt-1.5 truncate text-[10px] font-medium text-muted-foreground">{k.sub}</p>

              <div className="mt-2.5 flex items-end justify-between gap-2">
                <div className="h-8 flex-1 opacity-80 transition-opacity group-hover:opacity-100">
                  <Sparkline data={k.trend} height={32} stroke={k.accent} />
                </div>
                <span className="mb-0.5 font-mono text-[8.5px] uppercase tracking-wider text-muted-foreground/60">
                  30d
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* ══════════════════ SIGNAL CHIPS ══════════════════ */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Pending collection",
            value: stats.procurement.pendingCollection,
            icon: CalendarClock,
            accent: "#f0b429",
            go: "procurement" as ModuleId,
          },
          {
            label: "Stock value",
            value: compactMoney(stats.stores.stockValue),
            icon: Boxes,
            accent: "#2f8dff",
            go: "stores" as ModuleId,
          },
          {
            label: "Low stock lines",
            value: stats.stores.lowStock,
            icon: AlertTriangle,
            accent: "#f05252",
            go: "stores" as ModuleId,
          },
          {
            label: "Part supply active",
            value: stats.collection.partSupplyActive,
            icon: PackageCheck,
            accent: "#22d3a7",
            go: "collection" as ModuleId,
          },
          {
            label: "Collected today",
            value: stats.collection.dailyToday,
            icon: Activity,
            accent: "#2ad4e8",
            go: "collection" as ModuleId,
          },
          {
            label: "Rate contracts",
            value: stats.rateFinder.rcCount,
            icon: Layers,
            accent: "#a175ff",
            go: "rate-finder" as ModuleId,
          },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => onNavigate(s.go)}
            className="panel group flex items-center gap-2.5 px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
              style={{
                borderColor: `color-mix(in srgb, ${s.accent} 35%, transparent)`,
                background: `color-mix(in srgb, ${s.accent} 14%, transparent)`,
                color: s.accent,
              }}
            >
              <s.icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[8.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {s.label}
              </span>
              <span className="mt-0.5 block text-[13px] font-bold leading-none tabular-nums text-foreground">
                {s.value}
              </span>
            </span>
          </button>
        ))}
      </section>

      {/* ══════════════════ ACTIVE PROJECTS ══════════════════ */}
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/50 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <PanelHeading
            title="Active votes & utilisation"
            subtitle={`${displayedActiveProjects.length} of ${topProjects.length} active projects · ${visibleProjects.length}/${totalProjectsAll} visible on deck`}
            icon={Trophy}
            accent="var(--gold)"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "value", label: "By value", icon: Coins },
                { value: "percent", label: "By %", icon: Percent },
              ]}
            />
            <div className="inline-flex items-center gap-0.5 rounded-xl border border-border/70 bg-secondary/60 p-1">
              {([6, 12, "ALL"] as const).map((n) => (
                <button
                  key={String(n)}
                  onClick={() => setActiveProjectsLimit(n)}
                  className={cn(
                    "rounded-lg px-2 py-1 text-[10px] font-bold transition-all",
                    activeProjectsLimit === n
                      ? "bg-card text-foreground shadow-sm ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {n === "ALL" ? `All ${topProjects.length}` : n}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManageOpen(true)}
              className="h-8 rounded-xl border-border/70 text-[10.5px] font-bold"
            >
              <Settings className="mr-1.5 h-3 w-3" /> Manage
            </Button>
            <button
              onClick={() => onNavigate("projects")}
              className="group flex items-center gap-1 text-[10.5px] font-bold text-primary transition-colors hover:text-[var(--accent)]"
            >
              Open projects
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {topProjects.length === 0 ? (
          <p className="py-12 text-center text-[12px] text-muted-foreground">
            No projects pinned.{" "}
            <button
              onClick={() => setManageOpen(true)}
              className="font-semibold text-primary hover:underline"
            >
              Choose projects to display
            </button>
          </p>
        ) : (
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {displayedActiveProjects.map((p, idx) => {
                const util = p.utilization || 0;
                const inProc = p.inProcessFiles ?? 0;
                const comp = p.completedFiles ?? Math.max(0, (p.fileCount || 0) - inProc);
                const allocatedVal = p.voteAllocation || 0;
                const committedPct = allocatedVal > 0 ? Math.min(100, (p.committed / allocatedVal) * 100) : 0;
                const spentPct = allocatedVal > 0 ? Math.min(100, (p.actualSpent / allocatedVal) * 100) : 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => onNavigate("projects")}
                    className={cn(
                      "group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card/90 to-card/40 p-3.5 animate-rise",
                      `stagger-${(idx % 6) + 1}`,
                      "transition-[border-color,box-shadow] duration-300 hover:border-primary/45 hover:shadow-[0_24px_48px_-30px_var(--glow-primary)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border/70 bg-secondary/60 font-mono text-[9px] font-bold text-muted-foreground">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <h4
                            className="truncate text-[11.5px] font-bold leading-tight text-foreground"
                            title={p.name}
                          >
                            {p.name}
                          </h4>
                          <p className="mt-0.5 truncate font-mono text-[9px] font-medium text-muted-foreground">
                            {p.voteNumber}
                          </p>
                        </div>
                      </div>
                      <RadialGauge
                        value={util}
                        size={42}
                        thickness={4.5}
                        color={util > 90 ? "#f05252" : util > 70 ? "#f0b429" : "#22d3a7"}
                      />
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                      <div className="rounded-lg border border-border/40 bg-secondary/30 px-2 py-1.5">
                        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Allocated
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-bold tabular-nums text-foreground">
                          {compactMoney(allocatedVal)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/40 bg-secondary/30 px-2 py-1.5">
                        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Balance
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-bold tabular-nums text-emerald-400">
                          {compactMoney(p.balance)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[8.5px] font-bold uppercase tracking-wider">
                        <span className="text-muted-foreground">Committed</span>
                        <span className="tabular-nums text-[var(--chart-3)]">
                          {compactMoney(p.committed)}
                        </span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-secondary/70">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-[var(--chart-3)]/70 transition-all duration-700"
                          style={{ width: `${committedPct}%` }}
                        />
                        <div
                          className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-700", utilizationColor(util))}
                          style={{ width: `${spentPct}%`, opacity: 0.95 }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-0.5 text-[8.5px] font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-2.5 w-2.5 text-primary" />
                          {inProc} in-process · {comp} closed
                        </span>
                        <span className="tabular-nums">{p.fileCount || 0} files</span>
                      </div>
                    </div>

                    <CustomBadge
                      className={cn(
                        "absolute right-2.5 top-2.5 hidden border-0 text-[8px] group-hover:inline-flex",
                        projectStatusColor(p.status)
                      )}
                    >
                      {p.status}
                    </CustomBadge>
                  </div>
                );
              })}
            </div>

            {/* financials bar chart */}
            <div className="mt-4 rounded-2xl border border-border/50 bg-card/30 p-3.5">
              <div className="mb-1 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                  <FileBarChart className="h-3.5 w-3.5 text-primary" />
                  Financial comparison
                  <span className="font-medium text-muted-foreground">
                    ({viewMode === "value" ? "Rs. millions" : "utilisation %"})
                  </span>
                </p>
                <span className="flex items-center gap-3 text-[8.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-1)]" /> Alloc
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-3)]" /> Commit
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-5)]" /> Spent
                  </span>
                </span>
              </div>
              {projectChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={projectChart} barGap={2} margin={{ top: 12, right: 6, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="color-mix(in srgb, var(--border) 70%, transparent)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={0} height={40} tick={{ fontSize: 9 }} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => (viewMode === "value" ? `${v}M` : `${v}%`)} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      cursor={{ fill: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
                      formatter={(value: number, name: string) => [
                        viewMode === "value" ? `Rs. ${value}M` : `${value}%`,
                        name,
                      ]}
                    />
                    <Bar dataKey="Allocation" fill="var(--chart-1)" radius={[5, 5, 0, 0]} maxBarSize={22} />
                    <Bar dataKey="Committed" fill="var(--chart-3)" radius={[5, 5, 0, 0]} maxBarSize={22} />
                    <Bar dataKey="Spent" fill="var(--chart-5)" radius={[5, 5, 0, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-[11px] text-muted-foreground">No project data</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════ DONUTS ══════════════════ */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="panel p-4 sm:p-5">
          <PanelHeading
            title="Allocation distribution"
            subtitle="Top 5 projects by vote allocation · Rs."
            icon={PieChartIcon}
          />
          {allocationData.slices.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
              <div className="relative">
                <ResponsiveContainer width="100%" height={238}>
                  <PieChart>
                    <Pie
                      data={allocationData.slices}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={94}
                      paddingAngle={3}
                      cornerRadius={5}
                      stroke="var(--card)"
                      strokeWidth={2}
                      onMouseEnter={(_, idx) => setActiveAllocIdx(idx)}
                      onMouseLeave={() => setActiveAllocIdx(null)}
                    >
                      {allocationData.slices.map((s, i) => (
                        <Cell
                          key={i}
                          fill={s.color}
                          style={{
                            opacity: activeAllocIdx === null || activeAllocIdx === i ? 1 : 0.35,
                            filter:
                              activeAllocIdx === i
                                ? "drop-shadow(0 0 14px color-mix(in srgb, var(--primary) 60%, transparent))"
                                : "none",
                            transition: "opacity 220ms ease, filter 220ms ease",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(v: number) => [formatCurrency(v), "Allocation"]}
                      cursor={false}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Total
                  </span>
                  <span className="text-[15px] font-black leading-tight tabular-nums text-foreground">
                    {compactMoney(allocationData.total)}
                  </span>
                  <span className="mt-0.5 text-[9px] text-muted-foreground">
                    {allocationData.projectCount} projects
                  </span>
                </div>
              </div>
              <div className="scrollbar-thin max-h-[238px] space-y-1 overflow-y-auto pr-1">
                {allocationData.slices.map((s, i) => {
                  const pct = allocationData.total > 0 ? (s.value / allocationData.total) * 100 : 0;
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setActiveAllocIdx(i)}
                      onMouseLeave={() => setActiveAllocIdx(null)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                        activeAllocIdx === i ? "bg-secondary/60" : "hover:bg-secondary/40"
                      )}
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10.5px] font-semibold text-foreground">{s.name}</p>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: s.color }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold tabular-nums text-muted-foreground">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-[11px] text-muted-foreground">No allocation data</p>
          )}
        </div>

        <div className="panel p-4 sm:p-5">
          <PanelHeading
            title="Utilisation health"
            subtitle="Distribution of visible projects by utilisation band"
            icon={Gauge}
            accent="var(--chart-2)"
          />
          {totalProjectsCounted > 0 ? (
            <div className="mt-3 grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
              <div className="relative">
                <ResponsiveContainer width="100%" height={238}>
                  <PieChart>
                    <Pie
                      data={utilBucketData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={94}
                      paddingAngle={3}
                      cornerRadius={5}
                      stroke="var(--card)"
                      strokeWidth={2}
                      onMouseEnter={(_, idx) => setActiveUtilIdx(idx)}
                      onMouseLeave={() => setActiveUtilIdx(null)}
                    >
                      {utilBucketData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={UTILIZATION_COLORS[entry.name] ?? "#64748b"}
                          style={{
                            opacity: activeUtilIdx === null || activeUtilIdx === i ? 1 : 0.35,
                            transition: "opacity 220ms ease",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(v: number, n: string) => [`${v} projects`, n]}
                      cursor={false}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Tracked
                  </span>
                  <span className="text-[26px] font-black leading-none tabular-nums text-foreground">
                    {totalProjectsCounted}
                  </span>
                  <span className="mt-0.5 text-[9px] text-muted-foreground">projects</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {utilBucketData.map((b, i) => {
                  const pct = totalProjectsCounted > 0 ? (b.value / totalProjectsCounted) * 100 : 0;
                  const color = UTILIZATION_COLORS[b.name] ?? "#64748b";
                  return (
                    <div
                      key={b.name}
                      onMouseEnter={() => setActiveUtilIdx(i)}
                      onMouseLeave={() => setActiveUtilIdx(null)}
                      className={cn(
                        "rounded-lg border border-border/40 px-2.5 py-2 transition-colors",
                        activeUtilIdx === i ? "bg-secondary/60" : "bg-card/30 hover:bg-secondary/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-foreground">
                          <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
                          {b.name}
                        </span>
                        <span className="text-[11px] font-bold tabular-nums text-foreground">
                          {b.value}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-[11px] text-muted-foreground">No utilisation data</p>
          )}
        </div>
      </section>

      {/* ══════════════════ POSITIONS + MODULE LINKS ══════════════════ */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="panel p-4 sm:p-5 lg:col-span-2">
          <PanelHeading
            title="Procurement radar"
            subtitle="Files grouped by present position"
            icon={Radar}
            accent="var(--chart-5)"
          />
          {posChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={252}>
              <PieChart>
                <Pie
                  data={posChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={78}
                  innerRadius={34}
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="var(--card)"
                  strokeWidth={1.5}
                >
                  {posChart.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 9, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={6}
                  formatter={(value) => (
                    <span style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-[11px] text-muted-foreground">No procurement data</p>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                title: "Procurement files",
                desc: `${stats.procurement.total} files · ${stats.procurement.pendingCollection} pending collection`,
                icon: FileText,
                target: "procurement" as ModuleId,
                accent: "#2f8dff",
              },
              {
                title: "Store management",
                desc: `${stats.stores.totalItems} items · ${stats.stores.lowStock} low stock · ${compactMoney(stats.stores.stockValue)}`,
                icon: Warehouse,
                target: "stores" as ModuleId,
                accent: "#f0b429",
              },
              {
                title: "Collection",
                desc: `${stats.collection.partSupplyActive} part-supply active · ${stats.collection.dailyToday} today`,
                icon: PackageCheck,
                target: "collection" as ModuleId,
                accent: "#22d3a7",
              },
              {
                title: "Rate finder",
                desc: `${stats.rateFinder.rcCount} rate contracts on file`,
                icon: SearchIcon,
                target: "rate-finder" as ModuleId,
                accent: "#a175ff",
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.title}
                  onClick={() => onNavigate(m.target)}
                  className="panel panel-hover group relative overflow-hidden p-4 text-left"
                >
                  <div
                    className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-45"
                    style={{ background: `radial-gradient(circle, ${m.accent}, transparent 70%)` }}
                  />
                  <div className="flex items-start justify-between">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: `color-mix(in srgb, ${m.accent} 35%, transparent)`,
                        background: `linear-gradient(150deg, color-mix(in srgb, ${m.accent} 22%, transparent), transparent)`,
                        color: m.accent,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h4 className="mt-2.5 text-[12px] font-bold text-foreground">{m.title}</h4>
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ MANAGE DIALOG ══════════════════ */}
      <ManageDashboardProjectsDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        projects={allProjects ?? []}
        onToggle={handleToggleVisibility}
      />
    </div>
  );
}

/* ═══════════════════════ MANAGE DASHBOARD DIALOG ═══════════════════════ */

function ManageDashboardProjectsDialog({
  open,
  onOpenChange,
  projects,
  onToggle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onToggle: (project: Project, next: boolean) => void | Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.voteNumber ?? "").toLowerCase().includes(q) ||
        (p.nameAbbreviation ?? "").toLowerCase().includes(q)
    );
  }, [projects, search]);

  const visibleCount = projects.filter((p) => p.showOnDashboard !== false).length;
  const filteredHidden = filtered.filter((p) => p.showOnDashboard === false);
  const filteredVisible = filtered.filter((p) => p.showOnDashboard !== false);

  const runToggle = async (p: Project, next: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(p.id));
    try {
      await onToggle(p, next);
    } finally {
      setTogglingIds((prev) => {
        const n = new Set(prev);
        n.delete(p.id);
        return n;
      });
    }
  };

  const handleSelectAll = async () => {
    await Promise.all(filteredHidden.map((p) => runToggle(p, true)));
  };
  const handleDeselectAll = async () => {
    await Promise.all(filteredVisible.map((p) => runToggle(p, false)));
  };

  const totalToggling = togglingIds.size;
  const allFilteredVisible = filtered.length > 0 && filteredHidden.length === 0;
  const allFilteredHidden = filteredVisible.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-3 border-border/70 bg-popover/95 p-0 backdrop-blur-2xl sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-5 pb-3 pt-5">
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
              <Settings className="h-4 w-4" />
            </span>
            Dashboard project visibility
          </DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Pin or hide projects from this command deck — visibility only, no data is deleted.{" "}
            <span className="font-semibold text-foreground">
              {visibleCount} of {projects.length}
            </span>{" "}
            currently pinned.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-5 py-3">
          <div className="relative min-w-[190px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, vote number, abbreviation…"
              className="h-9 rounded-xl bg-background/60 pl-8 text-[11.5px]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={allFilteredVisible || filtered.length === 0 || totalToggling > 0}
            className="h-9 rounded-xl text-[11px] font-bold"
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Pin all
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={allFilteredHidden || filtered.length === 0 || totalToggling > 0}
            className="h-9 rounded-xl text-[11px] font-bold"
          >
            <Square className="mr-1.5 h-3.5 w-3.5" /> Unpin all
          </Button>
        </div>

        <div className="scrollbar-thin min-h-[220px] flex-1 overflow-y-auto px-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[11.5px] text-muted-foreground">
              {projects.length === 0 ? "No projects available." : "No projects match your search."}
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {filtered.map((p) => {
                const visible = p.showOnDashboard !== false;
                const toggling = togglingIds.has(p.id);
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/40"
                  >
                    <Checkbox
                      id={`dash-${p.id}`}
                      checked={visible}
                      onCheckedChange={(checked) => runToggle(p, checked === true)}
                      disabled={toggling}
                      aria-label={`Toggle dashboard visibility for ${p.name}`}
                    />
                    <label htmlFor={`dash-${p.id}`} className="min-w-0 flex-1 cursor-pointer">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[11.5px] font-semibold text-foreground">
                          {p.name}
                        </span>
                        {p.nameAbbreviation && (
                          <CustomBadge className="shrink-0 border-0 bg-primary/15 text-[8.5px] text-primary">
                            {p.nameAbbreviation}
                          </CustomBadge>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {p.voteNumber || "—"} · {formatCurrency(p.voteAllocation ?? 0)}
                        {p.utilization != null && <> · {Math.round(p.utilization)}% util</>}
                      </p>
                    </label>
                    <CustomBadge className={cn("shrink-0 border-0 text-[8.5px]", projectStatusColor(p.status))}>
                      {p.status}
                    </CustomBadge>
                    <div
                      className={cn(
                        "flex w-[76px] shrink-0 items-center justify-end gap-1 text-[9.5px] font-bold uppercase tracking-wider",
                        visible ? "text-emerald-400" : "text-muted-foreground"
                      )}
                    >
                      {toggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : visible ? (
                        <>
                          <Eye className="h-3 w-3" /> Pinned
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Hidden
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2 border-t border-border/60 px-5 py-3 sm:justify-between">
          <span className="text-[10px] font-medium text-muted-foreground">
            {filtered.length} of {projects.length} shown · {visibleCount} pinned to dashboard
            {totalToggling > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" /> updating…
              </span>
            )}
          </span>
          <Button size="sm" onClick={() => onOpenChange(false)} className="rounded-xl text-[11px] font-bold">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
