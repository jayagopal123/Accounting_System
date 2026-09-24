import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Boxes, Play, TrendingDown } from "lucide-react";
import { assetService } from "@/api/services/assetService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { CountUp } from "@/components/feedback/CountUp";
import { formatMoney } from "@/lib/formatMoney";

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [running, setRunning] = useState(false);

  const { data: summary } = useQuery({ queryKey: queryKeys.assets.summary, queryFn: assetService.getAssetSummary });
  const { data: depSummary } = useQuery({ queryKey: queryKeys.assets.depreciationSummary, queryFn: assetService.getDepreciationSummary });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.assets.list({}),
    queryFn: () => assetService.getAssets({ limit: 100 }),
  });

  const runBulk = async () => {
    setRunning(true);
    try {
      // POST /assets/depreciation/bulk — payload assumed empty (⚠ VERIFY, isolated in assetService)
      await assetService.runBulkDepreciation();
      invalidate.onAssetChange();
      toast.success("Bulk depreciation posted to the ledger.");
      setBulkOpen(false);
    } finally {
      setRunning(false);
    }
  };

  const cards = [
    { label: "Total Assets", value: summary?.totalAssets ?? 0, money: false },
    { label: "Total Cost", value: summary?.totalCost ?? 0, money: true },
    { label: "Accum. Depreciation", value: summary?.totalAccumulatedDepreciation ?? 0, money: true },
    { label: "Net Book Value", value: summary?.netBookValue ?? 0, money: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fixed Assets"
        description="Capitalised assets with ledger-fed depreciation and disposal."
        actions={
          <div className="flex gap-2">
            <button onClick={() => setBulkOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted">
              <Play className="h-3.5 w-3.5" /> Bulk Depreciation
            </button>
            <button onClick={() => navigate("/assets/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
              <Plus className="h-4 w-4" /> New Asset
            </button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-xl font-bold font-mono-numbers">
              {c.money ? <CountUp value={c.value} isCurrency /> : <CountUp value={c.value} />}
            </p>
          </div>
        ))}
      </div>
      {depSummary && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingDown className="h-3.5 w-3.5" />
          Last depreciation run {depSummary.lastRunDate ? new Date(depSummary.lastRunDate).toLocaleDateString("en-IN") : "—"} ·
          next scheduled {depSummary.nextRunDate ? new Date(depSummary.nextRunDate).toLocaleDateString("en-IN") : "—"} ·
          est. {formatMoney(depSummary.estimatedMonthlyDepreciation)}/month
        </p>
      )}

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data?.items ?? []).length === 0 ? (
        <EmptyState title="No assets" description="Register your first capital asset." icon={<Boxes className="h-7 w-7 stroke-[1.5]" />} action={{ label: "New Asset", onClick: () => navigate("/assets/new") }} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Net Book Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(data?.items ?? []).map((a) => (
                <tr key={a._id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/assets/${a._id}`)}>
                  <td className="px-4 py-3 font-mono-numbers text-xs font-semibold text-primary">{a.assetCode}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{a.assetName}</p>
                    <p className="text-[10px] text-muted-foreground">{a.location || a.assignedTo}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{typeof a.category === "object" ? a.category?.categoryName : "—"}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs">{formatMoney(a.purchaseCost)}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs font-semibold">{formatMoney(a.currentValue ?? 0)}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Run bulk depreciation?"
        description="Depreciation will be calculated and posted for all eligible active assets. Ledger entries are created."
        consequenceText="This posts journal entries to the General Ledger and refreshes asset balances. It cannot be undone from the UI."
        confirmLabel="Run Depreciation"
        destructive
        onConfirm={runBulk}
        isLoading={running}
      />
    </div>
  );
};

export default AssetsPage;
