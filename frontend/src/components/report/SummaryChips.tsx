import React from "react";
import { CountUp } from "../feedback/CountUp";
import { cn } from "@/lib/utils";

export interface SummaryChipItem {
  label: string;
  value: number | string;
  isCurrency?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
  badge?: React.ReactNode;
}

interface SummaryChipsProps {
  chips: SummaryChipItem[];
  className?: string;
}

export const SummaryChips: React.FC<SummaryChipsProps> = ({ chips, className = "" }) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3.5", className)}>
      {chips.map((chip, idx) => {
        let borderClass = "border-border/80";
        let textClass = "text-foreground";

        if (chip.variant === "success") {
          borderClass = "border-emerald-500/30 bg-emerald-500/5";
          textClass = "text-emerald-600 dark:text-emerald-400";
        } else if (chip.variant === "destructive") {
          borderClass = "border-destructive/30 bg-destructive/5";
          textClass = "text-destructive";
        } else if (chip.variant === "warning") {
          borderClass = "border-amber-500/30 bg-amber-500/5";
          textClass = "text-amber-600 dark:text-amber-400";
        }

        return (
          <div
            key={idx}
            className={cn(
              "rounded-2xl border bg-card p-4 shadow-sm space-y-1 transition-all",
              borderClass
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                {chip.label}
              </span>
              {chip.badge}
            </div>
            <div className={cn("text-lg font-bold font-mono-numbers tracking-tight", textClass)}>
              {typeof chip.value === "number" ? (
                <CountUp value={chip.value} isCurrency={chip.isCurrency} />
              ) : (
                chip.value
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
