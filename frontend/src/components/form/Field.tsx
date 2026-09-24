import React from "react";
import { cn } from "@/lib/utils";

export const Field: React.FC<{
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ label, error, hint, required, className, children }) => (
  <div className={cn("space-y-1.5", className)}>
    {label && (
      <label className="block text-xs font-medium text-foreground tracking-wide">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-xs font-medium text-destructive" role="alert">{error}</p>
    ) : hint ? (
      <p className="text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

export default Field;
