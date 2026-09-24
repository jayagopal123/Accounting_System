import React from "react";
import { AlertCircle, ShieldAlert, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  isForbidden?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  isForbidden = false,
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl mb-4 shadow-sm",
          isForbidden ? "bg-amber-500/15 text-amber-600" : "bg-destructive/15 text-destructive"
        )}
      >
        {isForbidden ? (
          <ShieldAlert className="h-7 w-7 stroke-[1.5]" />
        ) : (
          <AlertCircle className="h-7 w-7 stroke-[1.5]" />
        )}
      </div>

      <h3 className="text-base font-semibold text-foreground font-display tracking-tight mb-1">
        {title || (isForbidden ? "Access Restricted" : "Unable to load data")}
      </h3>

      <p className="max-w-md text-sm text-muted-foreground mb-6 leading-relaxed">
        {message ||
          (isForbidden
            ? "Your user role does not have permission to view or manage this module. Please contact your organization administrator."
            : "An unexpected error occurred while communicating with the accounting ledger service.")}
      </p>

      {onRetry && !isForbidden && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Request
        </button>
      )}
    </div>
  );
};
