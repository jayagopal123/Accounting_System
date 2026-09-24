import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { bankingService } from "@/api/services/bankingService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { MoneyInput } from "@/components/fields/MoneyInput";
import { cn } from "@/lib/utils";

export const BankTransactionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);

  const [bankAccountId, setBankAccountId] = useState(searchParams.get("bankAccountId") ?? "");
  const [type, setType] = useState<"Deposit" | "Withdrawal">("Deposit");
  const [amount, setAmount] = useState(0);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: bankAccounts } = useQuery({ queryKey: queryKeys.bankAccounts.list(), queryFn: bankingService.getBankAccounts });

  const submit = async () => {
    if (!bankAccountId) return toast.error("Select a bank account.");
    if (amount <= 0) return toast.error("Amount must be greater than zero.");
    setSaving(true);
    try {
      await bankingService.createBankTransaction({
        bankAccount: bankAccountId,
        type,
        amount,
        transactionDate: new Date(transactionDate).toISOString(),
        referenceNumber: referenceNumber || undefined,
        description: description || undefined,
      });
      invalidate.onBankTransactionChange();
      toast.success("Bank transaction recorded.");
      navigate("/bank-transactions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader title="New Bank Transaction" description="Manual entry — statement import is not available on the backend." />

      <FormSection title="Transaction">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Bank Account" required>
            <EntityCombobox
              options={(bankAccounts ?? []).map((b) => ({ value: b._id, label: b.accountName, subtitle: b.bankName }))}
              value={bankAccountId}
              onChange={setBankAccountId}
              placeholder="Select bank account…"
            />
          </Field>
          <Field label="Date" required>
            <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Amount (₹)" required>
            <MoneyInput value={amount} onChange={setAmount} />
          </Field>
          <Field label="Reference No.">
            <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
        </div>

        <div className="flex w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-1">
          {(["Deposit", "Withdrawal"] as const).map((t) => (
            <button
              key={t} type="button" onClick={() => setType(t)}
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                type === t ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </FormSection>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl md:pl-[264px]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2.5">
          <button type="button" onClick={() => navigate("/bank-transactions")} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button type="button" disabled={saving} onClick={submit} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving…" : "Save Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankTransactionFormPage;
