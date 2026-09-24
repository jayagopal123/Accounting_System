import React from "react";
import { Link } from "react-router-dom";
import { Printer, ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHeader } from "../feedback/PageHeader";
import { StatusBadge } from "../feedback/StatusBadge";
import { LifecycleToolbar } from "./LifecycleToolbar";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";
import { BRAND } from "@/config/brand";
import { type DocumentItem, type DocumentType } from "@/api/services/documentService";

interface DocumentDetailProps {
  type: DocumentType;
  title: string;
  document: DocumentItem;
  partyName: string;
  partyCode?: string;
  partyGstin?: string;
  onStatusAction: (actionId: string, nextStatus: string) => Promise<void>;
  onEdit?: () => void;
  isLoading?: boolean;
  extraAction?: React.ReactNode;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  type,
  title,
  document,
  partyName,
  partyCode,
  partyGstin,
  onStatusAction,
  onEdit,
  isLoading = false,
  extraAction,
}) => {
  const docNumber = document.invoiceNumber || document.noteNumber || "—";
  const isSalesInvoice = type === "sales-invoices";
  const isPurchaseInvoice = type === "purchase-invoices";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title={`${title} ${docNumber}`}
          description={`Recorded on ${formatDate(document.invoiceDate || document.createdAt)}`}
          badge={<StatusBadge status={document.status} />}
          backButton={
            <Link
              to={`/${type}`}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          }
          actions={
            <div className="flex items-center gap-2">
              {extraAction}
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print / PDF
              </button>

              {/* Record Receipt Deep Link */}
              {isSalesInvoice && document.status === "Submitted" && (
                <Link
                  to={`/payments/new?paymentType=Receipt&invoiceType=SalesInvoice&invoice=${document._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all glow-primary shadow-sm"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Record Receipt
                </Link>
              )}

              {/* Record Payment Deep Link */}
              {isPurchaseInvoice && document.status === "Submitted" && (
                <Link
                  to={`/payments/new?paymentType=Payment&invoiceType=PurchaseInvoice&invoice=${document._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all glow-primary shadow-sm"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Record Payment
                </Link>
              )}
            </div>
          }
        />

        <div className="mt-4">
          <LifecycleToolbar
            entityType="document"
            currentStatus={document.status}
            onAction={onStatusAction}
            isLoading={isLoading}
            canEdit={document.status === "Draft"}
            onEdit={onEdit}
          />
        </div>
      </div>

      {/* Printable Invoice Card */}
      <div className="print-page rounded-2xl border border-border bg-card p-8 shadow-sm space-y-8 dark:bg-card/90">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border/60 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
                IL
              </div>
              <span className="font-bold text-lg font-display text-foreground tracking-tight">
                {BRAND.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              GSTIN: 29AABCI9999D1ZP · Bangalore Hub, India
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <h2 className="text-xl font-bold font-display text-foreground tracking-tight">
              {title.toUpperCase()}
            </h2>
            <p className="font-mono-numbers text-sm font-semibold text-primary">{docNumber}</p>
            <p className="text-xs text-muted-foreground">
              Date: {formatDate(document.invoiceDate || document.createdAt)}
            </p>
            {document.dueDate && (
              <p className="text-xs text-muted-foreground">Due: {formatDate(document.dueDate)}</p>
            )}
          </div>
        </div>

        {/* Party Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border border-border/50">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Billed To
            </span>
            <p className="text-sm font-semibold text-foreground">{partyName}</p>
            {partyCode && <p className="text-xs text-muted-foreground font-mono-numbers">Code: {partyCode}</p>}
            {partyGstin && <p className="text-xs text-muted-foreground font-mono-numbers">GSTIN: {partyGstin}</p>}
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Status
            </span>
            <div className="pt-0.5">
              <StatusBadge status={document.status} />
            </div>
            {document.amountPaid !== undefined && document.amountPaid > 0 && (
              <p className="text-xs text-emerald-600 font-mono-numbers pt-1">
                Paid: {formatMoney(document.amountPaid)}
              </p>
            )}
          </div>
        </div>

        {/* Lines Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-border text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="py-2.5 w-10">#</th>
                <th className="py-2.5">Item & Description</th>
                <th className="py-2.5 text-right w-24">Qty</th>
                <th className="py-2.5 text-right w-32">Rate</th>
                <th className="py-2.5 text-right w-36">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {document.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 text-xs text-muted-foreground font-mono-numbers">{idx + 1}</td>
                  <td className="py-3">
                    <p className="font-medium text-foreground">{item.itemName}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono-numbers text-foreground">{item.quantity}</td>
                  <td className="py-3 text-right font-mono-numbers text-foreground">
                    {formatMoney(item.rate)}
                  </td>
                  <td className="py-3 text-right font-mono-numbers font-medium text-foreground">
                    {formatMoney(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Notes */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-border pt-6">
          <div className="space-y-2 max-w-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes & Terms
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {document.remarks || "Thank you for your business. Subject to Bengaluru jurisdiction."}
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2.5 sm:text-right">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono-numbers text-foreground">{formatMoney(document.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>GST Tax:</span>
              <span className="font-mono-numbers text-foreground">{formatMoney(document.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-2">
              <span>Total:</span>
              <span className="font-mono-numbers text-primary">{formatMoney(document.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
