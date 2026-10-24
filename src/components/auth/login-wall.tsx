"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Search,
  Check,
  ChevronDown,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Building2,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/use-fetch";

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
  const [sailorSearch, setSailorSearch] = useState<string>("");
  const [showSailorDropdown, setShowSailorDropdown] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("1234");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showCredentialsGuide, setShowCredentialsGuide] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  // Load profiles from backend API
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
        // Use defaults if fetch fails
      });
  }, []);

  const selectedOfficer = officers.find((o) => o.id === selectedOfficerId);

  const filteredSailors = sailors.filter(
    (s) =>
      s.name.toLowerCase().includes(sailorSearch.toLowerCase()) ||
      s.serviceNo.toLowerCase().includes(sailorSearch.toLowerCase())
  );

  const handleSelectOfficer = (id: string) => {
    setSelectedOfficerId(id);
    setErrorMsg(null);
    if (!password) {
      setPassword("1234");
    }
  };

  const handleSelectSailor = (sailor: SailorProfile) => {
    setSelectedSailor(sailor);
    setSailorSearch(`${sailor.serviceNo} - ${sailor.name}`);
    setShowSailorDropdown(false);
    setErrorMsg(null);
    if (!password) {
      setPassword("1234");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let targetUsername = "";
    let displayName = "";

    if (mode === "OIC") {
      if (!selectedOfficerId) {
        setErrorMsg("Please select a Command / Zone profile to continue!");
        return;
      }
      targetUsername = selectedOfficer?.username || selectedOfficer?.name || "";
      displayName = selectedOfficer?.name || targetUsername;
    } else {
      if (!selectedSailor) {
        setErrorMsg("Please search and select your Service Number / Name!");
        return;
      }
      targetUsername = selectedSailor.serviceNo || selectedSailor.name;
      displayName = selectedSailor.name;
    }

    if (!password.trim()) {
      setErrorMsg("Please enter password / PIN (Default: 1234)");
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
        toast({
          title: "Access Granted ⚓",
          description: `Welcome to Naval Portal, ${displayName}!`,
        });
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || "Authentication failed. Try PIN: 1234");
        toast({
          title: "Authentication Failed",
          description: res.error || "Please verify your PIN / password.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Connection error occurred.");
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
    <div className="fixed inset-0 min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 overflow-y-auto z-50 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Soft background ambient lighting glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center space-y-4 relative z-10 text-slate-100 my-auto">
        {/* Crest and Title */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(20,184,166,0.45)]">
            <img
              src="/logo.png"
              alt="Navy Crest"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to logo-crest.png or logo.svg if needed
                (e.target as HTMLImageElement).src = "/logo-crest.png";
              }}
            />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide leading-snug">
              Civil Engineering Management System
            </h2>
            <p className="text-xs text-teal-300 font-semibold flex items-center justify-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block shadow-sm shadow-emerald-400/80" />
              Sri Lanka Navy • Eastern Command Hub
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 text-left pt-1">
          {/* Mode Toggle Tab */}
          <div className="flex border border-white/15 rounded-xl overflow-hidden p-0.5 bg-slate-950/60 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode("OIC");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "OIC"
                  ? "text-white bg-teal-600 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>👔</span> Officer / In-Charge
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("SAILOR");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "SAILOR"
                  ? "text-white bg-teal-600 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>⚓</span> Sailor Profile
            </button>
          </div>

          {/* OIC Mode Content */}
          {mode === "OIC" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  SELECT COMMAND / ZONE PROFILE <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCredentialsGuide(!showCredentialsGuide)}
                  className="text-[10px] font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer flex items-center gap-1"
                >
                  <span>🔑</span> View All Profiles & PINs
                </button>
              </div>

              <div className="relative">
                <select
                  value={selectedOfficerId}
                  onChange={(e) => handleSelectOfficer(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900/95 border border-white/20 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-teal-400 cursor-pointer appearance-none pr-8"
                >
                  <option value="">-- Choose Profile --</option>
                  <optgroup label="⭐ Command & Executive Profiles">
                    {officers
                      .filter((o) => o.group === "Command & Executive Profiles")
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          ⭐ {o.name} ({o.serviceNo || o.role})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="⚓ Maintenance Zone In-Charges">
                    {officers
                      .filter((o) => o.group === "Maintenance Zone In-Charges")
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          ⚓ {o.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Selected Profile Details Badge Card */}
              {selectedOfficer && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-teal-500/40 text-xs space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-teal-300 font-bold">
                    <span>{selectedOfficer.name}</span>
                    <span className="px-2 py-0.5 rounded bg-teal-900/80 text-[10px] text-teal-200 border border-teal-500/40">
                      {selectedOfficer.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Service No: {selectedOfficer.serviceNo || "-"}</span>
                    <span className="text-amber-300 font-medium">
                      Zone: {selectedOfficer.zone || "All"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sailor Mode Content */}
          {mode === "SAILOR" && (
            <div className="space-y-2 relative">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                SEARCH SERVICE NO / NAME <span className="text-rose-400">*</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={sailorSearch}
                  placeholder="Type Service No or Name..."
                  onFocus={() => setShowSailorDropdown(true)}
                  onChange={(e) => {
                    setSailorSearch(e.target.value);
                    setShowSailorDropdown(true);
                  }}
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 bg-slate-900/95 border border-white/20 text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-400"
                />
                <Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Autocomplete Dropdown */}
              {showSailorDropdown && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto divide-y divide-slate-800 bg-slate-950 border border-white/20 rounded-xl shadow-2xl scrollbar-thin">
                  {filteredSailors.length > 0 ? (
                    filteredSailors.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSailor(s)}
                        className="w-full text-left p-2.5 hover:bg-teal-950/60 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                      >
                        <div>
                          <div className="font-bold text-slate-200 group-hover:text-teal-300">
                            {s.serviceNo} - {s.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {s.rate} • {s.department} • {s.zone}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                          Select
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No matching sailor found
                    </div>
                  )}
                </div>
              )}

              {/* Selected Sailor Details Card */}
              {selectedSailor && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-teal-500/40 text-xs space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-teal-300 font-bold">
                    <span>{selectedSailor.name}</span>
                    <span className="px-2 py-0.5 rounded bg-teal-900/80 text-[10px] text-teal-200 border border-teal-500/40">
                      {selectedSailor.rate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Service No: {selectedSailor.serviceNo}</span>
                    <span className="text-amber-300 font-medium">{selectedSailor.zone}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Password Input with Show/Hide Toggle */}
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                PASSWORD / PIN <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400 italic">
                Default PIN: <strong className="text-amber-300 font-mono">1234</strong>
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password / PIN (Default: 1234)"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/95 border border-white/20 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-teal-400 tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-slate-400 hover:text-white p-1 text-sm cursor-pointer transition-colors"
                title="Show / Hide Password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Keep Me Logged In Checkbox */}
          <div className="flex items-center justify-between text-xs text-slate-300 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 bg-slate-900 border-white/20 focus:ring-teal-500 cursor-pointer accent-teal-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                Keep me logged in (Stay logged in)
              </span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-400 text-white font-black rounded-xl shadow-lg transform transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <span>🔓</span> ACCESS NAVAL PORTAL ➔
              </>
            )}
          </button>
        </form>

        {/* Expandable Credentials Guide Drawer */}
        {showCredentialsGuide && (
          <div className="text-left p-3.5 rounded-2xl bg-slate-950/95 border border-teal-500/40 text-xs space-y-2 max-h-60 overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-teal-300 font-bold border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5 text-xs">
                🔑 All Available Profiles & Access Roles
              </span>
              <button
                type="button"
                onClick={() => setShowCredentialsGuide(false)}
                className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300 divide-y divide-slate-800">
              {officers.map((o) => (
                <div
                  key={o.id}
                  className="pt-1.5 first:pt-0 flex items-center justify-between hover:bg-teal-950/40 p-1 rounded"
                >
                  <div>
                    <span className="font-bold text-white">{o.name}</span>
                    <span className="text-slate-400 ml-1.5">
                      ({o.role} • {o.department})
                    </span>
                    <div className="text-[10px] text-amber-300 font-mono">PIN: 1234</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectPresetAndFill(o.username)}
                    className="px-2 py-1 rounded bg-teal-600/80 hover:bg-teal-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Naval System Footer */}
      <footer className="absolute bottom-3 text-center text-xs text-slate-500 flex items-center gap-2 select-none">
        <Building2 className="h-3.5 w-3.5 text-teal-500/70" />
        <span>Dockyard ERP Logistics & Operations Panel • Security Level 4</span>
      </footer>
    </div>
  );
}
