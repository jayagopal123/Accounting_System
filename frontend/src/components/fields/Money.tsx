import React from "react";
import { formatMoney } from "@/lib/formatMoney";
import { cn } from "@/lib/utils";

interface MoneyProps {
  amount: number | string | null | undefined;
  className?: string;
  showSymbol?: boolean;
  compact?: boolean;
  colored?: boolean; // Green for positive, red for negative
}

export const Money: React.FC<MoneyProps> = ({
  amount,
  className = "",
  showSymbol = true,
  compact = false,
  colored = false,
}) => {
  const formatted = formatMoney(amount, { showSymbol, compact });
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount || 0);

  let colorClass = "";
  if (colored) {
    if (num > 0) colorClass = "text-emerald-600 dark:text-emerald-400";
    else if (num < 0) colorClass = "text-destructive dark:text-red-400";
  }

  return (
    <span className={cn("font-mono-numbers tabular-nums tracking-tight font-medium", colorClass, className)}>
      {formatted}
    </span>
  );
};
