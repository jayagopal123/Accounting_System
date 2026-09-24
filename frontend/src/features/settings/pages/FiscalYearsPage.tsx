import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Calendar, Pencil, Lock } from "lucide-react";
import { settingsService } from "@/api/services/settingsService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useActiveFiscalYear } from "@/hooks/useActiveFiscalYear";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

export const FiscalYearsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const { activeFiscalYear } = useActiveFiscalYear();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.fiscalYears.list(),
    queryFn: settingsService.getFiscalYears,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiscal Years"
        description="Accounting periods (April–March). The active FY drives report presets and the topbar chip."
        actions={
          <button onClick={() => navigate("/settings/fiscal-years/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Fiscal Year
          </button>
        }
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No fiscal years" description="Create accounting periods for the organisation." icon={<Calendar className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((fy) => {
            const isActive = activeFiscalYear?._id === fy._id;
            return (
              <div key={fy._id} className={cn(
                "flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm",
                isActive ? "border-primary/50 ring-1 ring-primary/20" : "border-border/80"
              )}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {fy.name}
                    {isActive && <span className="ml-2 rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">ACTIVE</span>}
                  </p>
                  <p className="font-mono-numbers text-xs text-muted-foreground">
                    {formatDate(fy.startDate)} – {formatDate(fy.endDate)}
                  </p>
                </div>
                <StatusBadge status={fy.isClosed ? "Closed" : "Active"} />
                <div className="flex gap-1.5">
                  <button onClick={() => navigate(`/settings/fiscal-years/${fy._id}/edit`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {!fy.isClosed && (
                    <ConfirmDialog
                      title={`Close ${fy.name}?`}
                      description="Closing locks all journal entries in this period."
                      consequenceText="No further postings will be accepted for this fiscal year. Ensure final audits and reconciliations are complete. Exact locking behaviour is isolated in settingsService (⚠ VERIFY)."
                      destructive
                      confirmLabel="Close Fiscal Year"
                      onConfirm={async () => {
                        await settingsService.closeFiscalYear(fy._id);
                        invalidate.onFiscalYearChange();
                        toast.success(`${fy.name} closed — postings in this period are now locked.`);
                      }}
                    >
                      <button className="inline-flex items-center gap-1 rounded-xl border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20">
                        <Lock className="h-3 w-3" /> Close
                      </button>
                    </ConfirmDialog>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FiscalYearsPage;
