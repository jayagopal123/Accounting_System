import React, { useEffect, useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "../feedback/PageHeader";
import { DataTable } from "./DataTable";
import { EmptyState } from "../feedback/EmptyState";
import { ErrorState } from "../feedback/ErrorState";
import { PermissionGate } from "@/lib/PermissionGate";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface ResourceListPageProps<TData, TValue> {
  title: string;
  description?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onRowClick?: (row: TData) => void;
  newButton?: {
    label: string;
    onClick: () => void;
    permission?: string;
  };
  searchPlaceholder?: string;
  searchFilterKey?: keyof TData | ((item: TData, query: string) => boolean);
  statusFilter?: {
    key: keyof TData;
    options: FilterOption[];
  };
  emptyTitle?: string;
  emptyDescription?: string;
  extraHeaderActions?: React.ReactNode;
  headerBadge?: React.ReactNode;
  /**
   * Server mode: search/filter/pagination live in the URL/backend.
   * Pass control values + callbacks; the component renders controlled inputs
   * and skips client-side filtering entirely.
   */
  serverMode?: {
    search?: string;
    onSearchChange?: (q: string) => void;
    status?: string;
    onStatusChange?: (s: string) => void;
    pageIndex?: number;
    pageSize?: number;
    total?: number;
    onPageChange?: (pageIndex: number) => void;
  };
  toolbar?: React.ReactNode;
}

export function ResourceListPage<TData, TValue>({
  title,
  description,
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  onRowClick,
  newButton,
  searchPlaceholder = "Search by name, code or number...",
  searchFilterKey,
  statusFilter,
  emptyTitle,
  emptyDescription,
  extraHeaderActions,
  headerBadge,
  serverMode,
  toolbar,
}: ResourceListPageProps<TData, TValue>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce for server-mode search (300ms per spec section 13).
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (serverMode?.onSearchChange) {
      serverMode.onSearchChange(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const isServer = !!serverMode;

  const filteredData = useMemo(() => {
    if (isServer) return data;
    let result = data;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (typeof searchFilterKey === "function") {
        result = result.filter((item) => searchFilterKey(item, q));
      } else if (searchFilterKey) {
        result = result.filter((item) => {
          const val = item[searchFilterKey];
          return val ? String(val).toLowerCase().includes(q) : false;
        });
      } else {
        result = result.filter((item) =>
          Object.values(item as any).some((val) =>
            val ? String(val).toLowerCase().includes(q) : false
          )
        );
      }
    }

    if (statusFilter && selectedStatus !== "ALL") {
      result = result.filter((item) => String(item[statusFilter.key]) === selectedStatus);
    }

    return result;
  }, [isServer, data, searchQuery, selectedStatus, searchFilterKey, statusFilter]);

  const effectiveStatus = isServer ? serverMode?.status ?? "ALL" : selectedStatus;
  const onStatusChange = isServer ? serverMode?.onStatusChange : setSelectedStatus;

  if (error) {
    const isForbidden = (error as any)?.status === 403 || (error as any)?.code === "FORBIDDEN";
    return (
      <div className="space-y-6">
        <PageHeader title={title} description={description} />
        <ErrorState
          title={isForbidden ? "Access Denied" : "Failed to load"}
          message={error.message}
          isForbidden={isForbidden}
          onRetry={onRetry}
        />
      </div>
    );
  }

  const newAction = newButton ? (
    <PermissionGate perm={newButton.permission}>
      <button
        type="button"
        onClick={newButton.onClick}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-all glow-primary"
      >
        <Plus className="h-4 w-4" />
        {newButton.label}
      </button>
    </PermissionGate>
  ) : null;

  const statusChips = statusFilter ? (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
      <button
        type="button"
        onClick={() => onStatusChange?.("ALL")}
        className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap",
          effectiveStatus === "ALL"
            ? "bg-primary text-white border-primary glow-primary"
            : "bg-card border-border text-muted-foreground hover:bg-muted"
        )}
      >
        All
      </button>
      {statusFilter.options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onStatusChange?.(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap",
            effectiveStatus === opt.value
              ? "bg-primary text-white border-primary glow-primary"
              : "bg-card border-border text-muted-foreground hover:bg-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        badge={headerBadge}
        actions={
          <div className="flex items-center gap-2.5">
            {extraHeaderActions}
            {newAction}
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-input bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        {statusChips}
        {toolbar}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        onRowClick={onRowClick}
        pageIndex={isServer ? serverMode?.pageIndex ?? 0 : undefined}
        pageSize={isServer ? serverMode?.pageSize ?? 10 : undefined}
        pageCount={isServer ? serverMode?.total !== undefined ? Math.max(Math.ceil(serverMode.total / (serverMode.pageSize ?? 10)), 1) : undefined : undefined}
        total={isServer ? serverMode?.total : undefined}
        onPageChange={isServer ? serverMode?.onPageChange : undefined}
        emptyState={
          <EmptyState
            title={emptyTitle || `No ${title} found`}
            description={
              (isServer ? !!serverMode?.search : !!searchQuery) || effectiveStatus !== "ALL"
                ? "No records matched your search or status filter criteria. Try clearing filters."
                : emptyDescription || `Get started by recording your first ${title.toLowerCase().replace(/s$/, "")}.`
            }
            action={
              newButton && (!searchQuery && effectiveStatus === "ALL")
                ? {
                    label: newButton.label,
                    onClick: newButton.onClick,
                    icon: <Plus className="h-4 w-4" />,
                  }
                : undefined
            }
          />
        }
      />
    </div>
  );
}
