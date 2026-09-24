import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { settingsService } from "@/api/services/settingsService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";

export const FiscalYearFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: queryKeys.fiscalYears.detail(id ?? ""),
    queryFn: () => settingsService.getFiscalYearById(id!),
    enabled: isEdit,
  });

  const [values, setValues] = useState({ name: "", startDate: "", endDate: "", isClosed: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setValues({
        name: existing.name,
        startDate: (existing.startDate ?? "").slice(0, 10),
        endDate: (existing.endDate ?? "").slice(0, 10),
        isClosed: existing.isClosed,
      });
    }
  }, [existing]);

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = "Required.";
    if (!values.startDate) e.startDate = "Required.";
    if (!values.endDate) e.endDate = "Required.";
    if (values.startDate && values.endDate && values.startDate >= values.endDate) {
      e.endDate = "End must be after start.";
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(`${values.endDate}T23:59:59.999Z`).toISOString(),
        isClosed: values.isClosed,
      };
      if (isEdit) {
        await settingsService.updateFiscalYear(id!, payload);
        toast.success("Fiscal year updated.");
      } else {
        await settingsService.createFiscalYear(payload);
        toast.success("Fiscal year created.");
      }
      invalidate.onFiscalYearChange();
      navigate("/settings/fiscal-years");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResourceFormPage
      title={isEdit ? "Edit Fiscal Year" : "New Fiscal Year"}
      description="Indian fiscal years run 1 April – 31 March."
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo="/settings/fiscal-years"
      submitLabel={isEdit ? "Update" : "Create"}
    >
      {() => (
        <FormSection title="Period">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Name" required error={errors.name} hint="e.g. FY 2026-2027">
              <input type="text" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Start Date" required error={errors.startDate} hint="Typically 1 April">
              <input type="date" value={values.startDate} onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="End Date" required error={errors.endDate} hint="Typically 31 March">
              <input type="date" value={values.endDate} onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
          </div>
        </FormSection>
      )}
    </ResourceFormPage>
  );
};

export default FiscalYearFormPage;
