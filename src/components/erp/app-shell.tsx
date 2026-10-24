"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS, ModuleId } from "./nav";
import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Palette,
  Check,
  User,
  KeyRound,
  CheckCircle2,
  Mail,
  Building2,
  Loader2,
  Lock,
  X,
  FileText,
  ShieldAlert,
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Menu,
  Command as CommandIcon,
  Radio,
  Sparkles,
  ArrowUpRight,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomBadge } from "@/components/erp/badges";
import { useToast } from "@/hooks/use-toast";
import { useFetch, apiRequest } from "@/lib/use-fetch";
import { formatCurrency, THEME_PROFILE_PRESETS } from "@/lib/constants";
import { useThemeProfile } from "@/lib/use-theme-profile";
import { CrestMark, Wordmark } from "@/components/brand/cmsys-brand";
import { BackgroundFX, Sparkline } from "./fx";
import { armLoginGate } from "@/lib/preview-mode";

/* ══════════════════════════════════════════════════════════════════════════ */

interface Stats {
  net: number;
  task: number;
  avail: number;
  team: number;
}

interface AppShellProps {
  active: ModuleId;
  onNavigate: (id: ModuleId) => void;
  stats: Stats | null;
  children: React.ReactNode;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "procurement" | "qc" | "split" | "system";
  read: boolean;
}

interface UserProfileData {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  role: string;
  department: string | null;
}

const NAV_GROUPS: { label: string; ids: ModuleId[] }[] = [
  { label: "Command", ids: ["dashboard", "projects"] },
  { label: "Operations", ids: ["procurement", "stores", "rate-finder"] },
  { label: "Logistics", ids: ["collection", "stakeholders"] },
  { label: "System", ids: ["settings"] },
];

