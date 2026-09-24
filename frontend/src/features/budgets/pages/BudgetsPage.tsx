import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Target, TrendingUp, Pencil } from "lucide-react";
import { budgetService, type BudgetItem } from "@/api/services/budgetService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { formatMoney } from "@/lib/formatMoney";
import { cn } from "@/lib/utils";

export const BudgetsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.budgets.list({}),
    queryFn: () => budgetService.getBudgets({ limit: 100 }),
  });

  const lifecycle = async (b: BudgetItem, action: "approve" | "close") => {
    try {
      if (action === "approve") await budgetService.approveBudget(b._id);
      else await budgetService.closeBudget(b._id);
      invalidate.onBudgetChange(b._id);
      toast.success(`Budget ${action === "approve" ? "approved" : "closed"}.`);
    } catch (err: any) {
      toast.error(err?.message || "Action failed.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Period targets per ledger account, with variance tracking."
        actions={
          <button onClick={() => navigate("/budgets/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Budget
          </button>
        }
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data?.items ?? []).length === 0 ? (
        <EmptyState title="No budgets" description="Create a budget to track targets against actuals." icon={<Target className="h-7 w-7 stroke-[1.5]" />} action={{ label: "New Budget", onClick: () => navigate("/budgets/new") }} />
      ) : (
        <div className="space-y-2">
          {(data?.items ?? []).map((b: BudgetItem) => {
            const utilisation = b.budgetAmount > 0 ? ((b.actualAmount ?? 0) / b.budgetAmount) * 100 : 0;
            const over = utilisation > 100;
            return (
              <div key={b._id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <button onClick={() => navigate(`/budgets/${b._id}/vs-actual`)} className="text-left text-sm font-semibold hover:text-primary hover:underline">
                      {b.name}
                    </button>
                    <p className="text-[10px] text-muted-foreground">
                      {b.fiscalYear} · {typeof b.account === "object" ? b.account?.accountName : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-numbers text-xs"><span className="text-muted-foreground">Budget </span><span className="font-semibold">{formatMoney(b.budgetAmount)}</span></p>
                    <p className={cn("font-mono-numbers text-xs", over ? "font-semibold text-destructive" : "text-muted-foreground")}>
                      Actual {formatMoney(b.actualAmount ?? 0)}
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full transition-all", over ? "bg-destructive" : "bg-primary")} style={{ width: `${Math.min(100, utilisation)}%` }} />
                    </div>
                    <p className={cn("mt-1 text-right text-[10px] font-mono-numbers", over ? "font-bold text-destructive" : "text-muted-foreground")}>
                      {utilisation.toFixed(0)}% used
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                  <div className="flex gap-1.5">
                    {b.status === "Draft" && (
                      <ConfirmDialog
                        title="Approve budget?"
                        description="Approval locks the targets and activates budget tracking."
                        confirmLabel="Approve"
                        onConfirm={() => lifecycle(b, "approve")}
                      >
                        <button className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">Approve</button>
                      </ConfirmDialog>
                    )}
                    {b.status === "Approved" && (
                      <>
                        <button onClick={() => navigate(`/budgets/${b._id}/vs-actual`)} className="inline-flex items-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted">
                          <TrendingUp className="h-3 w-3" /> Variance
                        </button>
                        <button onClick={() => navigate(`/budgets/${b._id}/edit`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <ConfirmDialog
                          title="Close budget?"
                          description="Closing ends tracking for this fiscal period."
                          destructive
                          confirmLabel="Close"
                          onConfirm={() => lifecycle(b, "close")}
                        >
                          <button className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20">Close</button>
                        </ConfirmDialog>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
