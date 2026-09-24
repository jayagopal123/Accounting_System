import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { assetService, DEPRECIATION_METHODS, type DepreciationMethod } from "@/api/services/assetService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { MoneyInput } from "@/components/fields/MoneyInput";

export const AssetFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const { data: existing } = useQuery({
    queryKey: queryKeys.assets.detail(id ?? ""),
    queryFn: () => assetService.getAssetById(id!),
    enabled: isEdit,
  });
  const { data: categories } = useQuery({ queryKey: queryKeys.assetCategories.list(), queryFn: assetService.getCategories });

  const [values, setValues] = useState({
    assetCode: "", assetName: "", category: "", purchaseDate: new Date().toISOString().slice(0, 10),
    purchaseCost: 0, salvageValue: 0, usefulLife: 36,    depreciationMethod: "StraightLine" as DepreciationMethod,
    location: "", assignedTo: "", vendorName: "", invoiceNumber: "", serialNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Hydrate the form once when the fetched record arrives (render-adjust pattern — no effect needed).
  if (existing && hydratedId !== existing._id) {
    setHydratedId(existing._id);
    setValues((v) => ({
      ...v,
      assetCode: existing.assetCode,
      assetName: existing.assetName,
      category: typeof existing.category === "object" ? existing.category?._id ?? "" : existing.category,
      purchaseDate: (existing.purchaseDate ?? "").slice(0, 10),
      purchaseCost: existing.purchaseCost,
      salvageValue: existing.salvageValue ?? 0,
      usefulLife: existing.usefulLife,
      depreciationMethod: existing.depreciationMethod,
      location: existing.location ?? "",
      assignedTo: existing.assignedTo ?? "",
      vendorName: existing.vendorName ?? "",
      invoiceNumber: existing.invoiceNumber ?? "",
      serialNumber: existing.serialNumber ?? "",
    }));
  }

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!values.assetCode.trim()) e.assetCode = "Required.";
    if (!values.assetName.trim()) e.assetName = "Required.";
    if (!values.category) e.category = "Select a category.";
    if (values.purchaseCost <= 0) e.purchaseCost = "Cost must be > 0.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const payload = {
        assetCode: values.assetCode,
        assetName: values.assetName,
        category: values.category,
        purchaseDate: new Date(values.purchaseDate).toISOString(),
        purchaseCost: values.purchaseCost,
        salvageValue: values.salvageValue,
        usefulLife: values.usefulLife,
        // Enum isolated in one constant in assetService (⚠ VERIFY against backend)
        depreciationMethod: values.depreciationMethod,
        location: values.location || undefined,
        assignedTo: values.assignedTo || undefined,
        vendorName: values.vendorName || undefined,
        invoiceNumber: values.invoiceNumber || undefined,
        serialNumber: values.serialNumber || undefined,
      };
      if (isEdit) {
        await assetService.updateAsset(id!, payload);
        invalidate.onAssetChange(id);
        toast.success("Asset updated.");
      } else {
        await assetService.createAsset(payload);
        invalidate.onAssetChange();
        toast.success("Asset created as Draft.");
      }
      navigate("/assets");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResourceFormPage
      title={isEdit ? "Edit Asset" : "New Asset"}
      description="Capitalised item — depreciation posts to the ledger."
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo="/assets"
      submitLabel={isEdit ? "Update" : "Create Asset"}
    >
      {() => (
        <>
          <FormSection title="Identification">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Asset Code" required error={errors.assetCode}>
                <input type="text" value={values.assetCode} onChange={(e) => setValues((v) => ({ ...v, assetCode: e.target.value }))} placeholder="AST-IT-001" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Asset Name" required error={errors.assetName}>
                <input type="text" value={values.assetName} onChange={(e) => setValues((v) => ({ ...v, assetName: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Category" required error={errors.category} hint="Defines default depreciation method & life">
                <EntityCombobox
                  options={(categories ?? []).filter((c) => c.isActive).map((c) => ({
                    value: c._id, label: c.categoryName,
                    subtitle: `${c.depreciationMethod} · ${c.usefulLifeMonths} mo`,
                  }))}
                  value={values.category}
                  onChange={(v) => setValues((vals) => ({ ...vals, category: v }))}
                  placeholder="Select category…"
                />
              </Field>
              <Field label="Status on create" hint="New assets start as Draft; use Activate on the detail page">
                <input type="text" value="Draft" disabled className="w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground" />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Cost & Depreciation">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Purchase Date" required>
                <input type="date" value={values.purchaseDate} onChange={(e) => setValues((v) => ({ ...v, purchaseDate: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Purchase Cost (₹)" required error={errors.purchaseCost}>
                <MoneyInput value={values.purchaseCost} onChange={(v) => setValues((vals) => ({ ...vals, purchaseCost: v }))} />
              </Field>
              <Field label="Salvage Value (₹)">
                <MoneyInput value={values.salvageValue} onChange={(v) => setValues((vals) => ({ ...vals, salvageValue: v }))} />
              </Field>
              <Field label="Useful Life (months)">
                <input type="number" min={1} value={values.usefulLife} onChange={(e) => setValues((v) => ({ ...v, usefulLife: Number(e.target.value) }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Depreciation Method">
                <select value={values.depreciationMethod} onChange={(e) => setValues((v) => ({ ...v, depreciationMethod: e.target.value as DepreciationMethod }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {DEPRECIATION_METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Location & Tracking" defaultOpen={false}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Location"><input type="text" value={values.location} onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Assigned To"><input type="text" value={values.assignedTo} onChange={(e) => setValues((v) => ({ ...v, assignedTo: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Vendor"><input type="text" value={values.vendorName} onChange={(e) => setValues((v) => ({ ...v, vendorName: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Invoice No."><input type="text" value={values.invoiceNumber} onChange={(e) => setValues((v) => ({ ...v, invoiceNumber: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Serial No."><input type="text" value={values.serialNumber} onChange={(e) => setValues((v) => ({ ...v, serialNumber: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
            </div>
          </FormSection>
        </>
      )}
    </ResourceFormPage>
  );
};

export default AssetFormPage;
