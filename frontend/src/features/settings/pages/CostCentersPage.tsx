import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Boxes } from "lucide-react";
import { settingsService } from "@/api/services/settingsService";
import { queryKeys } from "@/api/queryKeys";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/form/Field";

export const CostCentersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [values, setValues] = useState({ code: "", name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.costCenters.list(),
    queryFn: settingsService.getCostCenters,
  });

  const create = async () => {
    if (!values.code.trim() || !values.name.trim()) {
      toast.error("Code and name are required.");
      return;
    }
    setSaving(true);
    try {
      await settingsService.createCostCenter(values);
      queryClient.invalidateQueries({ queryKey: queryKeys.costCenters.all });
      toast.success("Cost center created.");
      setCreateOpen(false);
      setValues({ code: "", name: "", description: "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost Centers"
        description="Organisational units for expense allocation."
        actions={
          <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Cost Center
          </button>
        }
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No cost centers" description="Create units like Engineering, Sales, or Administration." icon={<Boxes className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((cc) => (
            <div key={cc._id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="rounded-lg bg-muted px-2 py-0.5 font-mono-numbers text-xs font-bold text-foreground">{cc.code}</span>
                <StatusBadge status={cc.isActive ? "Active" : "Inactive"} />
              </div>
              <p className="mt-2 text-sm font-semibold">{cc.name}</p>
              {cc.description && <p className="mt-0.5 text-xs text-muted-foreground">{cc.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Cost Center</DialogTitle>
            <DialogDescription>A short code and a display name.</DialogDescription>
          </DialogHeader>
          <Field label="Code" required>
            <input type="text" value={values.code} onChange={(e) => setValues((v) => ({ ...v, code: e.target.value.toUpperCase() }))} placeholder="CC-ENG" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Name" required>
            <input type="text" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} placeholder="Engineering & R&D" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Description">
            <input type="text" value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <DialogFooter>
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="button" disabled={saving} onClick={create} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Creating…" : "Create"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostCentersPage;
