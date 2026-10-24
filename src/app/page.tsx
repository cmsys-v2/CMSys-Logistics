"use client";

import { useState } from "react";
import { AppShell } from "@/components/erp/app-shell";
import { ModuleId } from "@/components/erp/nav";
import { useFetch } from "@/lib/use-fetch";
import { Dashboard } from "@/components/erp/modules/dashboard";
import { ProjectsModule } from "@/components/erp/modules/projects";
import { ProcurementModule } from "@/components/erp/modules/procurement";
import { StoresModule } from "@/components/erp/modules/stores";
import { RateFinderModule } from "@/components/erp/modules/rate-finder";
import { CollectionModule } from "@/components/erp/modules/collection";
import { StakeholdersModule } from "@/components/erp/modules/stakeholders";
import { SettingsModule } from "@/components/erp/modules/settings";
import { LoginWall } from "@/components/auth/login-wall";
import { CrestMark } from "@/components/brand/cmsys-brand";
import { BackgroundFX } from "@/components/erp/fx";

interface SessionResponse {
  authenticated: boolean;
  user: {
    id: string;
    username: string;
    displayName: string;
    role: string;
    department: string | null;
  } | null;
}

function BootScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden">
      <BackgroundFX dense />
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative">
          <span className="absolute inset-0 animate-sonar rounded-full border border-primary/40" />
          <CrestMark size={92} priority className="animate-float-slow" />
        </div>
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black tracking-[-0.05em] text-steel">CMS</span>
            <span className="text-3xl font-black tracking-[-0.05em] text-gold">ys</span>
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.42em] text-muted-foreground">
            SLN Logistics · Trincomalee
          </p>
        </div>
        <div className="mt-1 h-[3px] w-52 overflow-hidden rounded-full bg-border/60">
          <div className="animate-shimmer h-full w-full rounded-full bg-gradient-to-r from-primary via-[var(--gold)] to-primary" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">
          Establishing secure link…
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState<ModuleId>("dashboard");

  const {
    data: sessionData,
    loading: sessionLoading,
    refresh: refreshSession,
  } = useFetch<SessionResponse>("/api/auth/session");

  const { data: stats, refresh: refreshStats } = useFetch<{
    net: number;
    task: number;
    avail: number;
    team: number;
  }>("/api/stats");

  const handleNavigate = (id: ModuleId) => {
    setActive(id);
    refreshStats();
  };

  if (sessionLoading) return <BootScreen />;

  if (!sessionData?.authenticated) {
    return <LoginWall onLoginSuccess={refreshSession} />;
  }

  return (
    <AppShell active={active} onNavigate={handleNavigate} stats={stats}>
      {active === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
      {active === "projects" && <ProjectsModule onNavigate={handleNavigate} />}
      {active === "procurement" && <ProcurementModule />}
      {active === "stores" && <StoresModule />}
      {active === "rate-finder" && <RateFinderModule />}
      {active === "collection" && <CollectionModule />}
      {active === "stakeholders" && <StakeholdersModule />}
      {active === "settings" && <SettingsModule />}
    </AppShell>
  );
}
