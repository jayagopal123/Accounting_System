import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { taxService, type TaxGroupLine } from "@/api/services/taxService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { formatMoney } from "@/lib/formatMoney";

export const TaxGroupFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: queryKeys.taxGroups.detail(id ?? ""),
    queryFn: () => taxService.getTaxGroupById(id!),
    enabled: isEdit,
  });
  const { data: taxRates } = useQuery({ queryKey: queryKeys.taxRates.active, queryFn: taxService.getActiveTaxRates });

  const [values, setValues] = useState({
    name: "", code: "", isActive: true,
    taxes: [] as TaxGroupLine[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Hydrate the form once when the fetched record arrives (render-adjust pattern — no effect needed).
  if (existing && hydratedId !== existing._id) {
    setHydratedId(existing._id);
    setValues({
      name: existing.name,
      code: existing.code,
      isActive: existing.isActive,
      taxes: existing.taxes ?? [],
    });
  }

  const totalRate = values.taxes.reduce((s, t) => s + (Number(t.rate) || 0), 0);

  const setLine = (idx: number, patch: Partial<TaxGroupLine>) =>
    setValues((v) => ({ ...v, taxes: v.taxes.map((t, i) => (i === idx ? { ...t, ...patch } : t)) }));

  const addLine = () => setValues((v) => ({ ...v, taxes: [...v.taxes, { taxRate: "", rate: 0 }] }));

  const removeLine = (idx: number) =>
    setValues((v) => ({ ...v, taxes: v.taxes.filter((_, i) => i !== idx) }));

  // Sample preview on ₹10,000
  const previewSubtotal = 10000;
  const previewTax = Math.round(((previewSubtotal * totalRate) / 100) * 100) / 100;

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = "Required.";
    if (!values.code.trim()) e.code = "Required.";
    if (values.taxes.length === 0) e.taxes = "Add at least one tax line.";
    if (values.taxes.some((t) => !t.taxRate || (typeof t.taxRate === "object" ? !t.taxRate._id : true))) e.taxes = "Every line needs a tax rate.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        code: values.code,
        isActive: values.isActive,
        taxes: values.taxes,
        totalRate,
      };
      if (isEdit) {
        await taxService.updateTaxGroup(id!, payload);
        toast.success("Tax group updated.");
      } else {
        await taxService.createTaxGroup(payload);
        toast.success("Tax group created.");
      }
      invalidate.onTaxChange();
      navigate("/tax-groups");
    } finally {
      setSubmitting(false);
    }
  };

  const rateOptions = (taxRates ?? []).map((r) => ({ value: r._id, label: r.name, subtitle: `${r.rate}%` }));

  return (
    <ResourceFormPage
      title={isEdit ? "Edit Tax Group" : "New Tax Group"}
      description="Composite combination — powers the Tax Group select on documents."
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo="/tax-groups"
      submitLabel={isEdit ? "Update" : "Create"}
    >
      {() => (
        <>
          <FormSection title="Group">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Code" required error={errors.code}>
                <input type="text" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value.toUpperCase() }))} placeholder="TG-GST18" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Name" required error={errors.name} className="sm:col-span-2">
                <input type="text" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} placeholder="Intra-State GST 18% (CGST 9% + SGST 9%)" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
            </div>
          </FormSection>

          <FormSection title={`Tax Lines (total ${totalRate}%)`} description="Pick component rates; the total is the sum of line rates.">
            <div className="space-y-2">
              {values.taxes.map((line, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    <EntityCombobox
                      options={rateOptions}
                      value={typeof line.taxRate === "object" ? line.taxRate?._id ?? "" : line.taxRate ?? ""}
                      onChange={(v) => {
                        const rate = (taxRates ?? []).find((r) => r._id === v);
                        setLine(idx, { taxRate: v, rate: rate?.rate ?? 0 });
                      }}
                      placeholder="Select tax rate…"
                    />
                  </div>
                  <input
                    type="number" min={0} max={100} step="0.01"
                    value={line.rate || ""}
                    onChange={(e) => setLine(idx, { rate: Number(e.target.value) })}
                    className="w-24 rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="%"
                  />
                  <button type="button" onClick={() => removeLine(idx)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {errors.taxes && <p className="text-xs font-medium text-destructive">{errors.taxes}</p>}
              <button type="button" onClick={addLine} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Plus className="h-3.5 w-3.5" /> Add Tax Line
              </button>
            </div>

            {/* Live preview */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs">
              <p className="font-semibold text-foreground">Preview on {formatMoney(previewSubtotal)}</p>
              <p className="mt-1 font-mono-numbers text-muted-foreground">
                Tax: {formatMoney(previewTax)} · Grand Total: {formatMoney(previewSubtotal + previewTax)}
              </p>
            </div>
          </FormSection>
        </>
      )}
    </ResourceFormPage>
  );
};

export default TaxGroupFormPage;
