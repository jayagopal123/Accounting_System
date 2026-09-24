import { type ColumnDef } from "@tanstack/react-table";
import { formatMoney } from "@/lib/formatMoney";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { formatDate } from "@/lib/formatDate";
import { type DocumentItem, type DocumentType } from "@/api/services/documentService";

export interface DocTypeConfig {
  /** URL segment, e.g. "sales-invoices" */
  type: DocumentType;
  title: string;
  titleSingular: string;
  /** "customer" | "supplier" */
  partyField: "customer" | "supplier";
  partyLabel: string;
  /** Permission namespace, e.g. "sales_invoices" */
  perm: string;
  /** Payment deep link type, null for notes */
  paymentInvoiceType: "SalesInvoice" | "PurchaseInvoice" | null;
  /** Query key namespace (key of queryKeys) */
  queryKeyNS: string;
  numberingDocType: string;
}

export const DOC_TYPES: Record<DocumentType, DocTypeConfig> = {
  "sales-invoices": {
    type: "sales-invoices",
    title: "Sales Invoices",
    titleSingular: "Sales Invoice",
    partyField: "customer",
    partyLabel: "Customer",
    perm: "sales_invoices",
    paymentInvoiceType: "SalesInvoice",
    queryKeyNS: "salesInvoices",
    numberingDocType: "SalesInvoice",
  },
  "purchase-invoices": {
    type: "purchase-invoices",
    title: "Purchase Invoices",
    titleSingular: "Purchase Invoice",
    partyField: "supplier",
    partyLabel: "Supplier",
    perm: "purchase_invoices",
    paymentInvoiceType: "PurchaseInvoice",
    queryKeyNS: "purchaseInvoices",
    numberingDocType: "PurchaseInvoice",
  },
  "credit-notes": {
    type: "credit-notes",
    title: "Credit Notes",
    titleSingular: "Credit Note",
    partyField: "customer",
    partyLabel: "Customer",
    perm: "sales_invoices", // reuse mapping per spec
    paymentInvoiceType: null,
    queryKeyNS: "creditNotes",
    numberingDocType: "CreditNote",
  },
  "debit-notes": {
    type: "debit-notes",
    title: "Debit Notes",
    titleSingular: "Debit Note",
    partyField: "supplier",
    partyLabel: "Supplier",
    perm: "purchase_invoices", // reuse mapping per spec
    paymentInvoiceType: null,
    queryKeyNS: "debitNotes",
    numberingDocType: "DebitNote",
  },
};

/** Shared list columns for all four document types. */
export function docColumns(): ColumnDef<DocumentItem, any>[] {
  return [
    {
      id: "number",
      header: "Number",
      cell: ({ row }) => (
        <span className="font-mono-numbers text-xs font-semibold text-primary">
          {row.original.invoiceNumber || row.original.noteNumber || "—"}
        </span>
      ),
    },
    {
      id: "party",
      header: "Party",
      cell: ({ row }) => {
        const party = (row.original as any).customer ?? (row.original as any).supplier;
        return <span className="text-xs font-medium">{typeof party === "object" ? party?.name : party || "—"}</span>;
      },
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => <span className="text-xs">{formatDate(row.original.invoiceDate || row.original.createdAt)}</span>,
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => <span className="font-mono-numbers text-xs font-semibold">{formatMoney(row.original.grandTotal)}</span>,
    },
    {
      id: "paid",
      header: "Paid",
      cell: ({ row }) => (
        <span className="font-mono-numbers text-xs text-muted-foreground">
          {row.original.amountPaid !== undefined ? formatMoney(row.original.amountPaid) : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];
}

export function getPartyName(doc: DocumentItem): string {
  const party = (doc as any).customer ?? (doc as any).supplier;
  if (!party) return "—";
  return typeof party === "object" ? party.name : party;
}

export function getPartyId(doc: DocumentItem): string | undefined {
  const party = (doc as any).customer ?? (doc as any).supplier;
  if (!party) return undefined;
  return typeof party === "object" ? party._id : party;
}

export function getPartyCode(doc: DocumentItem): string | undefined {
  const party = (doc as any).customer ?? (doc as any).supplier;
  if (!party || typeof party !== "object") return undefined;
  return party.customerCode || party.supplierCode;
}

export function getPartyGstin(doc: DocumentItem): string | undefined {
  const party = (doc as any).customer ?? (doc as any).supplier;
  if (!party || typeof party !== "object") return undefined;
  return party.gstin;
}
