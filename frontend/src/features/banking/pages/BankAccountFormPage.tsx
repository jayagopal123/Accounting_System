import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { bankingService } from "@/api/services/bankingService";
import { accountService } from "@/api/services/accountService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { MoneyInput } from "@/components/fields/MoneyInput";

export const BankAccountFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: queryKeys.bankAccounts.detail(id ?? ""),
    queryFn: () => bankingService.getBankAccountById(id!),
    enabled: isEdit,
  });
  const { data: accounts } = useQuery({ queryKey: queryKeys.accounts.list(), queryFn: accountService.getAccounts });

  const [values, setValues] = useState({
    accountName: "", bankName: "", accountNumber: "", branch: "", ifscCode: "",
    glAccount: "", currentBalance: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Hydrate the form once when the fetched record arrives (render-adjust pattern — no effect needed).
  if (existing && hydratedId !== existing._id) {
    setHydratedId(existing._id);
    setValues({
      accountName: existing.accountName,
      bankName: existing.bankName,
      accountNumber: existing.accountNumber,
      branch: existing.branch ?? "",
      ifscCode: existing.ifscCode ?? "",
      glAccount: typeof existing.glAccount === "object" ? existing.glAccount?._id ?? "" : existing.glAccount ?? "",
      currentBalance: existing.currentBalance ?? 0,
    });
  }

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!values.accountName.trim()) e.accountName = "Required.";
    if (!values.bankName.trim()) e.bankName = "Required.";
    if (!values.accountNumber.trim()) e.accountNumber = "Required.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const payload = {
        accountName: values.accountName,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        branch: values.branch || undefined,
        ifscCode: values.ifscCode || undefined,
        glAccount: values.glAccount || undefined,
        currentBalance: values.currentBalance,
      };
      if (isEdit) {
        await bankingService.updateBankAccount(id!, payload);
        invalidate.onBankTransactionChange();
        toast.success("Bank account updated.");
      } else {
        await bankingService.createBankAccount(payload);
        invalidate.onBankTransactionChange();
        toast.success("Bank account created.");
      }
      navigate("/bank-accounts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResourceFormPage
      title={isEdit ? "Edit Bank Account" : "New Bank Account"}
      description="Maps a real bank account to a GL ledger account."
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo="/bank-accounts"
      submitLabel={isEdit ? "Update" : "Create"}
    >
      {() => (
        <FormSection title="Bank Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Account Name" required error={errors.accountName}>
              <input type="text" value={values.accountName} onChange={(ev) => setValues((v) => ({ ...v, accountName: ev.target.value }))} placeholder="HDFC Current Account" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Bank Name" required error={errors.bankName}>
              <input type="text" value={values.bankName} onChange={(ev) => setValues((v) => ({ ...v, bankName: ev.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Account Number" required error={errors.accountNumber}>
              <input type="text" value={values.accountNumber} onChange={(ev) => setValues((v) => ({ ...v, accountNumber: ev.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Branch">
              <input type="text" value={values.branch} onChange={(ev) => setValues((v) => ({ ...v, branch: ev.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="IFSC Code">
              <input type="text" value={values.ifscCode} onChange={(ev) => setValues((v) => ({ ...v, ifscCode: ev.target.value.toUpperCase() }))} maxLength={11} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Opening / Current Balance (₹)">
              <MoneyInput value={values.currentBalance} onChange={(v) => setValues((vals) => ({ ...vals, currentBalance: v }))} />
            </Field>
            <Field label="GL Ledger Account" required className="sm:col-span-2" hint="Postings reconcile against this account">
              <EntityCombobox
                options={(accounts ?? []).filter((a) => !a.isGroup).map((a) => ({ value: a._id, label: `${a.accountCode} — ${a.accountName}`, subtitle: a.accountType }))}
                value={values.glAccount}
                onChange={(v) => setValues((vals) => ({ ...vals, glAccount: v }))}
                placeholder="Select GL account…"
              />
            </Field>
          </div>
        </FormSection>
      )}
    </ResourceFormPage>
  );
};

export default BankAccountFormPage;
