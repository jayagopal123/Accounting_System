import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Play, Trash2 } from "lucide-react";
import { assetService, type AssetItem } from "@/api/services/assetService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { RouteFallback } from "@/app/guards";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/form/Field";
import { MoneyInput } from "@/components/fields/MoneyInput";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

const STEPS = ["Draft", "Active", "Depreciated"] as const;

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [disposalAmount, setDisposalAmount] = useState(0);
  const [disposalRemarks, setDisposalRemarks] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.assets.detail(id ?? ""),
    queryFn: () => assetService.getAssetById(id!),
    enabled: !!id,
  });

  if (isLoading) return <RouteFallback />;
  if (error || !data) {
    return <ErrorState title="Asset not found" message={(error as Error)?.message} onRetry={() => refetch()} />;
  }

  const asset = data as AssetItem;
  const stepIdx = asset.status === "Draft" ? 0 : asset.status === "Active" ? 1 : 2;

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true);
    try {
      await fn();
      invalidate.onAssetChange(asset._id);
      toast.success(msg);
    } catch (err: any) {
      toast.error(err?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const dispose = async () => {
    await act(
      () => assetService.disposeAsset(asset._id, { disposalAmount, disposalRemarks: disposalRemarks || undefined }),
      "Asset disposed — profit/loss posted to the ledger."
    );
    setDisposeOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${asset.assetCode} — ${asset.assetName}`}
        description={`${typeof asset.category === "object" ? asset.category?.categoryName : "Category"} · ${asset.depreciationMethod} · ${asset.usefulLife} months`}
        badge={<StatusBadge status={asset.status} />}
        backButton={
          <button onClick={() => navigate("/assets")} className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted">
            ←
          </button>
        }
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate(`/assets/${asset._id}/edit`)} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            {asset.status === "Draft" && (
              <button disabled={busy} onClick={() => act(() => assetService.activateAsset(asset._id), "Asset capitalised — initial entry posted.")} className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
                Activate / Capitalize
              </button>
            )}
            {asset.status === "Active" && (
              <>
                <button disabled={busy} onClick={() => act(() => assetService.runDepreciation(asset._id), "Depreciation posted.")} className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20">
                  <Play className="h-3.5 w-3.5" /> Run Depreciation
                </button>
                <button disabled={busy} onClick={() => setDisposeOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20">
                  <Trash2 className="h-3.5 w-3.5" /> Dispose
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Lifecycle stepper */}
      <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className={cn("h-0.5 flex-1", i <= stepIdx ? "bg-primary" : "bg-border")} />}
            <div className="flex flex-col items-center gap-1">
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono-numbers text-[10px] font-bold",
                i < stepIdx ? "border-primary bg-primary text-white" : i === stepIdx ? "border-primary text-primary" : "border-border text-muted-foreground"
              )}>
                {i < stepIdx ? "✓" : i + 1}
              </span>
              <span className={cn("text-[10px] font-medium", i <= stepIdx ? "text-foreground" : "text-muted-foreground")}>{s}</span>
            </div>
          </React.Fragment>
        ))}
        {(asset.status === "Disposed" || asset.status === "Sold" || asset.status === "WrittenOff") && (
          <span className="ml-3"><StatusBadge status={asset.status} /></span>
        )}
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm md:col-span-2">
          <h3 className="text-sm font-semibold font-display">Asset Details</h3>
          <dl className="mt-3 grid grid-cols-2 gap-4 text-xs">
            {([
              ["Purchase Date", formatDate(asset.purchaseDate)],
              ["Purchase Cost", formatMoney(asset.purchaseCost)],
              ["Salvage Value", formatMoney(asset.salvageValue ?? 0)],
              ["Useful Life", `${asset.usefulLife} months`],
              ["Accum. Depreciation", formatMoney(asset.accumulatedDepreciation ?? 0)],
              ["Net Book Value", formatMoney(asset.currentValue ?? 0)],
              ["Location", asset.location || "—"],
              ["Assigned To", asset.assignedTo || "—"],
              ["Vendor", asset.vendorName || "—"],
              ["Invoice No.", asset.invoiceNumber || "—"],
              ["Serial No.", asset.serialNumber || "—"],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-mono-numbers text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Net Book Value</p>
            <p className="mt-1 text-2xl font-bold font-mono-numbers">{formatMoney(asset.currentValue ?? 0)}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, ((asset.currentValue ?? 0) / Math.max(asset.purchaseCost, 1)) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Dispose dialog */}
      <Dialog open={disposeOpen} onOpenChange={setDisposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispose Asset</DialogTitle>
            <DialogDescription>
              Disposal writes down the book value and posts profit/loss to the ledger. This is irreversible.
            </DialogDescription>
          </DialogHeader>
          <Field label="Disposal Amount (₹)" required>
            <MoneyInput value={disposalAmount} onChange={setDisposalAmount} />
          </Field>
          <Field label="Remarks">
            <input type="text" value={disposalRemarks} onChange={(e) => setDisposalRemarks(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDisposeOpen(false)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="button" disabled={busy} onClick={dispose} className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90 disabled:opacity-50">Dispose Asset</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetDetailPage;
