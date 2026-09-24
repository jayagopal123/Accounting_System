import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStatusMeta } from "@/lib/lifecycle";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showDot = true,
}) => {
  const meta = getStatusMeta(status);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={meta.label}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide select-none",
          meta.badgeClass,
          className
        )}
      >
        {showDot && (
          <span
            className={cn("w-1.5 h-1.5 rounded-full shrink-0", meta.dotClass)}
            aria-hidden="true"
          />
        )}
        <span>{meta.label}</span>
      </motion.span>
    </AnimatePresence>
  );
};
