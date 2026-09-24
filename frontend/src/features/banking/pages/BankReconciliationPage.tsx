import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Wallet } from "lucide-react";
import { bankingService, type BankReconciliationItem } from "@/api/services/bankingService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/form/Field";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { MoneyInput } from "@/components/fields/MoneyInput";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

/** Progress ring SVG: fills as |difference| → 0. */
const ProgressRing: React.FC<{ value: number; size?: number }> = ({ value, size = 44 }) => {
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="5" className="stroke-muted" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="5"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        className={pct >= 1 ? "stroke-emerald-500" : "stroke-amber-500"}
      />
    </svg>
  );
};

export const BankReconciliationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const [createOpen, setCreateOpen] = useState(searchParams.get("new") === "1");

  const [bankAccountId, setBankAccountId] = useState(searchParams.get("bankAccountId") ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: bankAccounts } = useQuery({ queryKey: queryKeys.bankAccounts.list(), queryFn: bankingService.getBankAccounts });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.bankReconciliations.list({ bankAccount: bankAccountId || undefined }),
    queryFn: () => bankingService.getBankReconciliations({ bankAccount: bankAccountId || undefined }),
  });

  const createRec = async () => {
    if (!bankAccountId) return toast.error("Select a bank account.");
    if (!startDate || !endDate) return toast.error("Statement start and end dates are required.");
    setSaving(true);
    try {
      const rec = await bankingService.createBankReconciliation({
        bankAccount: bankAccountId,
        statementStartDate: new Date(startDate).toISOString(),
        statementEndDate: new Date(endDate).toISOString(),
        openingBalance,
        closingBalance,
        clearedBalance: 0,
        difference: closingBalance - openingBalance,
        notes: notes || undefined,
      });
      invalidate.onReconciliationChange(rec._id);
      toast.success("Reconciliation started.");
      setCreateOpen(false);
      navigate(`/bank-reconciliation/${rec._id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Reconciliation"
        description="Match ledger cash against bank statements until the difference is zero."
        actions={
          <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Reconciliation
          </button>
        }
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data?.items ?? []).length === 0 ? (
        <EmptyState title="No reconciliations" description="Start one from a statement period to begin matching." icon={<Wallet className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="space-y-2">
          {(data?.items ?? []).map((rec: BankReconciliationItem) => {
            return (
              <button
                key={rec._id}
                onClick={() => navigate(`/bank-reconciliation/${rec._id}`)}
                className="flex w-full items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <ProgressRing value={1 - Math.min(1, Math.abs(rec.difference) / Math.max(rec.closingBalance, 1))} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {typeof rec.bankAccount === "object" ? rec.bankAccount?.accountName : "Bank Account"}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {formatDate(rec.statementStartDate)} – {formatDate(rec.statementEndDate)}
                    </span>
                  </p>
                  <p className="mt-0.5 font-mono-numbers text-xs text-muted-foreground">
                    Opening {formatMoney(rec.openingBalance)} · Cleared {formatMoney(rec.clearedBalance)} · Closing {formatMoney(rec.closingBalance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("font-mono-numbers text-sm font-bold", Math.abs(rec.difference) < 0.01 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {formatMoney(rec.difference)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Difference</p>
                </div>
                <StatusBadge status={rec.status} />
              </button>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New Reconciliation</DialogTitle>
            <DialogDescription>
              Set the statement period and balances — then match transactions in the workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Bank Account" required className="sm:col-span-2">
              <EntityCombobox
                options={(bankAccounts ?? []).filter((b) => b.isActive).map((b) => ({ value: b._id, label: b.accountName, subtitle: b.bankName }))}
                value={bankAccountId}
                onChange={setBankAccountId}
                placeholder="Select active bank account…"
              />
            </Field>
            <Field label="Statement Start" required>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Statement End" required>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Opening Balance (₹)" required>
              <MoneyInput value={openingBalance} onChange={setOpeningBalance} />
            </Field>
            <Field label="Statement Closing Balance (₹)" required>
              <MoneyInput value={closingBalance} onChange={setClosingBalance} />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="button" disabled={saving} onClick={createRec} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Starting…" : "Start Reconciliation"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankReconciliationPage;
