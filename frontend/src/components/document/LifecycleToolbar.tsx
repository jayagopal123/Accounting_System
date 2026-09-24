import React, { useState } from "react";
import {
  type EntityLifecycleType,
  getAvailableLifecycleActions,
  type LifecycleAction,
} from "@/lib/lifecycle";
import { StatusBadge } from "../feedback/StatusBadge";
import { ConfirmDialog } from "../feedback/ConfirmDialog";
import { PermissionGate } from "@/lib/PermissionGate";
import { cn } from "@/lib/utils";

interface LifecycleToolbarProps {
  entityType: EntityLifecycleType;
  currentStatus: string;
  onAction: (actionId: string, nextStatus: string) => Promise<void> | void;
  isLoading?: boolean;
  canEdit?: boolean;
  onEdit?: () => void;
  editPermission?: string;
  className?: string;
}

export const LifecycleToolbar: React.FC<LifecycleToolbarProps> = ({
  entityType,
  currentStatus,
  onAction,
  isLoading = false,
  canEdit = false,
  onEdit,
  editPermission,
  className = "",
}) => {
  const [activeAction, setActiveAction] = useState<LifecycleAction | null>(null);
  const actions = getAvailableLifecycleActions(entityType, currentStatus);

  const handleConfirmAction = async () => {
    if (!activeAction) return;
    await onAction(activeAction.id, activeAction.nextStatus);
    setActiveAction(null);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
          Status:
        </span>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="flex items-center gap-2">
        {canEdit && currentStatus === "Draft" && onEdit && (
          <PermissionGate perm={editPermission}>
            <button
              type="button"
              disabled={isLoading}
              onClick={onEdit}
              className="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-50"
            >
              Edit
            </button>
          </PermissionGate>
        )}

        {actions.map((action) => (
          <PermissionGate key={action.id} perm={action.permission}>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setActiveAction(action)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all shadow-sm disabled:opacity-50",
                action.destructive
                  ? "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                  : "bg-primary text-white hover:bg-primary/90 glow-primary"
              )}
            >
              {action.label}
            </button>
          </PermissionGate>
        ))}
      </div>

      {activeAction && (
        <ConfirmDialog
          open={!!activeAction}
          onOpenChange={(open) => !open && setActiveAction(null)}
          title={`${activeAction.label}?`}
          description={`Are you sure you want to transition this record to status "${activeAction.nextStatus}"?`}
          consequenceText={activeAction.consequenceText}
          destructive={activeAction.destructive}
          confirmLabel={activeAction.label}
          onConfirm={handleConfirmAction}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
