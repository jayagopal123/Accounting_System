import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4 shadow-sm">
        {icon || <FolderOpen className="h-7 w-7 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-semibold text-foreground font-display tracking-tight mb-1">
        {title}
      </h3>
      <p className="max-w-md text-sm text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-all glow-primary"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
};
