import React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  total?: number; // server-side total (manualPagination); falls back to data.length
  onPageChange?: (pageIndex: number) => void; // 0-based target page index
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  pageIndex = 0,
  pageSize = 10,
  pageCount,
  total,
  onPageChange,
  emptyState,
  className = "",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const showTotal = total ?? data.length;

  // TanStack Table's API returns non-memoizable functions; React Compiler intentionally skips optimizing this component.
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: !!pageCount,
    pageCount: pageCount ?? -1,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-4 space-y-3">
          <div className="h-9 w-full rounded-xl bg-muted/70 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-muted/40 animate-pulse flex items-center px-4 space-x-4">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden dark:bg-card/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground tracking-wider sticky top-0 z-10 backdrop-blur-md">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-3.5 whitespace-nowrap",
                          canSort ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="shrink-0 text-muted-foreground">
                              {isSorted === "desc" ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : isSorted === "asc" ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/60">
              <AnimatePresence initial={false}>
                {table.getRowModel().rows.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(
                      "group transition-colors hover:bg-muted/40",
                      onRowClick ? "cursor-pointer" : ""
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 whitespace-nowrap text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {(table.getPageCount() > 1 || onPageChange) && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-medium font-mono-numbers text-foreground">
              {showTotal === 0 ? 0 : table.getState().pagination.pageIndex * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium font-mono-numbers text-foreground">
              {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, showTotal)}
            </span>{" "}
            of <span className="font-medium font-mono-numbers text-foreground">{showTotal}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const target = Math.max(table.getState().pagination.pageIndex - 1, 0);
                if (onPageChange) onPageChange(target);
                table.previousPage();
              }}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted disabled:opacity-40 transition-colors font-medium"
            >
              Previous
            </button>
            <span className="font-mono-numbers px-2 font-medium text-foreground">
              {table.getState().pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
            </span>
            <button
              type="button"
              onClick={() => {
                const target = table.getState().pagination.pageIndex + 1;
                if (onPageChange) onPageChange(target);
                table.nextPage();
              }}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted disabled:opacity-40 transition-colors font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
