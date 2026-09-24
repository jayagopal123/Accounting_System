import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CheckSquare, Square, Lock } from "lucide-react";
import { bankingService, type BankTransactionItem } from "@/api/services/bankingService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { RouteFallback } from "@/app/guards";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

export const ReconciliationWorkspacePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const { data: rec, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.bankReconciliations.detail(id ?? ""),
    queryFn: () => bankingService.getBankReconciliationById(id!),
    enabled: !!id,
  });

  const bankAccountId = useMemo(() => {
    if (!rec) return "";
    return typeof rec.bankAccount === "object" ? rec.bankAccount._id : rec.bankAccount;
  }, [rec]);

  // Unreconciled transactions for the account (endpoint contract isolated in bankingService ⚠ VERIFY)
  const { data: unreconciled } = useQuery({
    queryKey: queryKeys.bankTransactions.unreconciled(bankAccountId),
    queryFn: () => bankingService.getUnreconciledTransactions(bankAccountId),
    enabled: !!bankAccountId && rec?.status === "Draft",
  });

  if (isLoading) return <RouteFallback />;
  if (error || !rec) {
    return <ErrorState title="Reconciliation not found" message={(error as Error)?.message} onRetry={() => refetch()} />;
  }

  const clearedDeposits = (unreconciled ?? [])
    .filter((t: BankTransactionItem) => matched.has(t._id) && t.type === "Deposit")
    .reduce((s, t) => s + t.amount, 0);
  const clearedWithdrawals = (unreconciled ?? [])
    .filter((t: BankTransactionItem) => matched.has(t._id) && t.type === "Withdrawal")
    .reduce((s, t) => s + t.amount, 0);

  // Live summary: opening + cleared deposits − cleared withdrawals vs statement closing
  const clearedBalance = rec.openingBalance + clearedDeposits - clearedWithdrawals;
  const difference = Math.round((rec.closingBalance - clearedBalance) * 100) / 100;
  const isZero = Math.abs(difference) < 0.01;

  const toggle = (tid: string) =>
    setMatched((prev) => {
      const next = new Set(prev);
      if (next.has(tid)) next.delete(tid);
      else next.add(tid);
      return next;
    });

  const matchTicked = async () => {
    if (matched.size === 0) return;
    setBusy(true);
    try {
      // Payload assumption: transaction ids — isolated in one service call (⚠ VERIFY)
      await bankingService.matchTransactions(rec._id, Array.from(matched));
      invalidate.onReconciliationChange(rec._id);
      toast.success(`${matched.size} transaction(s) matched.`);
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    if (!isZero) {
      toast.error(`Difference must be ₹0.00 to complete (currently ${formatMoney(difference)}).`);
      return;
    }
    setBusy(true);
    try {
      await bankingService.completeReconciliation(rec._id);
      invalidate.onReconciliationChange(rec._id);
      toast.success("Reconciliation completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reconciliation Workspace"
        description={`${typeof rec.bankAccount === "object" ? rec.bankAccount?.accountName : "Bank"} · ${formatDate(rec.statementStartDate)} – ${formatDate(rec.statementEndDate)}`}
        badge={<StatusBadge status={rec.status} />}
        backButton={
          <button onClick={() => navigate("/bank-reconciliation")} className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </button>
        }
      />

      {rec.status !== "Draft" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
          <Lock className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-2 text-sm font-semibold">This reconciliation is {rec.status.toLowerCase()} and locked.</p>
          <p className="mt-1 font-mono-numbers text-xs text-muted-foreground">
            Opening {formatMoney(rec.openingBalance)} · Closing {formatMoney(rec.closingBalance)} · Difference {formatMoney(rec.difference)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: unreconciled transactions */}
          <div className="rounded-2xl border border-border/80 bg-card shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
              <h3 className="text-sm font-semibold font-display">Unreconciled Transactions</h3>
              <button
                type="button"
                onClick={() => setMatched(matched.size === (unreconciled ?? []).length ? new Set() : new Set((unreconciled ?? []).map((t: BankTransactionItem) => t._id)))}
                className="text-xs font-medium text-primary hover:underline"
              >
                {matched.size === (unreconciled ?? []).length ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="max-h-[480px] divide-y divide-border/60 overflow-y-auto">
              {(unreconciled ?? []).length === 0 && (
                <p className="px-5 py-10 text-center text-xs text-muted-foreground">No unreconciled transactions for this account.</p>
              )}
              {(unreconciled ?? []).map((t: BankTransactionItem) => (
                <label key={t._id} className="flex cursor-pointer items-center gap-3 px-5 py-3 hover:bg-muted/40">
                  <button type="button" onClick={() => toggle(t._id)} aria-label={`Match ${t.referenceNumber}`}>
                    {matched.has(t._id) ? <CheckSquare className="h-4.5 w-4.5 text-primary" /> : <Square className="h-4.5 w-4.5 text-muted-foreground" />}
                  </button>
                  <span className="w-20 text-xs">{formatDate(t.transactionDate)}</span>
                  <span className="flex-1 truncate text-xs">{t.description}</span>
                  <span className="font-mono-numbers text-xs text-muted-foreground">{t.referenceNumber}</span>
                  <span className={cn("w-28 text-right font-mono-numbers text-xs font-semibold", t.type === "Deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                    {t.type === "Deposit" ? "+" : "−"}{formatMoney(t.amount)}
                  </span>
                </label>
              ))}
            </div>
            <div className="border-t border-border/60 px-5 py-3">
              <button
                type="button" disabled={busy || matched.size === 0} onClick={matchTicked}
                className="w-full rounded-xl border border-primary/40 bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
              >
                Save match ({matched.size} ticked)
              </button>
            </div>
          </div>

          {/* Right: live summary */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold font-display">Live Summary</h3>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground">Opening balance</dt><dd className="font-mono-numbers font-medium">{formatMoney(rec.openingBalance)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">+ Cleared deposits</dt><dd className="font-mono-numbers font-medium text-emerald-600 dark:text-emerald-400">{formatMoney(clearedDeposits)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">− Cleared withdrawals</dt><dd className="font-mono-numbers font-medium text-amber-600 dark:text-amber-400">{formatMoney(clearedWithdrawals)}</dd></div>
                <div className="flex justify-between border-t border-border/60 pt-2"><dt className="font-semibold">Cleared balance</dt><dd className="font-mono-numbers font-bold">{formatMoney(clearedBalance)}</dd></div>
                <div className="flex justify-between border-t border-border/60 pt-2"><dt className="font-semibold">Statement closing</dt><dd className="font-mono-numbers font-medium">{formatMoney(rec.closingBalance)}</dd></div>
                <div className="flex justify-between rounded-xl bg-muted/40 p-2.5">
                  <dt className="font-semibold">Difference</dt>
                  <dd className={cn("font-mono-numbers font-bold", isZero ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {formatMoney(difference)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 space-y-2">
                <button
                  type="button" disabled={!isZero || busy} onClick={complete}
                  className={cn(
                    "w-full rounded-xl py-2.5 text-xs font-semibold transition-all",
                    isZero ? "bg-primary text-white hover:bg-primary/90" : "cursor-not-allowed bg-muted text-muted-foreground"
                  )}
                >
                  Complete Reconciliation
                </button>
                <p className="text-center text-[10px] text-muted-foreground">
                  {isZero ? "Complete, then verify & lock." : `Complete unlocks at ₹0.00 difference (now ${formatMoney(difference)})`}
                </p>
              </div>
            </div>
            {rec.notes && <p className="px-1 text-xs text-muted-foreground">{rec.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationWorkspacePage;
