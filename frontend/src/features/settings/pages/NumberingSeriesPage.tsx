import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Hash, Pencil } from "lucide-react";
import { settingsService, type NumberingSeriesItem } from "@/api/services/settingsService";
import { queryKeys } from "@/api/queryKeys";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

export const NumberingSeriesPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.numberingSeries.list(),
    queryFn: settingsService.getNumberingSeries,
  });

  const preview = (s: NumberingSeriesItem) =>
    `${s.prefix}${String(s.nextNumber).padStart(s.padding, "0")}${s.suffix ?? ""}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Numbering Series"
        description="Document number formats — document forms preview the next number from here."
        actions={
          <button onClick={() => navigate("/settings/numbering-series/new")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary">
            <Plus className="h-4 w-4" /> New Series
          </button>
        }
      />

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState title="No series defined" description="Define numbering per document type (SalesInvoice, JournalEntry…)." icon={<Hash className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Document Type</th>
                <th className="px-4 py-3">Prefix</th>
                <th className="px-4 py-3 text-right">Padding</th>
                <th className="px-4 py-3 text-right">Next #</th>
                <th className="px-4 py-3">Live Preview</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(data ?? []).map((s) => (
                <tr key={s._id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 text-xs font-semibold">{s.documentType}</td>
                  <td className="px-4 py-3 font-mono-numbers text-xs">{s.prefix}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs">{s.padding}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs">{s.nextNumber}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono-numbers text-xs font-bold text-primary">
                      {preview(s)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => navigate(`/settings/numbering-series/${s._id}/edit`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
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

export default NumberingSeriesPage;
