import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PARTY_CONFIG, usePartyDetail, usePartyMutations, type PartyKind, type PartyItem } from "../partyConfig";
import { ResourceFormPage } from "@/components/form/ResourceFormPage";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/form/TagInput";

const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;

const GROUPS = ["General", "Retail", "Wholesale", "Government"];
const TYPES = ["Individual", "Company", "Partnership"];

interface PartyFormValues {
  code: string; name: string; group: string; type: string; company: string; territory: string;
  gstin: string; pan: string; taxCategory: string;
  creditLimit: number; openingBalance: number; creditDays: number; paymentTerms: string; allowCreditSales: boolean;
  contactPerson: string; phone: string; mobile: string; email: string;
  line1: string; city: string; state: string; country: string; postalCode: string;
  remarks: string; tags: string[];
}

const emptyValues: PartyFormValues = {
  code: "", name: "", group: "General", type: "Company", company: "", territory: "",
  gstin: "", pan: "", taxCategory: "",
  creditLimit: 0, openingBalance: 0, creditDays: 30, paymentTerms: "", allowCreditSales: true,
  contactPerson: "", phone: "", mobile: "", email: "",
  line1: "", city: "", state: "", country: "India", postalCode: "",
  remarks: "", tags: [],
};

export const PartyFormPage: React.FC<{ kind: PartyKind }> = ({ kind }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cfg = PARTY_CONFIG[kind];
  const isEdit = !!id;
  const { data: existing } = usePartyDetail(kind, id);
  const { create, update } = usePartyMutations(kind);
  const [submitting, setSubmitting] = useState(false);

  const [values, setValues] = useState<PartyFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setValues({
        code: (existing as any)[cfg.codeField] ?? "",
        name: existing.name ?? "",
        group: (existing as any)[cfg.groupField] ?? "General",
        type: (existing as any).customerType ?? (existing as any).supplierType ?? "Company",
        company: (existing as any).companyName ?? "",
        territory: (existing as any).territory ?? "",
        gstin: existing.gstin ?? "",
        pan: existing.pan ?? "",
        taxCategory: (existing as any).taxCategory ?? "",
        creditLimit: (existing as any).creditLimit ?? 0,
        openingBalance: (existing as any).openingBalance ?? 0,
        creditDays: (existing as any).creditDays ?? 0,
        paymentTerms: (existing as any).paymentTerms ?? "",
        allowCreditSales: (existing as any).allowCreditSales ?? true,
        contactPerson: (existing as any).contactPerson ?? "",
        phone: existing.phone ?? "",
        mobile: existing.mobile ?? "",
        email: existing.email ?? "",
        line1: existing.billingAddress?.line1 ?? "",
        city: existing.billingAddress?.city ?? "",
        state: existing.billingAddress?.state ?? "",
        country: existing.billingAddress?.country ?? "India",
        postalCode: existing.billingAddress?.postalCode ?? "",
        remarks: existing.remarks ?? "",
        tags: existing.tags ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const set = <K extends keyof PartyFormValues>(k: K, v: PartyFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = "Name is required.";
    if (!values.code.trim()) e.code = "Code is required.";
    if (values.gstin && !GSTIN_RE.test(values.gstin.toUpperCase())) e.gstin = "Invalid GSTIN format (e.g. 27AAACT2727Q1ZW).";
    if (values.pan && !PAN_RE.test(values.pan.toUpperCase())) e.pan = "Invalid PAN format (e.g. AAACT2727Q).";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Invalid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (vals: PartyFormValues) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: Partial<PartyItem> = {
        name: vals.name.trim(),
        gstin: vals.gstin.toUpperCase() || undefined,
        pan: vals.pan.toUpperCase() || undefined,
        email: vals.email || undefined,
        phone: vals.phone || undefined,
        mobile: vals.mobile || undefined,
        remarks: vals.remarks || undefined,
        tags: vals.tags.length ? vals.tags : undefined,
        billingAddress: {
          line1: vals.line1 || undefined,
          city: vals.city || undefined,
          state: vals.state || undefined,
          country: vals.country || undefined,
          postalCode: vals.postalCode || undefined,
        },
        ...(kind === "customer"
          ? {
              customerCode: vals.code,
              customerGroup: vals.group as any,
              customerType: vals.type as any,
              companyName: vals.company || undefined,
              territory: vals.territory || undefined,
              taxCategory: vals.taxCategory || undefined,
              creditLimit: vals.creditLimit,
              openingBalance: vals.openingBalance,
              creditDays: vals.creditDays,
              paymentTerms: vals.paymentTerms || undefined,
              allowCreditSales: vals.allowCreditSales,
              contactPerson: vals.contactPerson || undefined,
            }
          : {
              supplierCode: vals.code,
              supplierGroup: vals.group,
              supplierType: vals.type,
              companyName: vals.company || undefined,
              taxCategory: vals.taxCategory || undefined,
              paymentTerms: vals.paymentTerms || undefined,
              contactPerson: vals.contactPerson || undefined,
            }),
      } as Partial<PartyItem>;

      if (isEdit) await update(id!, payload);
      else await create(payload);
      navigate(`/${kind}s`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResourceFormPage
      title={isEdit ? `Edit ${cfg.titleSingular}` : `New ${cfg.titleSingular}`}
      description={kind === "customer" ? "Receivable master with GST and credit terms." : "Payable master with GST details."}
      defaultValues={values}
      onSubmit={submit}
      isSubmitting={submitting}
      isEdit={isEdit}
      backTo={`/${kind}s`}
      submitLabel={isEdit ? "Update" : `Create ${cfg.titleSingular}`}
    >
      {() => (
        <>
          <FormSection title="Basic">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Code" required error={errors.code}>
                <input type="text" value={values.code} onChange={(e) => set("code", e.target.value)} placeholder={`${kind === "customer" ? "CUST" : "SUPP"}-001`} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Name" required error={errors.name} className="sm:col-span-2">
                <input type="text" value={values.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Group">
                <select value={values.group} onChange={(e) => set("group", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select value={values.type} onChange={(e) => set("type", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Company">
                <input type="text" value={values.company} onChange={(e) => set("company", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Tax (GST)">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="GSTIN" error={errors.gstin} hint="15-char GST identification number">
                <input type="text" value={values.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} maxLength={15} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="PAN" error={errors.pan}>
                <input type="text" value={values.pan} onChange={(e) => set("pan", e.target.value.toUpperCase())} maxLength={10} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Tax Category">
                <input type="text" value={values.taxCategory} onChange={(e) => set("taxCategory", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </Field>
            </div>
          </FormSection>

          {kind === "customer" && (
            <FormSection title="Credit & Payment">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Field label="Credit Limit (₹)">
                  <input type="number" min={0} value={values.creditLimit || ""} onChange={(e) => set("creditLimit", Number(e.target.value))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </Field>
                <Field label="Opening Balance (₹)">
                  <input type="number" value={values.openingBalance || ""} onChange={(e) => set("openingBalance", Number(e.target.value))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </Field>
                <Field label="Credit Days">
                  <input type="number" min={0} value={values.creditDays || ""} onChange={(e) => set("creditDays", Number(e.target.value))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-right font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </Field>
                <Field label="Payment Terms">
                  <input type="text" value={values.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} placeholder="Net 30" className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </Field>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-input bg-card px-3.5 py-2.5">
                <Switch checked={values.allowCreditSales} onCheckedChange={(c) => set("allowCreditSales", c)} />
                <span className="text-xs font-medium">Allow credit sales</span>
              </div>
            </FormSection>
          )}

          <FormSection title="Contact & Address">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Field label="Contact Person"><input type="text" value={values.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Phone"><input type="text" value={values.phone} onChange={(e) => set("phone", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Mobile"><input type="text" value={values.mobile} onChange={(e) => set("mobile", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Email" error={errors.email}><input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Address Line" className="sm:col-span-4"><input type="text" value={values.line1} onChange={(e) => set("line1", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="City"><input type="text" value={values.city} onChange={(e) => set("city", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="State"><input type="text" value={values.state} onChange={(e) => set("state", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Country"><input type="text" value={values.country} onChange={(e) => set("country", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
              <Field label="Postal Code"><input type="text" value={values.postalCode} onChange={(e) => set("postalCode", e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
            </div>
          </FormSection>

          <FormSection title="Remarks & Tags" defaultOpen={false}>
            <Field label="Remarks">
              <textarea value={values.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="Tags">
              <TagInput tags={values.tags} onChange={(tags) => set("tags", tags)} />
            </Field>
          </FormSection>
        </>
      )}
    </ResourceFormPage>
  );
};

export default PartyFormPage;
