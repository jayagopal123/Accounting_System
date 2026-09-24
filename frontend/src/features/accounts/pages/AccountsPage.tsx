import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, List, TreePine, Search, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { accountService, type AccountItem } from "@/api/services/accountService";
import { queryKeys } from "@/api/queryKeys";
import { PageHeader } from "@/components/feedback/PageHeader";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Money } from "@/components/fields/Money";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  ASSET: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  LIABILITY: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  EQUITY: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  INCOME: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  EXPENSE: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

interface TreeNode extends AccountItem {
  children: TreeNode[];
}

function buildTree(accounts: AccountItem[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  accounts.forEach((a) => map.set(a._id, { ...a, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    const parent = node.parentAccount;
    const parentId = typeof parent === "object" ? parent?._id : parent;
    if (parentId && map.has(parentId)) map.get(parentId)!.children.push(node);
    else roots.push(node);
  });
  return roots;
}

const TreeRow: React.FC<{
  node: TreeNode;
  depth: number;
  onLedger: (id: string) => void;
}> = ({ node, depth, onLedger }) => {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => hasChildren && setOpen(!open)}
      >
        <td className="px-4 py-3" style={{ paddingLeft: `${12 + depth * 24}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <span className="w-3.5" />
            )}
            <span className="font-mono-numbers text-xs text-muted-foreground">{node.accountCode}</span>
            <span className="text-xs font-medium text-foreground">{node.accountName}</span>
            {node.isGroup && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">Group</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={cn("rounded-lg px-2 py-0.5 text-[10px] font-semibold", TYPE_COLORS[node.accountType])}>
            {node.accountType}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <Money amount={node.balance ?? 0} />
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={node.status} />
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            title="View ledger"
            onClick={(e) => {
              e.stopPropagation();
              onLedger(node._id);
            }}
            className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </td>
      </motion.tr>
      <AnimatePresence initial={false}>
        {open && node.children.map((child) => (
          <TreeRow key={child._id} node={child} depth={depth + 1} onLedger={onLedger} />
        ))}
      </AnimatePresence>
    </>
  );
};

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"tree" | "flat">("tree");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.accounts.tree,
    queryFn: accountService.getAccountTree,
  });

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.accountName.toLowerCase().includes(q) || a.accountCode.includes(q)
      );
    }
    if (typeFilter !== "ALL") list = list.filter((a) => a.accountType === typeFilter);
    return list;
  }, [data, search, typeFilter]);

  const tree = useMemo(() => buildTree(filtered), [filtered]);
  const flatList = useMemo(
    () => [...filtered].sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
    [filtered]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        description="The double-entry backbone — every voucher posts into these accounts."
        actions={
          <button
            onClick={() => navigate("/accounts/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 glow-primary"
          >
            <Plus className="h-4 w-4" /> New Account
          </button>
        }
      />

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name…"
            className="w-full rounded-xl border border-input bg-card py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex overflow-hidden rounded-xl border border-border">
            <button
              onClick={() => setView("tree")}
              className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium", view === "tree" ? "bg-primary text-white" : "bg-card text-muted-foreground hover:bg-muted")}
            >
              <TreePine className="h-3.5 w-3.5" /> Tree
            </button>
            <button
              onClick={() => setView("flat")}
              className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-medium", view === "flat" ? "bg-primary text-white" : "bg-card text-muted-foreground hover:bg-muted")}
            >
              <List className="h-3.5 w-3.5" /> Flat
            </button>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">All types</option>
            {Object.keys(TYPE_COLORS).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No accounts found"
          description="Create your first ledger account to start posting vouchers."
          action={{ label: "New Account", onClick: () => navigate("/accounts/new") }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm group">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {view === "tree"
                  ? tree.map((root) => <TreeRow key={root._id} node={root} depth={0} onLedger={(id) => navigate(`/reports/general-ledger?accountId=${id}`)} />)
                  : flatList.map((a) => (
                      <tr key={a._id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono-numbers text-xs text-muted-foreground">{a.accountCode}</span>
                          <span className="ml-2 text-xs font-medium">{a.accountName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-lg px-2 py-0.5 text-[10px] font-semibold", TYPE_COLORS[a.accountType])}>
                            {a.accountType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right"><Money amount={a.balance ?? 0} /></td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            title="View ledger"
                            onClick={() => navigate(`/reports/general-ledger?accountId=${a._id}`)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
