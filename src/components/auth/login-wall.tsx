"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  EyeOff,
  Search,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Lock,
  Waves,
  Radar,
  Anchor,
  ArrowRight,
  Fingerprint,
  CircleDot,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/use-fetch";
import { CrestMark } from "@/components/brand/cmsys-brand";
import { BackgroundFX, AnimatedNumber } from "@/components/erp/fx";
import { cn } from "@/lib/utils";
import { rememberUsername } from "@/lib/preview-mode";

interface LoginWallProps {
  onLoginSuccess: () => void;
}

interface OfficerProfile {
  id: string;
  username: string;
  name: string;
  rank: string;
  serviceNo: string;
  role: string;
  department: string;
  zone: string;
  group: string;
}

interface SailorProfile {
  id: string;
  serviceNo: string;
  name: string;
  rate: string;
  appointment: string;
  department: string;
  zone: string;
}

const DEFAULT_OFFICERS: OfficerProfile[] = [
  {
    id: "oic-1",
    username: "KMAU Kahandawa",
    name: "KMAU Kahandawa",
    rank: "Admin",
    serviceNo: "CSLOG/001",
    role: "Admin",
    department: "CSLOG",
    zone: "All Command Scope",
    group: "Command & Executive Profiles",
  },
  {
    id: "oic-2",
    username: "rperera",
    name: "Cdr. R. Perera",
    rank: "Commander",
    serviceNo: "SVC/1234",
    role: "Admin",
    department: "CSLOG",
    zone: "All Command Scope",
    group: "Command & Executive Profiles",
  },
  {
    id: "oic-3",
    username: "tjaya",
    name: "Capt. T. Jayasuriya",
    rank: "Captain",
    serviceNo: "SVC/1111",
    role: "Manager",
    department: "CE",
    zone: "CCED(E) Command",
    group: "Command & Executive Profiles",
  },
  {
    id: "oic-4",
    username: "mfernando",
    name: "Lt. M. Fernando",
    rank: "Lieutenant",
    serviceNo: "SVC/2345",
    role: "Officer",
    department: "CSLOG",
    zone: "CLOGD Scope",
    group: "Command & Executive Profiles",
  },
  {
    id: "oic-5",
    username: "pbandara",
    name: "PO Bandara",
    rank: "Petty Officer",
    serviceNo: "SVC/5678",
    role: "Clerk",
    department: "CSLOG",
    zone: "APO(E) Scope",
    group: "Command & Executive Profiles",
  },
  {
    id: "zone-a",
    username: "zone_a_oic",
    name: "Zone A: Civil & Maintenance",
    rank: "OIC",
    serviceNo: "ZN/A-01",
    role: "Officer",
    department: "CE",
    zone: "Zone A",
    group: "Maintenance Zone In-Charges",
  },
  {
    id: "zone-b",
    username: "zone_b_oic",
    name: "Zone B: Slipway & Docks",
    rank: "OIC",
    serviceNo: "ZN/B-02",
    role: "Officer",
    department: "CE",
    zone: "Zone B",
    group: "Maintenance Zone In-Charges",
  },
];

const DEFAULT_SAILORS: SailorProfile[] = [
  {
    id: "sln-1",
    serviceNo: "XS-60242",
    name: "AB Fernando",
    rate: "Able Seaman",
    appointment: "Civil Engineering",
    department: "CE",
    zone: "Zone A",
  },
  {
    id: "sln-2",
    serviceNo: "XS-54120",
    name: "LS Silva",
    rate: "Leading Seaman",
    appointment: "Slipway & Docks",
    department: "CSLOG",
    zone: "Zone B",
  },
  {
    id: "sln-3",
    serviceNo: "XS-48911",
    name: "PO Bandara",
    rate: "Petty Officer",
    appointment: "Stores & Logistics",
    department: "CSLOG",
    zone: "Zone C",
  },
  {
    id: "sln-4",
    serviceNo: "XS-61002",
    name: "AB Gunaratne",
    rate: "Able Seaman",
    appointment: "Mechanical Works",
    department: "CE",
    zone: "Workshop",
  },
];

