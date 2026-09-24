import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { journalEntryService, type JournalEntryItem } from "@/api/services/journalEntryService";
import { queryKeys } from "@/api/queryKeys";
import { ResourceListPage } from "@/components/data/ResourceListPage";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";

export const JournalEntriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") ?? "ALL";
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.journalEntries.list({ page, status }),
    queryFn: () => journalEntryService.getJournalEntries({ page, limit: 10, status: status === "ALL" ? undefined : status }),
    placeholderData: (prev) => prev,
  });

  const columns: ColumnDef<JournalEntryItem, any>[] = [
    {
      id: "number",
      header: "Voucher No.",
      cell: ({ row }) => <span className="font-mono-numbers text-xs font-semibold text-primary">{row.original.entryNumber}</span>,
    },
    { id: "date", header: "Date", cell: ({ row }) => <span className="text-xs">{formatDate(row.original.entryDate || row.original.createdAt)}</span> },
    {
      id: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.referenceType} {row.original.referenceNumber ? `· ${row.original.referenceNumber}` : ""}
        </span>
      ),
    },
    { id: "remarks", header: "Remarks", cell: ({ row }) => <span className="block max-w-56 truncate text-xs">{row.original.remarks || "—"}</span> },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => <span className="font-mono-numbers text-xs font-semibold">{formatMoney(row.original.totalDebit)}</span>,
    },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value && value !== "ALL") p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  return (
    <ResourceListPage
      title="Journal Entries"
      description="Manual vouchers — Draft until posted to the General Ledger."
      columns={columns}
      data={data?.items ?? []}
      isLoading={isLoading}
      error={error as Error | null}
      onRetry={refetch}
      onRowClick={(row) => navigate(`/journal-entries/${row._id}`)}
      serverMode={{
        status,
        onStatusChange: (s) => setParam("status", s),
        pageIndex: page - 1,
        pageSize: 10,
        total: data?.total ?? 0,
        onPageChange: (pi) => setParam("page", String(pi + 1)),
      }}
      statusFilter={{
        key: "status" as never,
        options: [
          { label: "Draft", value: "Draft" },
          { label: "Submitted", value: "Submitted" },
          { label: "Cancelled", value: "Cancelled" },
        ],
      }}
      newButton={{
        label: "New Journal Entry",
        onClick: () => navigate("/journal-entries/new"),
        permission: "journal_entries:create",
      }}
    />
  );
};

export default JournalEntriesPage;
