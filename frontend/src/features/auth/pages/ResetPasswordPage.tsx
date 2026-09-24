import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { BRAND } from "@/config/brand";

export const ResetPasswordPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Login
      </Link>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
          Set New Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Password reset token verification.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-semibold text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>Invalid or Unsupported Reset Request</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Password reset tokens cannot be processed without administrator verification.
        </p>
        <div className="pt-2 text-xs font-medium text-foreground">
          Please contact:{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="text-primary underline">
            {BRAND.supportEmail}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
