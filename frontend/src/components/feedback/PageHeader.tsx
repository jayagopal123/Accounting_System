import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  backButton,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 pt-2 md:flex-row md:items-center md:justify-between border-b border-border/60",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {backButton && <div className="mt-1">{backButton}</div>}
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
};
