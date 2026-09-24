import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { accountService, type AccountType } from "@/api/services/accountService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { Switch } from "@/components/ui/switch";

const ACCOUNT_TYPES: { value: AccountType; label: string; hint: string }[] = [
  { value: "ASSET", label: "Asset", hint: "What the business owns" },
  { value: "LIABILITY", label: "Liability", hint: "What the business owes" },
  { value: "EQUITY", label: "Equity", hint: "Owner's stake" },
  { value: "INCOME", label: "Income", hint: "Revenue earned" },
  { value: "EXPENSE", label: "Expense", hint: "Costs incurred" },
];

interface AccountFormValues {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentAccount: string;
  isGroup: boolean;
}

export const AccountFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: queryKeys.accounts.detail(id ?? ""),
    queryFn: () => accountService.getAccountById(id!),
    enabled: isEdit,
  });
  const { data: allAccounts } = useQuery({
    queryKey: queryKeys.accounts.list(),
    queryFn: accountService.getAccounts,
  });
  const { data: nextCode } = useQuery({
    queryKey: queryKeys.accounts.nextCode,
    queryFn: accountService.getNextAccountCode,
    enabled: !isEdit, // prefill code from GET /accounts/next-code (⚠ VERIFY params)
  });

  const [values, setValues] = useState<AccountFormValues>({
    accountCode: "",
    accountName: "",
    accountType: "ASSET",
    parentAccount: "",
    isGroup: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit && nextCode && !values.accountCode) {
      setValues((v) => ({ ...v, accountCode: nextCode }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCode, isEdit]);

  useEffect(() => {
    if (existing) {
      setValues({
        accountCode: existing.accountCode,
        accountName: existing.accountName,
        accountType: existing.accountType,
        parentAccount: typeof existing.parentAccount === "object" ? existing.parentAccount?._id ?? "" : existing.parentAccount ?? "",
        isGroup: existing.isGroup,
      });
    }
  }, [existing]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!values.accountCode.trim()) e.accountCode = "Account code is required.";
    if (!values.accountName.trim()) e.accountName = "Account name is required.";
    if (!values.accountType) e.accountType = "Select an account type.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (vals: AccountFormValues) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        accountCode: vals.accountCode,
        accountName: vals.accountName,
        accountType: vals.accountType,
        parentAccount: vals.parentAccount || null,
        isGroup: vals.isGroup,
      };
      if (isEdit) {
        await accountService.updateAccount(id!, payload);
        invalidate.onAccountChange(id);
        toast.success("Account updated.");
      } else {
        const created = await accountService.createAccount(payload);
        invalidate.onAccountChange(created._id);
        toast.success("Account created.");
      }
      navigate("/accounts");
    } finally {
      setSubmitting(false);
    }
  };

  const parentOptions = (allAccounts ?? [])
    .filter((a) => a.isGroup && a._id !== id)
    .map((a) => ({ value: a._id, label: `${a.accountCode} — ${a.accountName}` }));

  return (
    <ResourceFormPage
      title={isEdit ? "Edit Account" : "New Account"}
      description="Chart of Accounts entry — groups organise, leaves carry balances."
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo="/accounts"
      submitLabel={isEdit ? "Update Account" : "Create Account"}
    >
      {() => (
        <>
          <FormSection title="Identification">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Account Code" required error={errors.accountCode} hint={!isEdit && nextCode ? `Suggested next code: ${nextCode}` : undefined}>
                <input
                  type="text"
                  value={values.accountCode}
                  onChange={(e) => setValues((v) => ({ ...v, accountCode: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
              <Field label="Account Name" required error={errors.accountName}>
                <input
                  type="text"
                  value={values.accountName}
                  onChange={(e) => setValues((v) => ({ ...v, accountName: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Classification">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              {ACCOUNT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, accountType: t.value }))}
                  className={
                    values.accountType === t.value
                      ? "rounded-xl border-2 border-primary bg-primary/10 p-3 text-left"
                      : "rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40"
                  }
                >
                  <span className="block text-xs font-semibold text-foreground">{t.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{t.hint}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Parent Group" hint="Optional — nest under a group account">
                <EntityCombobox
                  options={parentOptions}
                  value={values.parentAccount}
                  onChange={(v) => setValues((vals) => ({ ...vals, parentAccount: v }))}
                  placeholder="Top-level account"
                />
              </Field>
              <Field label="Account Kind">
                <div className="flex items-center gap-3 rounded-xl border border-input bg-card px-3.5 py-2.5">
                  <Switch checked={values.isGroup} onCheckedChange={(c) => setValues((v) => ({ ...v, isGroup: c }))} />
                  <span className="text-xs font-medium">{values.isGroup ? "Group (header only)" : "Leaf (can be posted to)"}</span>
                </div>
              </Field>
            </div>
          </FormSection>
        </>
      )}
    </ResourceFormPage>
  );
};

export default AccountFormPage;
