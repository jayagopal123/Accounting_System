import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Landmark, Pencil } from "lucide-react";
import { bankingService } from "@/api/services/bankingService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CountUp } from "@/components/feedback/CountUp";
import { StatusBadge } from "@/components/feedback/StatusBadge";

export const BankAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.bankAccounts.list(),
    queryFn: bankingService.getBankAccounts,
  });

  const toggle = async (id: string) => {
    await bankingService.toggleBankAccountStatus(id);
    invalidate.onBankTransactionChange();
    toast.success("Bank account status updated.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Accounts"
        description="Real bank accounts mapped to GL cash & bank ledgers."
        actions={
          <button onClick={() => navigate("/bank-accounts/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Bank Account
          </button>
        }
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No bank accounts" description="Add your first bank account to track balances and reconcile statements." icon={<Landmark className="h-7 w-7 stroke-[1.5]" />} action={{ label: "New Bank Account", onClick: () => navigate("/bank-accounts/new") }} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((ba) => (
            <div key={ba._id} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Landmark className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{ba.accountName}</p>
                    <p className="text-[10px] text-muted-foreground">{ba.bankName} · {ba.branch}</p>
                  </div>
                </div>
                <StatusBadge status={ba.isActive ? "Active" : "Inactive"} />
              </div>
              <p className="mt-3 font-mono-numbers text-xs text-muted-foreground">A/C •••• {ba.accountNumber.slice(-4)} · {ba.ifscCode}</p>
              <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Current Balance</p>
                  <p className="text-xl font-bold font-mono-numbers"><CountUp value={ba.currentBalance ?? 0} isCurrency /></p>
                </div>
                <div className="flex gap-1.5">
                  <button title="Edit" onClick={() => navigate(`/bank-accounts/${ba._id}/edit`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => toggle(ba._id)}
                    className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold hover:bg-muted"
                  >
                    {ba.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => navigate(`/bank-transactions?bankAccountId=${ba._id}`)} className="flex-1 rounded-xl border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-muted">
                  Transactions
                </button>
                <button onClick={() => navigate(`/bank-reconciliation?bankAccountId=${ba._id}&new=1`)} className="flex-1 rounded-xl border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-muted">
                  Reconcile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankAccountsPage;
