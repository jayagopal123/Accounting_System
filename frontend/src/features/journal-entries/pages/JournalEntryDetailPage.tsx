import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { journalEntryService, type JournalEntryItem } from "@/api/services/journalEntryService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { LifecycleToolbar } from "@/components/document/LifecycleToolbar";
import { RouteFallback } from "@/app/guards";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

export const JournalEntryDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.journalEntries.detail(id ?? ""),
    queryFn: () => journalEntryService.getJournalEntryById(id!),
    enabled: !!id,
  });

  if (isLoading) return <RouteFallback />;
  if (error || !data) {
    return <ErrorState title="Journal entry not found" message={(error as Error)?.message} onRetry={() => refetch()} />;
  }

  const je = data as JournalEntryItem;
  const doAction = async (actionId: string, nextStatus: string) => {
    try {
      if (actionId === "submit") await journalEntryService.submitJournalEntry(je._id);
      else if (actionId === "cancel") await journalEntryService.cancelJournalEntry(je._id);
      invalidate.onJournalEntryChange(je._id);
      toast.success(`Journal entry ${actionId === "submit" ? "posted" : "cancelled"} — status ${nextStatus}.`);
    } catch (err: any) {
      toast.error(err?.message || "Action failed.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Journal Entry ${je.entryNumber}`}
        description={`${je.referenceType}${je.referenceNumber ? ` · ${je.referenceNumber}` : ""} · ${formatDate(je.entryDate || je.createdAt)}`}
        badge={<StatusBadge status={je.status} />}
        backButton={
          <button onClick={() => navigate("/journal-entries")} className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted">
            ←
          </button>
        }
        actions={
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted">
            🖨 Print / PDF
          </button>
        }
      />

      <LifecycleToolbar
        entityType="document"
        currentStatus={je.status}
        onAction={doAction}
        canEdit={je.status === "Draft"}
        onEdit={() => navigate(`/journal-entries/${je._id}/edit`)}
        editPermission="journal_entries:update"
      />

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm print-page">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Debit</th>
              <th className="px-4 py-3 text-right">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {je.items.map((l, i) => {
              const acc = typeof l.account === "object" ? l.account : null;
              return (
                <tr key={l._id ?? i}>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-mono-numbers text-muted-foreground">{acc?.accountCode}</span>
                    <span className="ml-2 font-medium text-foreground">{acc?.accountName ?? (typeof l.account === "string" ? l.account : "—")}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.description || "—"}</td>
                  <td className={cn("px-4 py-3 text-right font-mono-numbers text-xs", l.debit ? "font-semibold" : "text-muted-foreground")}>
                    {l.debit ? formatMoney(l.debit) : "—"}
                  </td>
                  <td className={cn("px-4 py-3 text-right font-mono-numbers text-xs", l.credit ? "font-semibold" : "text-muted-foreground")}>
                    {l.credit ? formatMoney(l.credit) : "—"}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-muted/30 font-semibold">
              <td className="px-4 py-3 text-xs uppercase tracking-wider" colSpan={2}>Totals</td>
              <td className="px-4 py-3 text-right font-mono-numbers text-xs">{formatMoney(je.totalDebit)}</td>
              <td className="px-4 py-3 text-right font-mono-numbers text-xs">{formatMoney(je.totalCredit)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {je.remarks && (
        <div className="rounded-2xl border border-border/80 bg-card p-5 text-xs text-muted-foreground shadow-sm">
          <span className="font-semibold uppercase tracking-wider text-foreground">Remarks: </span>
          {je.remarks}
        </div>
      )}
    </div>
  );
};

export default JournalEntryDetailPage;
