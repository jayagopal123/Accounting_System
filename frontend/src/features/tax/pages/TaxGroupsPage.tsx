import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Calculator, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { taxService, type TaxGroupItem } from "@/api/services/taxService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { usePermission } from "@/lib/PermissionGate";

export const TaxGroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const canCreate = usePermission("tax_groups:create");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.taxGroups.list(),
    queryFn: taxService.getTaxGroups,
  });

  const toggle = async (g: TaxGroupItem) => {
    await taxService.updateTaxGroup(g._id, { isActive: !g.isActive });
    invalidate.onTaxChange();
    toast.success(`Tax group ${g.isActive ? "deactivated" : "activated"}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Groups"
        description="Composite GST combinations applied to invoices and bills."
        actions={canCreate ? (
          <button onClick={() => navigate("/tax-groups/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Tax Group
          </button>
        ) : undefined}
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{[...Array(4)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No tax groups" description="Create groups like GST 18% or CGST 9% + SGST 9%." icon={<Calculator className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(data ?? []).map((g) => (
            <motion.div
              key={g._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{g.name}</p>
                  <p className="font-mono-numbers text-[10px] text-muted-foreground">{g.code}</p>
                </div>
                <StatusBadge status={g.isActive ? "Active" : "Inactive"} />
              </div>

              {/* Animated breakdown */}
              <div className="mt-3 space-y-1.5">
                {g.taxes.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">
                      {typeof line.taxRate === "object" ? line.taxRate?.name : "Component"}
                    </span>
                    <span className="font-mono-numbers font-semibold">{line.rate}%</span>
                  </motion.div>
                ))}
                <div className="flex items-center justify-between border-t border-border/60 pt-1.5 text-xs font-bold">
                  <span>Total</span>
                  <motion.span
                    key={g.totalRate}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-mono-numbers text-primary"
                  >
                    {g.totalRate}%
                  </motion.span>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-1.5">
                <button onClick={() => navigate(`/tax-groups/${g._id}/edit`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => toggle(g)} className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold hover:bg-muted">
                  {g.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaxGroupsPage;
