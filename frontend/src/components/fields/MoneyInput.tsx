import React from "react";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number | string;
  onChange: (val: number) => void;
  label?: string;
  error?: string;
  helperText?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  className = "",
  disabled = false,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(raw);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-foreground tracking-wide block">
          {label}
        </label>
      )}
      <div className="relative rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-muted-foreground font-mono-numbers text-sm font-semibold">₹</span>
        </div>
        <input
          type="number"
          step="0.01"
          disabled={disabled}
          value={value === 0 || value === "0" ? "" : value}
          onChange={handleChange}
          placeholder="0.00"
          className={cn(
            "w-full rounded-xl bg-transparent py-2 pl-8 pr-3 text-sm font-mono-numbers tabular-nums text-foreground outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-destructive ring-1 ring-destructive" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
};
