import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { settingsService } from "@/api/services/settingsService";
import { createInvalidator } from "@/api/invalidation";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";

const DOC_TYPE_OPTIONS = [
  "SalesInvoice", "PurchaseInvoice", "CreditNote", "DebitNote",
  "JournalEntry", "Payment", "Asset",
];

export const NumberingSeriesFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ["numberingSeries", "detail", id ?? ""],
    queryFn: async () => {
      const all = await settingsService.getNumberingSeries();
      return all.find((s) => s._id === id) ?? null;
    },
    enabled: isEdit,
  });

  const [values, setValues] = useState({
    documentType: "SalesInvoice", prefix: "INV-", padding: 4, nextNumber: 1, suffix: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Hydrate the form once when the fetched record arrives (render-adjust pattern — no effect needed).
  if (existing && hydratedId !== existing._id) {
    setHydratedId(existing._id);
    setValues({
      documentType: existing.documentType,
      prefix: existing.prefix,
      padding: existing.padding,
      nextNumber: existing.nextNumber,
      suffix: existing.suffix ?? "",
    });
  }

  const preview = `${values.prefix}${String(values.nextNumber).padStart(Math.min(values.padding, 12), "0")}${values.suffix}`;

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!values.prefix) e.prefix = "Required.";
    if (values.padding < 1 || values.padding > 12) e.padding = "1–12.";
    if (values.nextNumber < 1) e.nextNumber = "Must be ≥ 1.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const payload = { ...values, suffix: values.suffix || undefined };
      if (isEdit) {
        await settingsService.updateNumberingSeries(id!, payload);
        toast.success("Series updated.");
      } else {
        await settingsService.createNumberingSeries(payload);
        toast.success("Series created.");
      }
      invalidate.onNumberingSeriesChange();
      navigate("/settings/numbering-series");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResourceFormPage
      title={isEdit ? "Edit Numbering Series" : "New Numbering Series"}
      description="Document forms show this as the next-number hint."
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo="/settings/numbering-series"
      submitLabel={isEdit ? "Update" : "Create"}
    >
      {() => (
        <>
          <FormSection title="Series">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Document Type" required>
                <select
                  value={values.documentType}
                  onChange={(e) => setValues((v) => ({ ...v, documentType: e.target.value }))}
                  disabled={isEdit}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                >
                  {DOC_TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Prefix" required error={errors.prefix}>
                <input type="text" value={values.prefix} onChange={(e) => setValues((v) => ({ ...v, prefix: e.target.value }))} placeholder="INV-" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Padding" required error={errors.padding} hint="Zero-pad the number, e.g. 4 → 0001">
                <input type="number" min={1} max={12} value={values.padding} onChange={(e) => setValues((v) => ({ ...v, padding: Number(e.target.value) }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Next Number" required error={errors.nextNumber}>
                <input type="number" min={1} value={values.nextNumber} onChange={(e) => setValues((v) => ({ ...v, nextNumber: Number(e.target.value) }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Suffix (optional)">
                <input type="text" value={values.suffix} onChange={(e) => setValues((v) => ({ ...v, suffix: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
            </div>
          </FormSection>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live format preview</p>
            <p className="mt-1 text-2xl font-bold font-mono-numbers text-primary">{preview}</p>
          </div>
        </>
      )}
    </ResourceFormPage>
  );
};

export default NumberingSeriesFormPage;
