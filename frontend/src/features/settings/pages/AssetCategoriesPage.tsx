import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Layers, Pencil } from "lucide-react";
import { assetService, DEPRECIATION_METHODS, type AssetCategoryItem, type DepreciationMethod } from "@/api/services/assetService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/form/Field";

export const AssetCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const [editing, setEditing] = useState<AssetCategoryItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [values, setValues] = useState({
    categoryName: "", description: "",
    depreciationMethod: "StraightLine" as DepreciationMethod, usefulLifeMonths: 36, isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.assetCategories.list(),
    queryFn: assetService.getCategories,
  });

  const openCreate = () => {
    setEditing(null);
    setValues({ categoryName: "", description: "", depreciationMethod: "StraightLine", usefulLifeMonths: 36, isActive: true });
    setCreateOpen(true);
  };

  const openEdit = (c: AssetCategoryItem) => {
    setEditing(c);
    setValues({
      categoryName: c.categoryName, description: c.description ?? "",
      depreciationMethod: c.depreciationMethod, usefulLifeMonths: c.usefulLifeMonths, isActive: c.isActive,
    });
    setCreateOpen(true);
  };

  const save = async () => {
    if (!values.categoryName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await assetService.updateCategory(editing._id, values);
        toast.success("Category updated.");
      } else {
        await assetService.createCategory(values);
        toast.success("Category created.");
      }
      invalidate.onAssetChange();
      setCreateOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: AssetCategoryItem) => {
    await assetService.toggleCategoryStatus(c._id);
    invalidate.onAssetChange();
    toast.success(`Category ${c.isActive ? "deactivated" : "activated"}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Categories"
        description="Classification driving depreciation method and useful life defaults."
        actions={
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Category
          </button>
        }
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No categories" description="Create categories before registering assets." icon={<Layers className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Useful Life</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(data ?? []).map((c) => (
                <tr key={c._id} className="group hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold">{c.categoryName}</p>
                    <p className="text-[10px] text-muted-foreground">{c.description || "—"}</p>
                  </td>
                  <td className="px-4 py-3 font-mono-numbers text-xs">{c.depreciationMethod}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs">{c.usefulLifeMonths} mo</td>
                  <td className="px-4 py-3"><StatusBadge status={c.isActive ? "Active" : "Inactive"} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggle(c)} className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold hover:bg-muted">
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>Depreciation defaults feed new asset forms.</DialogDescription>
          </DialogHeader>
          <Field label="Category Name" required>
            <input type="text" value={values.categoryName} onChange={(e) => setValues((v) => ({ ...v, categoryName: e.target.value }))} placeholder="Computer & IT Equipment" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Description">
            <input type="text" value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Depreciation Method">
              <select value={values.depreciationMethod} onChange={(e) => setValues((v) => ({ ...v, depreciationMethod: e.target.value as DepreciationMethod }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {DEPRECIATION_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Useful Life (months)">
              <input type="number" min={1} value={values.usefulLifeMonths} onChange={(e) => setValues((v) => ({ ...v, usefulLifeMonths: Number(e.target.value) }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="button" disabled={saving} onClick={save} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetCategoriesPage;
