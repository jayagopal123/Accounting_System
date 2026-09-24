import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { paymentService, type PaymentItem } from "@/api/services/paymentService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { LifecycleToolbar } from "@/components/document/LifecycleToolbar";
import { RouteFallback } from "@/app/guards";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";
import { Link } from "react-router-dom";

export const PaymentDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.payments.detail(id ?? ""),
    queryFn: () => paymentService.getPaymentById(id!),
    enabled: !!id,
  });

  if (isLoading) return <RouteFallback />;
  if (error || !data) {
    return <ErrorState title="Payment not found" message={(error as Error)?.message} onRetry={() => refetch()} />;
  }

  const pay = data as PaymentItem;
  const invoiceRoute =
    pay.invoiceType === "SalesInvoice" ? "/sales-invoices" : "/purchase-invoices";
  const invoiceId = typeof pay.invoice === "object" ? pay.invoice?._id : pay.invoice;

  const doAction = async (actionId: string, nextStatus: string) => {
    try {
      if (actionId === "submit") await paymentService.submitPayment(pay._id);
      else if (actionId === "cancel") await paymentService.cancelPayment(pay._id);
      invalidate.onPaymentChange(pay._id);
      toast.success(`Payment ${actionId === "submit" ? "submitted" : "cancelled"} — status ${nextStatus}.`);
    } catch (err: any) {
      toast.error(err?.message || "Action failed.");
    }
  };

  const rows: [string, React.ReactNode][] = [
    ["Payment Number", <span key="num" className="font-mono-numbers font-semibold text-primary">{pay.paymentNumber}</span>],
    ["Type", pay.paymentType === "Receipt" ? "Receipt (money in)" : "Payment (money out)"],
    ["Invoice", invoiceId ? <Link key="inv" to={`${invoiceRoute}/${invoiceId}`} className="font-mono-numbers text-primary hover:underline">{typeof pay.invoice === "object" ? pay.invoice?.invoiceNumber : invoiceId}</Link> : "—"],
    ["Amount", <span key="amt" className="font-mono-numbers font-semibold">{formatMoney(pay.amount)}</span>],
    ["Date", formatDate(pay.paymentDate || pay.createdAt)],
    ["Method", pay.paymentMethod],
    ["Reference", (pay.referenceNumber && <span key="ref" className="font-mono-numbers">{pay.referenceNumber}</span>) || "—"],
    ["Ledger Account", typeof pay.account === "object" ? `${pay.account.accountCode} — ${pay.account.accountName}` : (pay.account as string) || "—"],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Payment ${pay.paymentNumber}`}
        description={`${pay.paymentType} · ${formatDate(pay.paymentDate || pay.createdAt)}`}
        badge={<StatusBadge status={pay.status} />}
        backButton={
          <button onClick={() => navigate("/payments")} className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted">
            ←
          </button>
        }
        actions={
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted">
            🖨 Print / PDF
          </button>
        }
      />

      <LifecycleToolbar
        entityType="payment"
        currentStatus={pay.status}
        onAction={doAction}
      />

      {/* Detail card — no edit route: payments are immutable */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm print-page">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="text-sm text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
        {pay.remarks && (
          <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">{pay.remarks}</p>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailPage;
