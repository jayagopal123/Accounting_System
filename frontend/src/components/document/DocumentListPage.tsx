import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { DOC_TYPES, docColumns } from "./docTypes";
import { ResourceListPage } from "@/components/data/ResourceListPage";
import { queryKeys } from "@/api/queryKeys";
import { documentService } from "@/api/services/documentService";

export const DocumentListPage: React.FC<{ docTypeKey: keyof typeof DOC_TYPES }> = ({ docTypeKey }) => {
  const cfg = DOC_TYPES[docTypeKey];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const page = Number(searchParams.get("page") ?? 1);

  // Server-mode list (search + status + pagination in URL params; shareable deep links).
  const nsKeys = (queryKeys as any)[cfg.queryKeyNS];
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: nsKeys.list({ search, status, page }),
    queryFn: () => documentService.getList(cfg.type, { page, limit: 10, search: search || undefined, status: status === "ALL" ? undefined : status }),
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "ALL") next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  return (
    <ResourceListPage
      title={cfg.title}
      description={`Double-entry documents with Draft → Submitted → Cancelled lifecycle.`}
      columns={docColumns()}
      data={data?.items ?? []}
      isLoading={isLoading}
      error={error as Error | null}
      onRetry={refetch}
      onRowClick={(row) => navigate(`/${cfg.type}/${row._id}`)}
      searchPlaceholder={`Search by number or ${cfg.partyLabel.toLowerCase()}…`}
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
          { label: "Draft", value: "Draft" },
          { label: "Submitted", value: "Submitted" },
          { label: "Cancelled", value: "Cancelled" },
        ],
      }}
      newButton={{
        label: `New ${cfg.titleSingular}`,
        onClick: () => navigate(`/${cfg.type}/new`),
        permission: `${cfg.perm}:create`,
      }}
      headerBadge={
        <button
          type="button"
          onClick={() => navigate(`/${cfg.type}/new`)}
          className="hidden items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted sm:inline-flex"
        >
          <Plus className="h-3 w-3" /> Quick create
        </button>
      }
    />
  );
};

export default DocumentListPage;
