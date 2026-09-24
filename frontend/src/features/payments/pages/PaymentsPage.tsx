import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { paymentService, type PaymentItem } from "@/api/services/paymentService";
import { queryKeys } from "@/api/queryKeys";
import { ResourceListPage } from "@/components/data/ResourceListPage";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentType = searchParams.get("paymentType") ?? "ALL";
  const status = searchParams.get("status") ?? "ALL";
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.payments.list({ page, paymentType, status }),
    queryFn: () =>
      paymentService.getPayments({
        page,
        limit: 10,
        paymentType: paymentType === "ALL" ? undefined : paymentType,
        status: status === "ALL" ? undefined : status,
      }),
    placeholderData: (prev) => prev,
  });

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value && value !== "ALL") p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  const columns: ColumnDef<PaymentItem, any>[] = [
    { id: "number", header: "Payment No.", cell: ({ row }) => <span className="font-mono-numbers text-xs font-semibold text-primary">{row.original.paymentNumber}</span> },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className={row.original.paymentType === "Receipt" ? "rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400" : "rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400"}>
          {row.original.paymentType}
        </span>
      ),
    },
    {
      id: "invoice",
      header: "Invoice",
      cell: ({ row }) => {
        const inv = row.original.invoice;
        return <span className="font-mono-numbers text-xs">{typeof inv === "object" ? inv?.invoiceNumber : inv || "—"}</span>;
      },
    },
    { id: "date", header: "Date", cell: ({ row }) => <span className="text-xs">{formatDate(row.original.paymentDate || row.original.createdAt)}</span> },
    { id: "method", header: "Method", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.paymentMethod}</span> },
    { id: "amount", header: "Amount", cell: ({ row }) => <span className="font-mono-numbers text-xs font-semibold">{formatMoney(row.original.amount)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <ResourceListPage
      title="Payments & Receipts"
      description="Money in and money out — linked to submitted invoices and ledger cash/bank accounts."
      columns={columns}
      data={data?.items ?? []}
      isLoading={isLoading}
      error={error as Error | null}
      onRetry={refetch}
      onRowClick={(row) => navigate(`/payments/${row._id}`)}
      serverMode={{
        search: "",
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
          { label: "Receipts", value: "Receipt", },
          { label: "Payments", value: "Payment" },
        ],
      }}
      toolbar={
        <div className="flex items-center gap-1.5">
          {(["Receipt", "Payment"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setParam("paymentType", paymentType === t ? "ALL" : t)}
              className={
                paymentType === t
                  ? "rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
              }
            >
              {t === "Receipt" ? "Receipts" : "Payments"}
            </button>
          ))}
        </div>
      }
      newButton={{
        label: "Record Payment",
        onClick: () => navigate(`/payments/new${paymentType !== "ALL" ? `?paymentType=${paymentType}` : ""}`),
      }}
    />
  );
};

export default PaymentsPage;
