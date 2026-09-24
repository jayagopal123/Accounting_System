import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Collapsible section used by ResourceFormPage and DocumentForm. */
export const FormSection: React.FC<{
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, defaultOpen = true, children, className }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cn("rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-muted/40 transition-colors"
      >
        <span>
          <span className="block text-sm font-semibold text-foreground font-display">{title}</span>
          {description && <span className="block text-xs text-muted-foreground">{description}</span>}
        </span>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="space-y-4 px-5 pb-5 pt-1">{children}</div>}
    </section>
  );
};

export default FormSection;