const compactMoney = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rs ${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `Rs ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `Rs ${(n / 1_000).toFixed(0)}K`;
  return `Rs ${Math.round(n)}`;
};

/* ══════════════════════════════ SIDEBAR ═══════════════════════════════════ */

function SidebarContent({
  active,
  onNavigate,
  collapsed,
  onToggleCollapse,
  onOpenPalette,
  onItemClick,
  onOpenProfile,
  onLogout,
  user,
}: {
  active: ModuleId;
  onNavigate: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onOpenPalette: () => void;
  onItemClick?: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  user?: UserProfileData | null;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden border-r border-sidebar-border/70 bg-sidebar/75 text-sidebar-foreground backdrop-blur-2xl">
      {/* ambient brand wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full opacity-45 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--gold) 42%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/60 to-transparent"
      />

      {/* ── Brand ── */}
      <div
        className={cn(
          "relative flex h-[74px] shrink-0 items-center gap-2 border-b border-sidebar-border/60 px-4",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed ? (
          <CrestMark size={38} />
        ) : (
          <>
            <Wordmark className="min-w-0 flex-1" />
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="hidden h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border/70 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary lg:flex"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Command trigger ── */}
      <div className={cn("px-3 pt-3", collapsed && "px-2")}>
        <button
          onClick={onOpenPalette}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/80 bg-sidebar-accent/40 px-2.5 py-2 text-left text-[11.5px] font-semibold text-muted-foreground transition-all duration-200 hover:border-primary/45 hover:bg-sidebar-accent/80 hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-primary" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">Search & jump…</span>
              <kbd className="rounded border border-border/80 bg-background/60 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="scrollbar-thin mt-2 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
        {NAV_GROUPS.map((group) => {
          const items = group.ids
            .map((id) => NAV_ITEMS.find((n) => n.id === id))
            .filter(Boolean) as typeof NAV_ITEMS;
          if (!items.length) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground/60">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = active === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onItemClick?.();
                      }}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[12.5px] font-semibold transition-colors duration-200",
                        collapsed && "justify-center px-0",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="cmsys-nav-active"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="absolute inset-0 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        />
                      )}
                      {/* gold active tick */}
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[var(--gold)] to-[var(--gold)]/20 transition-all duration-300",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span
                        className={cn(
                          "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-br from-primary/90 to-primary/50 text-primary-foreground shadow-[0_4px_14px_-4px_var(--glow-primary)]"
                            : "text-muted-foreground group-hover:scale-105 group-hover:text-primary"
                        )}
                      >
                        <Icon className="h-[15px] w-[15px]" />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="relative z-10 flex-1 truncate text-left">{item.label}</span>
                          {item.badge !== undefined ? (
                            <span className="relative z-10 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                              {item.badge}
                            </span>
                          ) : (
                            <ChevronRight
                              className={cn(
                                "relative z-10 h-3 w-3 shrink-0 transition-all duration-200",
                                isActive
                                  ? "text-primary opacity-100"
                                  : "-translate-x-1 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                              )}
                            />
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Status card ── */}
      <div className={cn("shrink-0 border-t border-sidebar-border/60 p-3", collapsed && "px-2")}>
        {!collapsed ? (
          <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-sidebar-accent/60 to-transparent p-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.45)]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400/90">
                All systems nominal
              </span>
            </div>
            <p className="mt-1.5 truncate text-[9.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
              SLN Logistics · Trincomalee
            </p>
            <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-muted-foreground/70">
              <span>v2.7.59</span>
              <span className="text-[var(--gold)]/80">CE BRANCH</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
          </div>
        )}

        {/* user row */}
        <div className={cn("mt-2.5 flex items-center gap-2", collapsed && "hidden")}>
          <button
            onClick={onOpenProfile}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-sidebar-accent/60"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/30 to-[var(--gold)]/20 text-[10px] font-bold text-primary">
              {(user?.displayName || "RP").slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold text-foreground">
                {user?.displayName || "Cdr. R. Perera"}
              </span>
              <span className="block truncate text-[9px] uppercase tracking-wider text-muted-foreground">
                {user?.role || "Admin"}
              </span>
            </span>
          </button>
          <button
            onClick={onLogout}
            title="Sign out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {collapsed && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          className="mx-auto mb-3 hidden h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary lg:flex"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════ THEME MENU ═══════════════════════════════ */

function ThemeMenu() {
  const { currentTheme, setThemeByPreset } = useThemeProfile();
  const [open, setOpen] = useState(false);
  const isDark = currentTheme?.mode !== "light";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          title="Appearance"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/40 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background"
            style={{ backgroundColor: currentTheme?.primary || "var(--primary)" }}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-border/80 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-1.5 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Command theme
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1 pb-1">
          {(["dark", "light"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                const preset = THEME_PROFILE_PRESETS.find(
                  (p) => p.mode === mode && (currentTheme ? p.primary === currentTheme.primary : true)
                );
                const fallback = THEME_PROFILE_PRESETS.find((p) => p.mode === mode);
                setThemeByPreset((preset || fallback)!.name);
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all",
                currentTheme?.mode === mode
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {mode === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              {mode === "dark" ? "Night" : "Daylight"}
            </button>
          ))}
        </div>
        <DropdownMenuSeparator className="bg-border/60" />
        <div className="scrollbar-thin max-h-64 space-y-0.5 overflow-y-auto pt-1">
          {THEME_PROFILE_PRESETS.map((preset) => {
            const selected = currentTheme?.name === preset.name;
            return (
              <DropdownMenuItem
                key={preset.name}
                onClick={() => setThemeByPreset(preset.name)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors",
                  selected ? "bg-primary/10 text-primary" : "text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})`,
                    }}
                  />
                  {preset.name}
                </span>
                {selected && <Check className="h-3 w-3" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ══════════════════════════════ TOP QUICK STAT ═══════════════════════════ */

function QuickStat({
  label,
  value,
  sub,
  series,
  color,
  onClick,
}: {
  label: string;
  value: string;
  sub: string;
  series: number[];
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative hidden min-w-[104px] flex-col overflow-hidden rounded-xl border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 xl:flex"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span
          className="h-1.5 w-1.5 rounded-full transition-transform duration-200 group-hover:scale-150"
          style={{ backgroundColor: color }}
        />
      </span>
      <span className="mt-0.5 text-[12.5px] font-bold leading-none tracking-tight tabular-nums text-foreground">
        {value}
      </span>
      <span className="mt-0.5 text-[8.5px] font-medium leading-none text-muted-foreground/80">
        {sub}
      </span>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 opacity-50 transition-opacity group-hover:opacity-90">
        <Sparkline data={series} height={14} stroke={color} />
      </span>
    </button>
  );
}

/* ══════════════════════════════ COMMAND PALETTE ══════════════════════════ */

function CommandPalette({
  open,
  onOpenChange,
  active,
  onNavigate,
  onOpenProfile,
  onLogout,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  active: ModuleId;
  onNavigate: (id: ModuleId) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const reset = setTimeout(() => {
      setQuery("");
      setCursor(0);
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(reset);
  }, [open]);

  const actions = useMemo(() => {
    const navActions = NAV_ITEMS.map((n) => ({
      id: n.id as string,
      label: n.label,
      hint: n.description,
      icon: n.icon as LucideIcon,
      run: () => onNavigate(n.id),
    }));
    return [
      ...navActions,
      {
        id: "profile",
        label: "Profile & security",
        hint: "Account details, password",
        icon: User as LucideIcon,
        run: onOpenProfile,
      },
      {
        id: "logout",
        label: "Sign out",
        hint: "End this session",
        icon: LogOut as LucideIcon,
        run: onLogout,
      },
    ];
  }, [onNavigate, onOpenProfile, onLogout]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) => a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    const t = setTimeout(() => setCursor(0), 0);
    return () => clearTimeout(t);
  }, [query]);

  const choose = (i: number) => {
    const action = filtered[i];
    if (!action) return;
    action.run();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border-border/70 bg-popover/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>Search modules and actions</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(filtered.length - 1, c + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                choose(cursor);
              }
            }}
            placeholder="Jump to a module or action…"
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border/70 bg-secondary/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="scrollbar-thin max-h-[340px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-xs font-medium text-muted-foreground">
              No matches for “{query}”
            </p>
          ) : (
            filtered.map((a, i) => {
              const Icon = a.icon;
              const isActive = active === (a.id as ModuleId);
              return (
                <button
                  key={a.id}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => choose(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    cursor === i ? "bg-primary/12 ring-1 ring-primary/30" : "hover:bg-secondary/50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                      cursor === i
                        ? "border-primary/40 bg-primary/20 text-primary"
                        : "border-border/60 bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-bold text-foreground">
                        {a.label}
                      </span>
                      {isActive && (
                        <span className="rounded-full bg-[var(--gold)]/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[var(--gold)]">
                          current
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[10.5px] font-medium text-muted-foreground">
                      {a.hint}
                    </span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 bg-secondary/30 px-4 py-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>⏎ open</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CrestMark size={14} glow={false} /> CMSys command
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════ APP SHELL ════════════════════════════════ */

export function AppShell({ active, onNavigate, stats, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [timeStr, setTimeStr] = useState("--:--:--");
  const [dateStr, setDateStr] = useState("");

  const { data: notifRes, refresh: refreshNotifs } = useFetch<{
    notifications: AppNotification[];
    unreadCount: number;
  }>("/api/notifications");

  const { data: userProfile, refresh: refreshProfile } = useFetch<UserProfileData>(
    "/api/user/profile"
  );

  /* collapse persistence */
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem("cmsys-rail");
        if (stored === "1") setCollapsed(true);
      } catch {
        /* noop */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const toggleCollapse = useCallback(() => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("cmsys-rail", c ? "0" : "1");
      } catch {
        /* noop */
      }
      return !c;
    });
  }, []);

  /* clock */
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Colombo",
        })
      );
      setDateStr(
        now.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          timeZone: "Asia/Colombo",
        })
      );
    };
    const first = requestAnimationFrame(update);
    const timer = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(timer);
    };
  }, []);

  /* ⌘K */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const notifications = notifRes?.notifications || [];
  const unreadCount = notifRes?.unreadCount || 0;

  const handleMarkRead = async (id: string) => {
    await apiRequest("/api/notifications", "POST", { action: "mark-read", id });
    refreshNotifs();
  };
  const handleMarkAllRead = async () => {
    await apiRequest("/api/notifications", "POST", {
      action: "mark-all-read",
      ids: notifications.map((n) => n.id),
    });
    refreshNotifs();
  };
  const handleClearNotifs = async () => {
    await apiRequest("/api/notifications", "POST", { action: "clear" });
    refreshNotifs();
  };
  const handleLogout = async () => {
    // Leaving the deck intentionally disables the silent preview session, so the
    // next load shows the secure access gate instead of re-entering directly.
    armLoginGate();
    await apiRequest("/api/auth/logout", "POST");
    window.location.reload();
  };

  const initials = useMemo(() => {
    const name = userProfile?.displayName || "Radhika Perera";
    const parts = name.replace(/^(Cdr\.|Lt\.|Capt\.|Po|Sgt)\s+/i, "").trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [userProfile]);

  const activeItem = NAV_ITEMS.find((n) => n.id === active);
  const ActiveIcon = activeItem?.icon;

  const statSeries = useMemo(() => {
    const base = [stats?.net ?? 0, stats?.task ?? 0, stats?.avail ?? 0, stats?.team ?? 0];
    return base.map((v, i) => {
      const seed = (v % 17) + i * 3 + 5;
      return Array.from({ length: 10 }, (_, k) => Math.max(2, seed * (0.55 + 0.45 * Math.sin(k / 1.7 + i))));
    });
  }, [stats]);

  return (
    <div className="relative flex min-h-screen bg-transparent font-sans text-foreground antialiased selection:bg-primary/25">
      <BackgroundFX dense />

      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-screen shrink-0 transition-[width] duration-300 ease-out lg:block",
          collapsed ? "w-[82px]" : "w-[264px]"
        )}
      >
        <SidebarContent
          active={active}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={handleLogout}
          user={userProfile}
        />
      </aside>

      {/* ── Mobile sidebar ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent
            active={active}
            onNavigate={onNavigate}
            collapsed={false}
            onOpenPalette={() => {
              setMobileOpen(false);
              setPaletteOpen(true);
            }}
            onItemClick={() => setMobileOpen(false)}
            onOpenProfile={() => {
              setMobileOpen(false);
              setProfileOpen(true);
            }}
            onLogout={handleLogout}
            user={userProfile}
          />
        </SheetContent>
      </Sheet>

      {/* ── Main column ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl sm:px-5">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex min-w-0 items-center gap-2.5">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {collapsed && (
              <button
                onClick={toggleCollapse}
                className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:text-primary lg:flex"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}

            <div className="flex min-w-0 items-center gap-2.5">
              {ActiveIcon && (
                <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/25 to-transparent text-primary sm:flex">
                  <ActiveIcon className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                  <span>CMSys</span>
                  <ChevronRight className="h-2.5 w-2.5" />
                  <span className="text-[var(--gold)]/80">SLN Logistics</span>
                </div>
                <h2 className="truncate text-[13.5px] font-bold leading-tight tracking-tight text-foreground">
                  {activeItem?.label || "Dashboard"}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* quick stats */}
            <div className="mr-1 hidden items-center gap-1.5 xl:flex">
              <QuickStat
                label="Vote"
                value={compactMoney(stats?.net ?? 0)}
                sub="allocated"
                series={statSeries[0]}
                color="var(--primary)"
                onClick={() => onNavigate("projects")}
              />
              <QuickStat
                label="Files"
                value={String(stats?.task ?? 0)}
                sub="in pipeline"
                series={statSeries[1]}
                color="var(--chart-3)"
                onClick={() => onNavigate("procurement")}
              />
              <QuickStat
                label="Balance"
                value={compactMoney(stats?.avail ?? 0)}
                sub="available"
                series={statSeries[2]}
                color="var(--chart-2)"
                onClick={() => onNavigate("projects")}
              />
              <QuickStat
                label="Projects"
                value={String(stats?.team ?? 0)}
                sub="active"
                series={statSeries[3]}
                color="var(--chart-5)"
                onClick={() => onNavigate("projects")}
              />
            </div>

            {/* command trigger */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-2.5 py-2 text-[11px] font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground md:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Quick jump</span>
              <kbd className="rounded border border-border/70 bg-background/70 px-1 py-0.5 font-mono text-[9px] font-bold">
                ⌘K
              </kbd>
            </button>

            {/* clock */}
            <div className="hidden items-center gap-2 rounded-xl border border-border/60 bg-secondary/30 px-2.5 py-1.5 sm:flex">
              <Radio className="h-3 w-3 text-emerald-400" />
              <div className="leading-none">
                <p className="font-mono text-[11.5px] font-bold tabular-nums text-foreground">
                  {timeStr}
                </p>
                <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {dateStr} · CMB
                </p>
              </div>
            </div>

            <ThemeMenu />

            {/* notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-secondary/40 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                      </span>
                    </>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[340px] overflow-hidden border-border/70 bg-popover/95 p-0 shadow-2xl backdrop-blur-2xl sm:w-[382px]"
              >
                <div className="flex items-center justify-between border-b border-border/60 bg-secondary/30 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11.5px] font-bold text-foreground">Signal feed</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="rounded-md px-1.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10"
                      >
                        Read all
                      </button>
                    )}
                    <button
                      onClick={handleClearNotifs}
                      className="rounded-md px-1.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <ScrollArea className="h-[288px]">
                  <div className="space-y-1 p-2">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-400/70" />
                        <p className="text-[11.5px] font-semibold text-foreground">All clear</p>
                        <p className="text-[10.5px] text-muted-foreground">No signals awaiting review</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={cn(
                            "relative w-full rounded-xl border p-2.5 text-left transition-colors",
                            n.read
                              ? "border-border/40 bg-background/30 opacity-70"
                              : "border-primary/25 bg-primary/5 hover:bg-primary/10"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 truncate text-[11px] font-bold text-foreground">
                              {n.type === "qc" && <ShieldAlert className="h-3 w-3 shrink-0 text-amber-400" />}
                              {n.type === "procurement" && <FileText className="h-3 w-3 shrink-0 text-primary" />}
                              {n.type === "split" && <Boxes className="h-3 w-3 shrink-0 text-violet-400" />}
                              {n.type === "system" && <Sparkles className="h-3 w-3 shrink-0 text-emerald-400" />}
                              {n.title}
                            </span>
                            <span className="shrink-0 text-[9px] font-medium text-muted-foreground">{n.time}</span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-muted-foreground">
                            {n.message}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {/* profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/25 via-primary/10 to-[var(--gold)]/25 text-[11px] font-bold text-primary transition-transform hover:scale-105">
                  {initials}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 border-border/70 bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl"
              >
                <DropdownMenuLabel className="p-2">
                  <p className="text-[12.5px] font-bold text-foreground">
                    {userProfile?.displayName || "Cdr. R. Perera"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                    <CustomBadge className="border-primary/25 bg-primary/10 px-1 py-0 text-[8px] text-primary">
                      {userProfile?.role || "Admin"}
                    </CustomBadge>
                    {userProfile?.department || "Engineering"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem
                  onClick={() => setProfileOpen(true)}
                  className="cursor-pointer gap-2 rounded-lg text-[11.5px] font-semibold"
                >
                  <User className="h-3.5 w-3.5 text-primary" /> Profile & security
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPaletteOpen(true)}
                  className="cursor-pointer gap-2 rounded-lg text-[11.5px] font-semibold"
                >
                  <CommandIcon className="h-3.5 w-3.5 text-[var(--gold)]" /> Command palette
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 rounded-lg text-[11.5px] font-semibold text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="relative flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Footer ── */}
        <footer className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/50 px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60 sm:px-6">
          <span className="flex items-center gap-2">
            <CrestMark size={14} glow={false} />
            CMSys · SLN Logistics · Trincomalee
          </span>
          <span className="flex items-center gap-3">
            <span className="hidden sm:inline">Restricted · Security level 4</span>
            <button
              onClick={() => {
                armLoginGate();
                window.location.reload();
              }}
              className="hidden uppercase tracking-[0.16em] text-muted-foreground/60 underline-offset-4 transition-colors hover:text-primary hover:underline sm:inline"
              title="Return to the secure sign-in screen"
            >
              Sign-in screen
            </button>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Link stable
            </span>
          </span>
        </footer>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        active={active}
        onNavigate={onNavigate}
        onOpenProfile={() => {
          setPaletteOpen(false);
          setProfileOpen(true);
        }}
        onLogout={handleLogout}
      />

      {profileOpen && (
        <UserProfileModal
          open={profileOpen}
          onOpenChange={setProfileOpen}
          user={userProfile}
          onSaved={() => {
            refreshProfile();
            refreshNotifs();
          }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════ PROFILE MODAL ════════════════════════════ */

function UserProfileModal({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  user?: UserProfileData | null;
  onSaved: () => void;
}) {
  const [displayName, setDisplayName] = useState(user?.displayName || "Cdr. R. Perera");
  const [email, setEmail] = useState(user?.email || "r.perera@navy.lk");
  const [department, setDepartment] = useState(user?.department || "Engineering");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => {
      setDisplayName(user.displayName || "Cdr. R. Perera");
      setEmail(user.email || "r.perera@navy.lk");
      setDepartment(user.department || "Engineering");
    }, 0);
    return () => clearTimeout(t);
  }, [user]);

  const passwordMatch = newPassword.length >= 4 && newPassword === confirmPassword;

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast({ title: "Display Name is required", variant: "destructive" });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: "New Passwords do not match", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const res = await apiRequest("/api/user/profile", "PUT", {
      displayName: displayName.trim(),
      email: email.trim(),
      department: department.trim(),
      newPassword: newPassword.trim() || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      toast({ title: "Profile & settings updated successfully" });
      onSaved();
      onOpenChange(false);
    } else {
      toast({ title: "Failed to update profile", description: res.error, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border/70 bg-popover/95 backdrop-blur-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-[15px]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
              <User className="h-4 w-4" />
            </span>
            Profile & security
          </DialogTitle>
          <DialogDescription className="text-[11.5px]">
            Manage your identity, department and access PIN for the CMSys command portal.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4 py-1">
          <TabsList className="grid w-full grid-cols-2 rounded-xl border border-border/60 bg-secondary/50">
            <TabsTrigger value="details" className="gap-1.5 rounded-lg text-[11px] font-bold">
              <User className="h-3.5 w-3.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 rounded-lg text-[11px] font-bold">
              <KeyRound className="h-3.5 w-3.5" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-3">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Account username
                </p>
                <p className="mt-0.5 font-mono text-[13px] font-bold text-foreground">
                  {user?.username || "admin"}
                </p>
              </div>
              <CustomBadge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                {user?.role || "Admin"}
              </CustomBadge>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <User className="h-3.5 w-3.5 text-primary" /> Display name / rank
                </Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Cdr. R. Perera"
                  className="mt-1 h-10 rounded-xl bg-background/60 text-[12px]"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <Mail className="h-3.5 w-3.5 text-[var(--chart-4)]" /> Email address
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="r.perera@navy.lk"
                  className="mt-1 h-10 rounded-xl bg-background/60 text-[12px]"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <Building2 className="h-3.5 w-3.5 text-[var(--gold)]" /> Department / unit
                </Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering / CSLOG"
                  className="mt-1 h-10 rounded-xl bg-background/60 text-[12px]"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="space-y-1 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-amber-300">
                <Lock className="h-3.5 w-3.5" /> Change access PIN
              </div>
              <p className="text-[10.5px] leading-snug text-amber-200/80">
                Enter a new PIN (minimum 4 characters). This is the credential used at the secure
                login gate.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-[11px]">Current PIN (optional)</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••"
                  className="mt-1 h-10 rounded-xl bg-background/60 font-mono text-[12px]"
                />
              </div>
              <div>
                <Label className="text-[11px]">New PIN</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="mt-1 h-10 rounded-xl bg-background/60 font-mono text-[12px]"
                />
              </div>
              <div>
                <Label className="text-[11px]">Confirm new PIN</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new PIN"
                  className="mt-1 h-10 rounded-xl bg-background/60 font-mono text-[12px]"
                />
                {newPassword && (
                  <p
                    className={cn(
                      "mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold",
                      passwordMatch ? "text-emerald-400" : "text-destructive"
                    )}
                  >
                    {passwordMatch ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> PINs match
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" /> PINs do not match
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-xl text-[11.5px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={submitting}
            className="gap-1.5 rounded-xl text-[11.5px] font-bold"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
