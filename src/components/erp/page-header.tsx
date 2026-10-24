"use client";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="relative mb-5 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px left-0 h-px w-40 bg-gradient-to-r from-primary via-[var(--gold)] to-transparent"
      />
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/25 via-primary/10 to-[var(--gold)]/15 text-primary shadow-[0_10px_24px_-14px_var(--glow-primary)]">
            <Icon className="h-5 w-5 stroke-[2.1]" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-[19px] font-black tracking-[-0.028em] text-foreground sm:text-[22px]">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 truncate text-[11.5px] font-medium text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