export function LoginWall({ onLoginSuccess }: LoginWallProps) {
  const [mode, setMode] = useState<"OIC" | "SAILOR">("OIC");
  const [officers, setOfficers] = useState<OfficerProfile[]>(DEFAULT_OFFICERS);
  const [sailors, setSailors] = useState<SailorProfile[]>(DEFAULT_SAILORS);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [selectedSailor, setSelectedSailor] = useState<SailorProfile | null>(null);
  const [officerQuery, setOfficerQuery] = useState<string>("");
  const [sailorSearch, setSailorSearch] = useState<string>("");
  const [showSailorDropdown, setShowSailorDropdown] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("1234");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showCredentialsGuide, setShowCredentialsGuide] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/auth/profiles")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          if (data.officers?.length > 0) setOfficers(data.officers);
          if (data.sailors?.length > 0) setSailors(data.sailors);
        }
      })
      .catch(() => {
        /* defaults remain */
      });
  }, []);

  // Pre-select the first command profile so the PIN is all that is needed
  useEffect(() => {
    if (selectedOfficerId) return;
    const timer = setTimeout(() => {
      setSelectedOfficerId((current) => current || DEFAULT_OFFICERS[0].id);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedOfficerId]);

  const selectedOfficer = officers.find((o) => o.id === selectedOfficerId);

  const filteredOfficers = useMemo(() => {
    const q = officerQuery.trim().toLowerCase();
    if (!q) return officers;
    return officers.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.serviceNo || "").toLowerCase().includes(q) ||
        (o.role || "").toLowerCase().includes(q) ||
        (o.zone || "").toLowerCase().includes(q)
    );
  }, [officers, officerQuery]);

  const filteredSailors = sailors.filter(
    (s) =>
      s.name.toLowerCase().includes(sailorSearch.toLowerCase()) ||
      s.serviceNo.toLowerCase().includes(sailorSearch.toLowerCase())
  );

  const handleSelectOfficer = (id: string) => {
    setSelectedOfficerId(id);
    setErrorMsg(null);
    if (!password) setPassword("1234");
  };

  const handleSelectSailor = (sailor: SailorProfile) => {
    setSelectedSailor(sailor);
    setSailorSearch(`${sailor.serviceNo} - ${sailor.name}`);
    setShowSailorDropdown(false);
    setErrorMsg(null);
    if (!password) setPassword("1234");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let targetUsername = "";
    let displayName = "";

    if (mode === "OIC") {
      if (!selectedOfficerId) {
        setErrorMsg("Select a command / zone profile to continue.");
        return;
      }
      targetUsername = selectedOfficer?.username || selectedOfficer?.name || "";
      displayName = selectedOfficer?.name || targetUsername;
    } else {
      if (!selectedSailor) {
        setErrorMsg("Search and select your service number or name.");
        return;
      }
      targetUsername = selectedSailor.serviceNo || selectedSailor.name;
      displayName = selectedSailor.name;
    }

    if (!password.trim()) {
      setErrorMsg("Enter your access PIN (default 1234).");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("/api/auth/login", "POST", {
        username: targetUsername,
        password: password.trim(),
      });
      setLoading(false);
      if (res.ok) {
        rememberUsername(targetUsername);
        toast({
          title: "Access granted",
          description: `Welcome aboard, ${displayName}.`,
        });
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || "Authentication failed. Default PIN is 1234.");
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrorMsg((err as Error).message || "Connection error occurred.");
    }
  };

  const selectPresetAndFill = (username: string) => {
    const matched = officers.find((o) => o.username === username || o.id === username);
    if (matched) {
      setMode("OIC");
      setSelectedOfficerId(matched.id);
      setPassword("1234");
      setShowCredentialsGuide(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-stretch overflow-hidden bg-background">
      <BackgroundFX dense />

      {/* ══════════════ LEFT — brand showcase ══════════════ */}
      <section className="relative hidden w-[54%] flex-col justify-between overflow-hidden border-r border-border/50 p-10 xl:flex 2xl:p-14">
        {/* radar rings */}
        <div aria-hidden className="pointer-events-none absolute -left-40 bottom-[-18%] h-[620px] w-[620px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/15"
              style={{ transform: `scale(${1 - i * 0.2})` }}
            />
          ))}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, color-mix(in srgb, var(--primary) 26%, transparent), transparent 32%, transparent 100%)",
              animation: "radarSweep 9s linear infinite",
              maskImage: "radial-gradient(circle, #000 30%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(circle, #000 30%, transparent 70%)",
            }}
          />
        </div>

        {/* top meta */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CrestMark size={38} />
            <div className="leading-none">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Sri Lanka Navy
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                Civil Engineering Branch
              </p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400">
            Secure channel
          </span>
        </div>

        {/* hero */}
        <div className="relative z-10 max-w-xl">
          <div className="mb-7 flex items-center gap-2">
            <span className="h-px w-9 bg-gradient-to-r from-transparent to-[var(--gold)]" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.34em] text-[var(--gold)]/90">
              Logistics management system
            </span>
          </div>

          <h1 className="flex items-baseline gap-2">
            <span className="text-[86px] font-black leading-[0.86] tracking-[-0.06em] text-steel drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
              CMS
            </span>
            <span className="text-[86px] font-black leading-[0.86] tracking-[-0.06em] text-gold drop-shadow-[0_12px_40px_rgba(240,180,41,0.25)]">
              ys
            </span>
          </h1>

          <p className="mt-4 text-[15px] font-bold uppercase tracking-[0.3em] text-foreground/90">
            SLN Logistics
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="h-[3px] w-28 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--gold)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--gold)]">
              Trincomalee
            </span>
          </div>

          <p className="mt-7 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
            One command deck for vote allocations, procurement files, stores, rate contracts and
            daily collection — engineered for the tempo of naval logistics operations.
          </p>

          {/* live metrics */}
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              { label: "Modules online", value: 8, suffix: "/8" },
              { label: "Avg. sync", value: 1.2, suffix: "s", decimals: 1 },
              { label: "Uptime", value: 99.9, suffix: "%", decimals: 1 },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-border/60 bg-card/40 px-3 py-2 backdrop-blur"
              >
                <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-1 text-[17px] font-bold leading-none tabular-nums text-foreground">
                  <AnimatedNumber
                    value={m.value}
                    format={(n) =>
                      m.decimals ? n.toFixed(m.decimals) + m.suffix : Math.round(n) + m.suffix
                    }
                  />
                </p>
              </div>
            ))}
          </div>

          {/* feature chips */}
          <div className="mt-7 flex flex-wrap gap-2">
            {[
              { icon: ShieldCheck, text: "Role-based access" },
              { icon: Waves, text: "Realtime sync" },
              { icon: Radar, text: "Live procurement radar" },
            ].map((f) => (
              <span
                key={f.text}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/30 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
              >
                <f.icon className="h-3 w-3 text-primary" />
                {f.text}
              </span>
            ))}
          </div>
        </div>

        {/* bottom meta */}
        <div className="relative z-10 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
          <span className="flex items-center gap-2">
            <Anchor className="h-3 w-3" /> SLN Logistics · Eastern Command
          </span>
          <span>Security level 4 · Restricted</span>
        </div>
      </section>

      {/* ══════════════ RIGHT — access panel ══════════════ */}
      <section className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-[430px]">
          {/* mobile brand */}
          <div className="mb-6 flex flex-col items-center gap-3 xl:hidden">
            <CrestMark size={64} />
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-black tracking-[-0.05em] text-steel">CMS</span>
              <span className="text-[26px] font-black tracking-[-0.05em] text-gold">ys</span>
            </div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.32em] text-muted-foreground">
              SLN Logistics · Trincomalee
            </p>
          </div>

          <div className="panel hairline-top relative overflow-hidden p-5 sm:p-7">
            {/* corner accents */}
            <span className="pointer-events-none absolute left-0 top-0 h-14 w-14 rounded-tl-[1.1rem] border-l-2 border-t-2 border-[var(--gold)]/35" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 rounded-br-[1.1rem] border-b-2 border-r-2 border-primary/35" />

            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-tight text-foreground">
                  <Fingerprint className="h-4.5 w-4.5 text-primary" />
                  Secure access
                </h2>
                <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                  Authenticate to open the command deck
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCredentialsGuide(true)}
                className="flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1.5 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <KeyRound className="h-3 w-3" /> Profiles
              </button>
            </div>

            {/* mode switch */}
            <div className="relative mb-4 grid grid-cols-2 gap-1 rounded-xl border border-border/60 bg-secondary/40 p-1">
              {(
                [
                  { id: "OIC" as const, label: "Officer / OIC", icon: UserCheck },
                  { id: "SAILOR" as const, label: "Sailor", icon: Anchor },
                ]
              ).map((m) => {
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMode(m.id);
                      setErrorMsg(null);
                    }}
                    className={cn(
                      "relative flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11.5px] font-bold transition-all duration-200",
                      active
                        ? "bg-gradient-to-b from-primary/25 to-primary/10 text-foreground shadow-sm ring-1 ring-primary/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <m.icon className={cn("h-3.5 w-3.5", active ? "text-primary" : "opacity-60")} />
                    {m.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* OIC picker */}
              {mode === "OIC" && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={officerQuery}
                      onChange={(e) => setOfficerQuery(e.target.value)}
                      placeholder="Search command, zone or service no…"
                      className="h-10 w-full rounded-xl border border-border/70 bg-background/70 pl-9 pr-3 text-[11.5px] font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
                    />
                  </div>

                  <div className="scrollbar-thin max-h-[168px] space-y-1.5 overflow-y-auto pr-0.5">
                    {filteredOfficers.length === 0 && (
                      <p className="py-4 text-center text-[11px] text-muted-foreground">
                        No profile matches that search
                      </p>
                    )}
                    {filteredOfficers.map((o) => {
                      const active = selectedOfficerId === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => handleSelectOfficer(o.id)}
                          className={cn(
                            "group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all duration-150",
                            active
                              ? "border-primary/50 bg-primary/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                              : "border-border/50 bg-background/40 hover:border-primary/30 hover:bg-secondary/40"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[9.5px] font-bold",
                              active
                                ? "border-primary/50 bg-primary text-primary-foreground"
                                : "border-border/60 bg-secondary/60 text-muted-foreground"
                            )}
                          >
                            {active ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              o.name.replace(/^(Cdr\.|Lt\.|Capt\.|PO)\s+/i, "").slice(0, 2).toUpperCase()
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11.5px] font-bold text-foreground">
                              {o.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[9.5px] font-medium text-muted-foreground">
                              {o.serviceNo || "—"} · {o.zone || "All"}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                              active
                                ? "border-primary/40 bg-primary/15 text-primary"
                                : "border-border/60 text-muted-foreground"
                            )}
                          >
                            {o.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sailor picker */}
              {mode === "SAILOR" && (
                <div className="relative space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={sailorSearch}
                      placeholder="Service no or name…"
                      onFocus={() => setShowSailorDropdown(true)}
                      onChange={(e) => {
                        setSailorSearch(e.target.value);
                        setShowSailorDropdown(true);
                      }}
                      autoComplete="off"
                      className="h-10 w-full rounded-xl border border-border/70 bg-background/70 px-3 pr-9 text-[11.5px] font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
                    />
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  {showSailorDropdown && (
                    <div className="absolute inset-x-0 top-11 z-30 max-h-52 overflow-y-auto rounded-xl border border-border/70 bg-popover/95 p-1 shadow-2xl backdrop-blur-xl scrollbar-thin">
                      {filteredSailors.length > 0 ? (
                        filteredSailors.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSelectSailor(s)}
                            className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-primary/10"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-[11.5px] font-bold text-foreground">
                                {s.serviceNo} · {s.name}
                              </span>
                              <span className="block truncate text-[9.5px] text-muted-foreground">
                                {s.rate} · {s.department} · {s.zone}
                              </span>
                            </span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                          No matching sailor found
                        </p>
                      )}
                    </div>
                  )}

                  {selectedSailor && (
                    <div className="rounded-xl border border-primary/40 bg-primary/10 p-2.5">
                      <div className="flex items-center justify-between text-[11.5px] font-bold text-foreground">
                        <span className="truncate">{selectedSailor.name}</span>
                        <span className="rounded-full border border-primary/40 bg-primary/15 px-1.5 py-0.5 text-[8.5px] uppercase tracking-wider text-primary">
                          {selectedSailor.rate}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center justify-between text-[9.5px] text-muted-foreground">
                        <span>{selectedSailor.serviceNo}</span>
                        <span className="text-[var(--gold)]">{selectedSailor.zone}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* PIN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    <Lock className="h-3 w-3 text-primary" /> Access PIN
                  </label>
                  <span className="text-[9.5px] font-medium italic text-muted-foreground/80">
                    default <strong className="font-mono font-bold text-[var(--gold)]">1234</strong>
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••"
                    className="h-11 w-full rounded-xl border border-border/70 bg-background/70 pl-3.5 pr-11 font-mono text-[14px] font-bold tracking-[0.4em] text-foreground outline-none transition-colors placeholder:tracking-[0.3em] placeholder:text-muted-foreground/60 focus:border-primary/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                    title="Show / hide PIN"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/35 bg-destructive/10 p-2.5 text-[11px] font-medium text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer select-none items-center gap-2 text-[10.5px] font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-border/70 bg-background accent-[var(--primary)]"
                  />
                  Keep me signed in
                </label>
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400/80">
                  <CircleDot className="h-3 w-3" /> encrypted
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-[var(--accent)] text-[11.5px] font-black uppercase tracking-[0.18em] text-primary-foreground shadow-[0_16px_36px_-16px_var(--glow-primary)] transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    Enter command deck <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/50">
            Authorised personnel only · Activity is logged
          </p>
        </div>
      </section>

      {/* ══════════════ Credentials dialog ══════════════ */}
      {showCredentialsGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowCredentialsGuide(false)}
        >
          <div
            className="panel w-full max-w-md overflow-hidden p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[12.5px] font-bold text-foreground">Demo profiles</p>
                  <p className="text-[9.5px] font-medium text-muted-foreground">
                    All profiles use PIN 1234
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentialsGuide(false)}
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="scrollbar-thin max-h-[60vh] overflow-y-auto p-2">
              {officers.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-secondary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-bold text-foreground">{o.name}</p>
                    <p className="truncate text-[9.5px] text-muted-foreground">
                      {o.role} · {o.department} · PIN 1234
                    </p>
                  </div>
                  <button
                    onClick={() => selectPresetAndFill(o.username)}
                    className="shrink-0 rounded-lg bg-primary/15 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wider text-primary hover:bg-primary/25"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
