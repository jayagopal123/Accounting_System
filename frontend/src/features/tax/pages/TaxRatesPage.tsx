import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Percent, Pencil } from "lucide-react";
import { taxService, type TaxRateItem } from "@/api/services/taxService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { usePermission } from "@/lib/PermissionGate";

export const TaxRatesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const canCreate = usePermission("tax_rates:create");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.taxRates.list(),
    queryFn: taxService.getTaxRates,
  });

  const toggle = async (tr: TaxRateItem) => {
    await taxService.updateTaxRate(tr._id, { isActive: !tr.isActive });
    invalidate.onTaxChange();
    toast.success(`Tax rate ${tr.isActive ? "deactivated" : "activated"}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Rates"
        description="Component GST rates — combined into Tax Groups applied on documents."
        actions={canCreate ? (
          <button onClick={() => navigate("/tax-rates/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Tax Rate
          </button>
        ) : undefined}
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No tax rates" description="Add component rates like CGST 9% or GST 18%." icon={<Percent className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right">Rate %</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(data ?? []).map((tr) => (
                <tr key={tr._id} className="group hover:bg-muted/40">
                  <td className="px-4 py-3 font-mono-numbers text-xs font-semibold text-primary">{tr.code}</td>
                  <td className="px-4 py-3 text-xs font-medium">{tr.name}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs font-semibold">{tr.rate}%</td>
                  <td className="px-4 py-3"><StatusBadge status={tr.isActive ? "Active" : "Inactive"} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => navigate(`/tax-rates/${tr._id}/edit`)} title="Edit" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => toggle(tr)} className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold hover:bg-muted">
                        {tr.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaxRatesPage;
