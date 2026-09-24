import React, { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell, FileText, Receipt, CreditCard, Target, Shield, CheckCheck, ArrowLeftRight,
  FileMinus, FilePlus, TrendingUp,
} from "lucide-react";
import { notificationService, type NotificationItem, type NotificationType } from "@/api/services/notificationService";
import { queryKeys } from "@/api/queryKeys";
import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatDateTime } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

const TYPE_META: Record<NotificationType | string, { icon: React.ComponentType<{ className?: string }>; class: string; label: string }> = {
  invoice_created: { icon: FilePlus, class: "text-blue-600 bg-blue-500/10", label: "Invoice created" },
  invoice_submitted: { icon: Receipt, class: "text-emerald-600 bg-emerald-500/10", label: "Invoice submitted" },
  invoice_cancelled: { icon: FileMinus, class: "text-red-600 bg-red-500/10", label: "Invoice cancelled" },
  payment_received: { icon: CreditCard, class: "text-emerald-600 bg-emerald-500/10", label: "Payment received" },
  payment_made: { icon: CreditCard, class: "text-amber-600 bg-amber-500/10", label: "Payment made" },
  journal_submitted: { icon: FileText, class: "text-indigo-600 bg-indigo-500/10", label: "Journal posted" },
  budget_approved: { icon: TrendingUp, class: "text-emerald-600 bg-emerald-500/10", label: "Budget approved" },
  budget_exceeded: { icon: Target, class: "text-red-600 bg-red-500/10", label: "Budget exceeded" },
  credit_note_issued: { icon: FileMinus, class: "text-violet-600 bg-violet-500/10", label: "Credit note" },
  debit_note_issued: { icon: FilePlus, class: "text-orange-600 bg-orange-500/10", label: "Debit note" },
  system_alert: { icon: Shield, class: "text-slate-600 bg-slate-500/10", label: "System" },
};

const TYPE_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Invoices", value: "invoice" },
  { label: "Payments", value: "payment" },
  { label: "Budgets", value: "budget" },
  { label: "Journals", value: "journal" },
];

export const NotificationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const page = Number(searchParams.get("page") ?? 1);
  const typeFilter = searchParams.get("type") ?? "ALL";
  const [marking, setMarking] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.notifications.list({ page, type: typeFilter }),
    queryFn: () => notificationService.getNotifications({ page, limit: 15 }),
    placeholderData: keepPreviousData,
  });

  const markOne = async (n: NotificationItem) => {
    if (!n.isRead) {
      await notificationService.markAsRead(n._id);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    }
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    setMarking(true);
    try {
      await notificationService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    } finally {
      setMarking(false);
    }
  };

  // Client-side type family filter (11 types grouped into families)
  const items = (data?.items ?? []).filter((n) => {
    if (typeFilter === "ALL") return true;
    return n.type.startsWith(typeFilter);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Ledger events across documents, payments, budgets and system alerts."
        actions={
          <button
            onClick={markAll}
            disabled={marking || (data?.total ?? 0) === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              if (f.value === "ALL") p.delete("type");
              else p.set("type", f.value);
              navigate(`/notifications?${p.toString()}`);
            }}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              typeFilter === f.value
                ? "border-primary bg-primary text-white"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No notifications" description="Ledger events will appear here as they happen." icon={<Bell className="h-7 w-7 stroke-[1.5]" />} />
      ) : (
        <div className="space-y-2">
          {items.map((n, idx) => {
            const meta = TYPE_META[n.type] ?? { icon: Bell, class: "text-muted-foreground bg-muted", label: n.type };
            return (
              <motion.button
                key={n._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                onClick={() => markOne(n)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-colors",
                  n.isRead ? "border-border/70 bg-card" : "border-primary/30 bg-primary/5 hover:bg-primary/10"
                )}
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", meta.class)}>
                  <meta.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("text-sm", n.isRead ? "font-medium text-foreground" : "font-semibold text-foreground")}>
                      {n.title}
                    </span>
                    {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </span>
                  <span className="block text-xs text-muted-foreground">{n.message}</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</span>
                </span>
                <ArrowLeftRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            );
          })}
        </div>
      )}

      {(data?.totalPages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs">
          {Array.from({ length: data!.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => navigate(`/notifications?page=${i + 1}`)}
              className={cn(
                "h-8 w-8 rounded-lg border font-mono-numbers",
                page === i + 1 ? "border-primary bg-primary text-white" : "border-border bg-card hover:bg-muted"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
