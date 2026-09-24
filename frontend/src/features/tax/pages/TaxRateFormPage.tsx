import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { taxService } from "@/api/services/taxService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";

export const TaxRateFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: queryKeys.taxRates.detail(id ?? ""),
    queryFn: () => taxService.getTaxRateById(id!),
    enabled: isEdit,
  });

  const [values, setValues] = useState({ name: "", code: "", rate: 0, description: "", isActive: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Hydrate the form once when the fetched record arrives (render-adjust pattern — no effect needed).
  if (existing && hydratedId !== existing._id) {
    setHydratedId(existing._id);
    setValues({
      name: existing.name, code: existing.code, rate: existing.rate,
      description: existing.description ?? "", isActive: existing.isActive,
    });
  }

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = "Required.";
    if (!values.code.trim()) e.code = "Required.";
    if (values.rate < 0 || values.rate > 100) e.rate = "Rate must be 0–100.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await taxService.updateTaxRate(id!, values);
        toast.success("Tax rate updated.");
      } else {
        await taxService.createTaxRate(values);
        toast.success("Tax rate created.");
      }
      invalidate.onTaxChange();
      navigate("/tax-rates");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResourceFormPage
      title={isEdit ? "Edit Tax Rate" : "New Tax Rate"}
      description="A single component rate, e.g. CGST 9% or GST 18%."
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo="/tax-rates"
      submitLabel={isEdit ? "Update" : "Create"}
    >
      {() => (
        <FormSection title="Rate">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Code" required error={errors.code}>
              <input type="text" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value.toUpperCase() }))} placeholder="CGST-9" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Name" required error={errors.name}>
              <input type="text" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} placeholder="CGST 9%" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Rate %" required error={errors.rate}>
              <input type="number" min={0} max={100} step="0.01" value={values.rate || ""} onChange={(e) => setValues((v) => ({ ...v, rate: Number(e.target.value) }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Description" className="sm:col-span-3">
              <input type="text" value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
          </div>
        </FormSection>
      )}
    </ResourceFormPage>
  );
};

export default TaxRateFormPage;
