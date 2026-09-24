import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { bankingService, type BankTransactionItem } from "@/api/services/bankingService";
import { queryKeys } from "@/api/queryKeys";
import { ResourceListPage } from "@/components/data/ResourceListPage";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";

export const BankTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const bankAccountId = searchParams.get("bankAccountId") ?? "";
  const page = Number(searchParams.get("page") ?? 1);

  const { data: bankAccounts } = useQuery({ queryKey: queryKeys.bankAccounts.list(), queryFn: bankingService.getBankAccounts });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.bankTransactions.list({ page, bankAccountId }),
    queryFn: () => bankingService.getBankTransactions({ page, limit: 15, bankAccount: bankAccountId || undefined }),
    placeholderData: (prev) => prev,
  });

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  const columns: ColumnDef<BankTransactionItem, any>[] = [
    { id: "date", header: "Date", cell: ({ row }) => <span className="text-xs">{formatDate(row.original.transactionDate || row.original.createdAt)}</span> },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-xs font-medium">
          {row.original.type === "Deposit" ? (
            <><ArrowDownToLine className="h-3.5 w-3.5 text-emerald-600" /> <span className="text-emerald-700 dark:text-emerald-400">Deposit</span></>
          ) : (
            <><ArrowUpFromLine className="h-3.5 w-3.5 text-amber-600" /> <span className="text-amber-700 dark:text-amber-400">Withdrawal</span></>
          )}
        </span>
      ),
    },
    {
      id: "account",
      header: "Bank Account",
      cell: ({ row }) => <span className="text-xs">{typeof row.original.bankAccount === "object" ? row.original.bankAccount?.accountName : "—"}</span>,
    },
    { id: "reference", header: "Reference", cell: ({ row }) => <span className="font-mono-numbers text-xs text-muted-foreground">{row.original.referenceNumber || "—"}</span> },
    { id: "description", header: "Description", cell: ({ row }) => <span className="block max-w-64 truncate text-xs">{row.original.description || "—"}</span> },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className={`font-mono-numbers text-xs font-semibold ${row.original.type === "Deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
          {row.original.type === "Deposit" ? "+" : "−"}{formatMoney(row.original.amount)}
        </span>
      ),
    },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <ResourceListPage
      title="Bank Transactions"
      description="Manual entries and ledger-fed transactions — no statement import is faked."
      columns={columns}
      data={data?.items ?? []}
      isLoading={isLoading}
      error={error as Error | null}
      onRetry={refetch}
      toolbar={
        <select
          value={bankAccountId}
          onChange={(e) => setParam("bankAccountId", e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All bank accounts</option>
          {(bankAccounts ?? []).map((b) => (
            <option key={b._id} value={b._id}>{b.accountName}</option>
          ))}
        </select>
      }
      serverMode={{
        pageIndex: page - 1,
        pageSize: 15,
        total: data?.total ?? 0,
        onPageChange: (pi) => setParam("page", String(pi + 1)),
      }}
      newButton={{
        label: "New Transaction",
        onClick: () => navigate(`/bank-transactions/new${bankAccountId ? `?bankAccountId=${bankAccountId}` : ""}`),
      }}
    />
  );
};

export default BankTransactionsPage;
