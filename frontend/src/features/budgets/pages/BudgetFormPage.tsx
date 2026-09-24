import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { budgetService } from "@/api/services/budgetService";
import { accountService } from "@/api/services/accountService";
import { settingsService } from "@/api/services/settingsService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { MoneyInput } from "@/components/fields/MoneyInput";

export const BudgetFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: queryKeys.budgets.detail(id ?? ""),
    queryFn: () => budgetService.getBudgetById(id!),
    enabled: isEdit,
  });
  const { data: accounts } = useQuery({ queryKey: queryKeys.accounts.list(), queryFn: accountService.getAccounts });
  const { data: fiscalYears } = useQuery({ queryKey: queryKeys.fiscalYears.list(), queryFn: settingsService.getFiscalYears });

  const [values, setValues] = useState({
    name: "", fiscalYear: "", account: "", budgetAmount: 0, remarks: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Hydrate the form once when the fetched record arrives (render-adjust pattern — no effect needed).
  if (existing && hydratedId !== existing._id) {
    setHydratedId(existing._id);
    setValues({
      name: existing.name,
      fiscalYear: existing.fiscalYear,
      account: typeof existing.account === "object" ? existing.account?._id ?? "" : existing.account,
      budgetAmount: existing.budgetAmount,
      remarks: existing.remarks ?? "",
    });
  }

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = "Required.";
    if (!values.fiscalYear) e.fiscalYear = "Select a fiscal year.";
    if (!values.account) e.account = "Select an account.";
    if (values.budgetAmount <= 0) e.budgetAmount = "Must be > 0.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        fiscalYear: values.fiscalYear,
        account: values.account,
        budgetAmount: values.budgetAmount,
        remarks: values.remarks || undefined,
      };
      if (isEdit) {
        await budgetService.updateBudget(id!, payload);
        invalidate.onBudgetChange(id);
        toast.success("Budget updated.");
      } else {
        await budgetService.createBudget(payload);
        invalidate.onBudgetChange();
        toast.success("Budget created as Draft.");
      }
      navigate("/budgets");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResourceFormPage
      title={isEdit ? "Edit Budget" : "New Budget"}
      description="Target per ledger account — feeds Budget vs Actual."
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo="/budgets"
      submitLabel={isEdit ? "Update" : "Create Budget"}
    >
      {() => (
        <FormSection title="Budget">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" required error={errors.name} className="sm:col-span-2">
              <input type="text" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} placeholder="Engineering & Cloud Infrastructure FY26-27" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Fiscal Year" required error={errors.fiscalYear}>
              <select value={values.fiscalYear} onChange={(e) => setValues((v) => ({ ...v, fiscalYear: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select…</option>
                {(fiscalYears ?? []).map((fy) => (
                  <option key={fy._id} value={fy.name}>{fy.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Ledger Account" required error={errors.account}>
              <EntityCombobox
                options={(accounts ?? []).filter((a) => !a.isGroup).map((a) => ({ value: a._id, label: `${a.accountCode} — ${a.accountName}`, subtitle: a.accountType }))}
                value={values.account}
                onChange={(v) => setValues((vals) => ({ ...vals, account: v }))}
                placeholder="Select account…"
              />
            </Field>
            <Field label="Budget Amount (₹)" required error={errors.budgetAmount}>
              <MoneyInput value={values.budgetAmount} onChange={(v) => setValues((vals) => ({ ...vals, budgetAmount: v }))} />
            </Field>
            <Field label="Remarks">
              <input type="text" value={values.remarks} onChange={(e) => setValues((v) => ({ ...v, remarks: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
          </div>
        </FormSection>
      )}
    </ResourceFormPage>
  );
};

export default BudgetFormPage;
