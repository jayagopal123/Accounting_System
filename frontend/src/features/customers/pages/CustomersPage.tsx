import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pencil, Ban, CheckCircle2, Trash2, ExternalLink } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { PARTY_CONFIG, usePartyList, usePartyMutations, type PartyKind, type PartyItem } from "../partyConfig";
import { ResourceListPage } from "@/components/data/ResourceListPage";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { formatMoney } from "@/lib/formatMoney";

/** Party list used by both Customers and Suppliers pages (config-driven). */
export const PartyListPage: React.FC<{ kind: PartyKind }> = ({ kind }) => {
  const cfg = PARTY_CONFIG[kind];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const page = Number(searchParams.get("page") ?? 1);
  const [confirmDelete, setConfirmDelete] = useState<PartyItem | null>(null);

  const { data, isLoading, error, refetch } = usePartyList(kind, {
    page,
    limit: 10,
    search: search || undefined,
    status: status === "ALL" ? undefined : status,
  });
  const { toggleStatus, remove } = usePartyMutations(kind);

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value && value !== "ALL") p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  const columns: ColumnDef<PartyItem, any>[] = [
    {
      id: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono-numbers text-xs font-semibold text-primary">{(row.original as any)[cfg.codeField]}</span>
      ),
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{row.original.name}</p>
          <p className="text-[10px] text-muted-foreground">{(row.original as any).companyName ?? row.original.email}</p>
        </div>
      ),
    },
    {
      id: "group",
      header: "Group / Type",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {(row.original as any)[cfg.groupField] || "—"} · {(row.original as any).customerType ?? (row.original as any).supplierType ?? "—"}
        </span>
      ),
    },
    ...(kind === "customer"
      ? [{
          id: "creditLimit",
          header: "Credit Limit",
          cell: ({ row }: any) => <span className="font-mono-numbers text-xs">{formatMoney((row.original as any).creditLimit ?? 0)}</span>,
        } as ColumnDef<PartyItem, any>]
      : []),
    {
      id: "gstin",
      header: "GSTIN",
      cell: ({ row }) => <span className="font-mono-numbers text-[10px] text-muted-foreground">{row.original.gstin || "—"}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              title="Open detail"
              onClick={(e) => { e.stopPropagation(); navigate(`/${kind}s/${item._id}`); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              title="Edit"
              onClick={(e) => { e.stopPropagation(); navigate(`/${kind}s/${item._id}/edit`); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              title={item.status === "Active" ? "Block" : "Activate"}
              onClick={(e) => { e.stopPropagation(); toggleStatus(item._id, item.status); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.status === "Active" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
            <button
              title="Delete"
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(item); }}
              className="rounded-lg p-1.5 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <ResourceListPage
        title={cfg.title}
        description={kind === "customer" ? "Receivable masters — feed invoices, receipts, statements and AR aging." : "Payable masters — feed bills, payments, statements and AP aging."}
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={error as Error | null}
        onRetry={refetch}
        onRowClick={(row) => navigate(`/${kind}s/${row._id}`)}
        serverMode={{
          search,
          onSearchChange: (q) => setParam("q", q),
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
            { label: "Active", value: "Active" },
            { label: "Blocked", value: "Blocked" },
          ],
        }}
        newButton={{
          label: `New ${cfg.titleSingular}`,
          onClick: () => navigate(`/${kind}s/new`),
          permission: `${cfg.permNS}:create`,
        }}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title={`Delete ${confirmDelete?.name}?`}
        description="This permanently removes the master record. Historic documents keep their snapshot."
        destructive
        confirmLabel="Delete"
        onConfirm={async () => {
          if (confirmDelete) await remove(confirmDelete._id);
          setConfirmDelete(null);
        }}
      />
    </>
  );
};

/** Route entry — the router renders /customers without props, so bind the kind here. */
export const CustomersPage: React.FC = () => <PartyListPage kind="customer" />;

export default CustomersPage;
