import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftRight, Send } from "lucide-react";
import { paymentService } from "@/api/services/paymentService";
import { documentService, type DocumentItem } from "@/api/services/documentService";
import { accountService, isCashOrBankAccount } from "@/api/services/accountService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { MoneyInput } from "@/components/fields/MoneyInput";
import { formatMoney } from "@/lib/formatMoney";
import { cn } from "@/lib/utils";

const METHODS = ["Bank Transfer", "Cash", "Cheque", "Online", "Other"] as const;
type Method = (typeof METHODS)[number];

export const PaymentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: _id } = useParams(); // payments are immutable — no edit route
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);

  // Deep-link prefill: ?paymentType=Receipt&invoiceType=SalesInvoice&invoice=:id
  const [paymentType, setPaymentType] = useState<"Receipt" | "Payment">(
    (searchParams.get("paymentType") as "Receipt" | "Payment") || "Receipt"
  );
  const [invoiceType, setInvoiceType] = useState<"SalesInvoice" | "PurchaseInvoice">(
    (searchParams.get("invoiceType") as "SalesInvoice" | "PurchaseInvoice") ||
      (paymentType === "Receipt" ? "SalesInvoice" : "PurchaseInvoice")
  );
  const [invoiceId, setInvoiceId] = useState(searchParams.get("invoice") ?? "");
  const [amount, setAmount] = useState(0);
  const [amountTouched, setAmountTouched] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<Method>("Bank Transfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [accountId, setAccountId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  // Submitted invoices only (spec 11.2.7)
  const { data: salesInv } = useQuery({
    queryKey: queryKeys.salesInvoices.list({ status: "Submitted", forPayment: true }),
    queryFn: () => documentService.getList("sales-invoices", { limit: 200, status: "Submitted" }),
    enabled: invoiceType === "SalesInvoice",
  });
  const { data: purchaseInv } = useQuery({
    queryKey: queryKeys.purchaseInvoices.list({ status: "Submitted", forPayment: true }),
    queryFn: () => documentService.getList("purchase-invoices", { limit: 200, status: "Submitted" }),
    enabled: invoiceType === "PurchaseInvoice",
  });

  const { data: accounts } = useQuery({ queryKey: queryKeys.accounts.list(), queryFn: accountService.getAccounts });

  const invoiceOptions = useMemo(() => {
    const list: DocumentItem[] = (invoiceType === "SalesInvoice" ? salesInv?.items : purchaseInv?.items) ?? [];
    return list.map((d) => ({
      value: d._id,
      label: d.invoiceNumber ?? d._id,
      subtitle: formatMoney(d.grandTotal - (d.amountPaid ?? 0)),
    }));
  }, [salesInv, purchaseInv, invoiceType]);

  // Autofill amount = outstanding on the selected invoice (editable afterwards)
  useEffect(() => {
    if (amountTouched || !invoiceId) return;
    const all = [...((salesInv?.items ?? []) as DocumentItem[]), ...((purchaseInv?.items ?? []) as DocumentItem[])];
    const selected = all.find((d) => d._id === invoiceId);
    if (selected) setAmount(Math.round((selected.grandTotal - (selected.amountPaid ?? 0)) * 100) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId, salesInv, purchaseInv]);

  const cashBankAccounts = (accounts ?? []).filter(isCashOrBankAccount);
  const accountOptions = cashBankAccounts.map((a) => ({
    value: a._id,
    label: `${a.accountCode} — ${a.accountName}`,
    subtitle: formatMoney(a.balance ?? 0),
  }));

  const selectedInvoice = useMemo(() => {
    const all = [...((salesInv?.items ?? []) as DocumentItem[]), ...((purchaseInv?.items ?? []) as DocumentItem[])];
    return all.find((d) => d._id === invoiceId);
  }, [invoiceId, salesInv, purchaseInv]);

  const submit = async () => {
    if (!invoiceId) return toast.error("Select an invoice.");
    if (amount <= 0) return toast.error("Amount must be greater than zero.");
    if (!accountId) return toast.error("Select the cash/bank ledger account.");

    setSaving(true);
    try {
      const created = await paymentService.createPayment({
        paymentType,
        invoiceType,
        invoice: invoiceId,
        amount,
        paymentDate: new Date(paymentDate).toISOString(),
        paymentMethod: method,
        referenceNumber: referenceNumber || undefined,
        account: accountId,
        remarks: remarks || undefined,
      });
      invalidate.onPaymentChange(created._id);

      // Success toast with deep link to originating invoice (spec 12.1)
      toast.success(`${paymentType} of ${formatMoney(amount)} recorded.`, {
        action: selectedInvoice
          ? { label: "View invoice", onClick: () => navigate(`/${invoiceType === "SalesInvoice" ? "sales-invoices" : "purchase-invoices"}/${selectedInvoice._id}`) }
          : undefined,
        duration: 8000,
      });
      navigate("/payments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Record Payment"
        description="Payments are immutable once submitted — review carefully."
      />

      {/* Segmented control Receipt | Payment */}
      <div className="flex w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-1">
        {(["Receipt", "Payment"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setPaymentType(t);
              setInvoiceType(t === "Receipt" ? "SalesInvoice" : "PurchaseInvoice");
              setInvoiceId("");
              setAmount(0);
              setAmountTouched(false);
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              paymentType === t ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <ArrowLeftRight className="h-4 w-4" />
            {t === "Receipt" ? "Receipt (money in)" : "Payment (money out)"}
          </button>
        ))}
      </div>

      <FormSection title="Payment Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Invoice Type">
            <select
              value={invoiceType}
              onChange={(e) => {
                setInvoiceType(e.target.value as any);
                setInvoiceId("");
                setAmount(0);
                setAmountTouched(false);
              }}
              className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="SalesInvoice">Sales Invoice (customer)</option>
              <option value="PurchaseInvoice">Purchase Invoice (supplier)</option>
            </select>
          </Field>
          <Field label="Invoice" required hint="Only Submitted invoices are eligible for payments">
            <EntityCombobox
              options={invoiceOptions}
              value={invoiceId}
              onChange={(v) => {
                setInvoiceId(v);
                setAmountTouched(false);
              }}
              placeholder="Select submitted invoice…"
            />
          </Field>
          <Field label="Amount (₹)" required hint={selectedInvoice ? `Invoice outstanding: ${formatMoney(selectedInvoice.grandTotal - (selectedInvoice.amountPaid ?? 0))} — autofilled, editable` : undefined}>
            <MoneyInput value={amount} onChange={(v) => { setAmount(v); setAmountTouched(true); }} />
          </Field>
          <Field label="Payment Date" required>
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Method" required>
            <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={method === "Cheque" ? "Cheque No." : "Reference No."}>
            <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Cash / Bank Ledger Account" required className="sm:col-span-2" hint="Only accounts detected as cash or bank by isCashOrBankAccount()">
            <EntityCombobox
              options={accountOptions}
              value={accountId}
              onChange={setAccountId}
              placeholder="Select cash/bank account…"
            />
          </Field>
          <Field label="Remarks" className="sm:col-span-2">
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
        </div>
      </FormSection>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl md:pl-[264px]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2.5">
          <button type="button" onClick={() => navigate("/payments")} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button
            type="button" disabled={saving} onClick={submit}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
            Submit {paymentType}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFormPage;
