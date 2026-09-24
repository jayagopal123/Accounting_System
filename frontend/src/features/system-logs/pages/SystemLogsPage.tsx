import React, { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Shield, Search } from "lucide-react";
import { systemLogService, type SystemLogItem } from "@/api/services/systemLogService";
import { queryKeys } from "@/api/queryKeys";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  Created: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Submitted: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Updated: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
  Deleted: "bg-red-500/10 text-red-700 dark:text-red-400",
  Activated: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Blocked: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export const SystemLogsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.systemLogs.list({ search, page }),
    queryFn: () => systemLogService.getLogs({ page, limit: 15, search: search || undefined }),
    placeholderData: keepPreviousData,
    enabled: false, // permissions enforced at route level; queries fire on demand
  });

  // fire query on mount too
  React.useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = (q: string) => {
    const p = new URLSearchParams(searchParams);
    if (q) p.set("q", q);
    else p.delete("q");
    p.delete("page");
    setSearchParams(p);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Logs"
        description="Audit trail of all mutations performed in the ledger."
        badge={
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Shield className="h-3 w-3" /> audit_logs:view
          </span>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch(searchInput)}
          placeholder="Search by action, entity or performer…"
          className="w-full rounded-xl border border-input bg-card py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : (data?.items ?? []).length === 0 ? (
        <EmptyState title="No log entries" description="Audit entries appear here as users mutate records." icon={<Shield className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 w-8" />
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Performed by</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {(data?.items ?? []).map((log: SystemLogItem) => (
                <React.Fragment key={log._id}>
                  <tr
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                  >
                    <td className="px-4 py-3">
                      {expanded === log._id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-lg px-2 py-0.5 text-[10px] font-semibold", ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground")}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-medium text-foreground">{log.entity}</span>
                      <span className="ml-1.5 font-mono-numbers text-muted-foreground">{log.entityName}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{log.performedByName}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</td>
                  </tr>
                  {expanded === log._id && (
                    <tr className="bg-muted/20">
                      <td />
                      <td colSpan={4} className="px-4 pb-4 pt-1 text-xs text-muted-foreground">
                        {log.description}
                        {log.ipAddress && <span className="ml-3 font-mono-numbers">IP: {log.ipAddress}</span>}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(data?.totalPages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-muted-foreground">Page</span>
          <span className="font-mono-numbers font-semibold">{page}</span>
          <span className="text-muted-foreground">of</span>
          <span className="font-mono-numbers">{data?.totalPages}</span>
        </div>
      )}
    </div>
  );
};

export default SystemLogsPage;
