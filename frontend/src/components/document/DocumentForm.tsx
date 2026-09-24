import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Save, Send } from "lucide-react";
import { DOC_TYPES, getPartyId } from "./docTypes";
import { LineItemEditor } from "./LineItemEditor";
import { TotalsPanel } from "./TotalsPanel";
import { PageHeader } from "../feedback/PageHeader";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { queryKeys } from "@/api/queryKeys";
import { documentService, type DocumentItem, type LineItem } from "@/api/services/documentService";
import { customerService } from "@/api/services/customerService";
import { supplierService } from "@/api/services/supplierService";
import { taxService } from "@/api/services/taxService";
import { settingsService } from "@/api/services/settingsService";
import { useQueryClient } from "@tanstack/react-query";
import { createInvalidator } from "@/api/invalidation";

interface DocumentFormProps {
  docTypeKey: keyof typeof DOC_TYPES;
}

/**
 * The document family editor — one implementation for Sales/Purchase Invoices
 * and Credit/Debit Notes, configured by docTypes.
 */
export const DocumentForm: React.FC<DocumentFormProps> = ({ docTypeKey }) => {
  const cfg = DOC_TYPES[docTypeKey];
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;

  const [items, setItems] = useState<LineItem[]>([{ itemName: "", quantity: 1, rate: 0, amount: 0 }]);
  const [partyId, setPartyId] = useState<string>("");
  const [taxGroupId, setTaxGroupId] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [prefilledParty, setPrefilledParty] = useState("");
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Prefill party from deep link (?customer= / ?supplier=) — render-adjust pattern.
  const pre = searchParams.get(cfg.partyField) ?? "";
  if (pre && pre !== prefilledParty) {
    setPrefilledParty(pre);
    setPartyId(pre);
  }

  // Load existing document for edit
  const nsKeys = (queryKeys as any)[cfg.queryKeyNS];
  const { data: existing } = useQuery({
    queryKey: nsKeys.detail(id ?? ""),
    queryFn: () => documentService.getById(cfg.type, id!),
    enabled: isEdit,
  });

  // Hydrate from the fetched document once (render-adjust pattern — no effect needed).
  if (existing && hydratedId !== existing._id) {
    setHydratedId(existing._id);
    setItems(existing.items.length ? existing.items : [{ itemName: "", quantity: 1, rate: 0, amount: 0 }]);
    setPartyId(getPartyId(existing) ?? "");
    setTaxGroupId(typeof existing.taxGroup === "object" ? existing.taxGroup?._id ?? "" : existing.taxGroup ?? "");
    setInvoiceDate((existing.invoiceDate ?? new Date().toISOString()).slice(0, 10));
    setRemarks(existing.remarks ?? "");
  }

  // Masters
  const { data: customers } = useQuery({ queryKey: queryKeys.customers.list({ limit: 100 }), queryFn: () => customerService.getCustomers({ limit: 100 }) });
  const { data: suppliers } = useQuery({ queryKey: queryKeys.suppliers.list({ limit: 100 }), queryFn: () => supplierService.getSuppliers({ limit: 100 }) });
  const { data: taxGroups } = useQuery({ queryKey: queryKeys.taxGroups.active, queryFn: taxService.getActiveTaxGroups });
  const { data: nextNumber } = useQuery({
    queryKey: queryKeys.numberingSeries.next(cfg.numberingDocType),
    queryFn: () => settingsService.getNextNumber(cfg.numberingDocType),
    enabled: !isEdit,
  });

  const partyOptions = useMemo(() => {
    const list = cfg.partyField === "customer" ? customers?.items ?? [] : suppliers?.items ?? [];
    return list.map((p) => ({ value: p._id, label: p.name, subtitle: (p as any).customerCode || (p as any).supplierCode }));
  }, [customers, suppliers, cfg.partyField]);

  // Live tax preview (client-side; swap for taxService.calculateTax — see ⚠ VERIFY in taxService)
  const subtotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const selectedGroup = (taxGroups ?? []).find((g) => g._id === taxGroupId);
  const totalRate = selectedGroup?.totalRate ?? 0;
  const taxAmount = Math.round(subtotal * totalRate) / 100;

  const buildPayload = () => ({
    [cfg.partyField]: partyId,
    invoiceDate: new Date(invoiceDate).toISOString(),
    taxGroup: taxGroupId || undefined,
    items: items.filter((i) => i.itemName.trim()),
    subtotal,
    taxAmount,
    grandTotal: subtotal + taxAmount,
    remarks,
  });

  const save = async (thenSubmit: boolean) => {
    if (!partyId) {
      toast.error(`${cfg.partyLabel} is required.`);
      return;
    }
    if (items.filter((i) => i.itemName.trim()).length === 0) {
      toast.error("Add at least one line item.");
      return;
    }
    setSaving(true);
    try {
      let saved: DocumentItem;
      if (isEdit) {
        saved = await documentService.update(cfg.type, id!, buildPayload());
      } else {
        saved = await documentService.create(cfg.type, buildPayload());
      }
      invalidate.onDocumentChange(cfg.type as any, saved._id);
      toast.success(`${cfg.titleSingular} ${isEdit ? "updated" : thenSubmit ? "saved" : "saved as Draft"}.`);
      if (thenSubmit && !isEdit) {
        await documentService.submit(cfg.type, saved._id);
        invalidate.onDocumentChange(cfg.type as any, saved._id);
        toast.success(`${cfg.titleSingular} submitted to the ledger.`);
      } else if (thenSubmit && isEdit && saved.status === "Draft") {
        await documentService.submit(cfg.type, saved._id);
        invalidate.onDocumentChange(cfg.type as any, saved._id);
        toast.success(`${cfg.titleSingular} submitted to the ledger.`);
      }
      navigate(`/${cfg.type}/${saved._id}`);
    } finally {
      setSaving(false);
    }
  };

  const form = (
    <>
      <PageHeader
        title={isEdit ? `Edit ${cfg.titleSingular}` : `New ${cfg.titleSingular}`}
        description={!isEdit && nextNumber ? `Next number: ${nextNumber} (assigned by the server on save)` : undefined}
      />

      <FormSection title="Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={cfg.partyLabel} required>
            <EntityCombobox
              options={partyOptions}
              value={partyId}
              onChange={setPartyId}
              placeholder={`Select ${cfg.partyLabel.toLowerCase()}…`}
              searchPlaceholder={`Search ${cfg.partyLabel.toLowerCase()}…`}
            />
          </Field>
          <Field label="Document Date" required>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Tax Group" hint="Applied to all line items">
            <EntityCombobox
              options={(taxGroups ?? []).map((g) => ({ value: g._id, label: g.name, subtitle: `${g.totalRate}% GST` }))}
              value={taxGroupId}
              onChange={setTaxGroupId}
              placeholder="Select tax group…"
            />
          </Field>
        </div>
      </FormSection>

      <LineItemEditor items={items} onChange={setItems} disabled={false} />

      <div className="flex justify-end">
        <TotalsPanel subtotal={subtotal} taxGroup={selectedGroup ?? null} />
      </div>

      <FormSection title="Remarks">
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={2}
          placeholder="Notes, terms, HSN references…"
          className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </FormSection>
    </>
  );

  return (
    <div className="space-y-6">
      {form}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl md:pl-[264px]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => navigate(`/${cfg.type}`)}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
            Save &amp; Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
