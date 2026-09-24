import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Plus, Save, Send, Trash2 } from "lucide-react";
import { journalEntryService, type JournalEntryLine } from "@/api/services/journalEntryService";
import { accountService } from "@/api/services/accountService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";
import { PageHeader } from "@/components/feedback/PageHeader";
import { Field } from "@/components/form/Field";
import { FormSection } from "@/components/form/FormSection";
import { EntityCombobox } from "@/components/fields/EntityCombobox";
import { formatMoney } from "@/lib/formatMoney";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const REFERENCE_TYPES = ["Sales", "Purchase", "Payment", "Receipt", "Contra", "Other"];

interface JEDraft {
  entryDate: string;
  referenceType: string;
  referenceNumber: string;
  remarks: string;
  lines: JournalEntryLine[];
}

const emptyDraft = (): JEDraft => ({
  entryDate: new Date().toISOString().slice(0, 10),
  referenceType: "Other",
  referenceNumber: "",
  remarks: "",
  lines: [
    { account: "", debit: 0, credit: 0, description: "" },
    { account: "", debit: 0, credit: 0, description: "" },
  ],
});

export const JournalEntryFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState<JEDraft>(emptyDraft());

  const { data: existing } = useQuery({
    queryKey: queryKeys.journalEntries.detail(id ?? ""),
    queryFn: () => journalEntryService.getJournalEntryById(id!),
    enabled: isEdit,
  });
  const { data: accounts } = useQuery({
    queryKey: queryKeys.accounts.list(),
    queryFn: accountService.getAccounts,
  });

  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Hydrate the form once when the fetched entry arrives (render-adjust pattern — no effect needed).
  if (existing && hydratedId !== existing._id) {
    setHydratedId(existing._id);
    setDraft({
      entryDate: (existing.entryDate ?? new Date().toISOString()).slice(0, 10),
      referenceType: existing.referenceType ?? "Other",
      referenceNumber: existing.referenceNumber ?? "",
      remarks: existing.remarks ?? "",
      lines: existing.items.length
        ? existing.items.map((l) => ({
            account: typeof l.account === "object" ? l.account._id : l.account,
            debit: l.debit,
            credit: l.credit,
            description: l.description ?? "",
          }))
        : emptyDraft().lines,
    });
  }

  const accountOptions = (accounts ?? [])
    .filter((a) => !a.isGroup)
    .map((a) => ({ value: a._id, label: `${a.accountCode} — ${a.accountName}`, subtitle: a.accountType }));

  const totalDebit = draft.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = draft.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const difference = Math.round((totalDebit - totalCredit) * 100) / 100;
  const isBalanced = Math.abs(difference) < 0.01;
  const balancePct = Math.max(0, 1 - Math.abs(difference) / Math.max(totalDebit, 1));

  const setLine = (idx: number, patch: Partial<JournalEntryLine>) =>
    setDraft((d) => ({ ...d, lines: d.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)) }));

  const addLine = () =>
    setDraft((d) => ({ ...d, lines: [...d.lines, { account: "", debit: 0, credit: 0, description: "" }] }));

  const removeLine = (idx: number) => {
    if (draft.lines.length <= 2) {
      toast.error("A journal entry needs at least 2 lines.");
      return;
    }
    setDraft((d) => ({ ...d, lines: d.lines.filter((_, i) => i !== idx) }));
  };

  const save = async (thenSubmit: boolean) => {
    if (draft.lines.filter((l) => l.account).length < 2) {
      toast.error("Pick accounts on at least 2 lines.");
      return;
    }
    if (thenSubmit && !isBalanced) {
      toast.error("Entry is not balanced — Total Debit must equal Total Credit to submit.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        entryDate: new Date(draft.entryDate).toISOString(),
        referenceType: draft.referenceType,
        referenceNumber: draft.referenceNumber || undefined,
        remarks: draft.remarks || undefined,
        items: draft.lines.filter((l) => l.account),
        totalDebit,
        totalCredit,
      };
      const saved = isEdit
        ? await journalEntryService.updateJournalEntry(id!, payload)
        : await journalEntryService.createJournalEntry(payload);
      invalidate.onJournalEntryChange(saved._id);
      if (thenSubmit) {
        await journalEntryService.submitJournalEntry(saved._id);
        invalidate.onJournalEntryChange(saved._id);
        toast.success("Journal entry posted to the General Ledger.");
      } else {
        toast.success("Journal entry saved as Draft.");
      }
      navigate(`/journal-entries/${saved._id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title={isEdit ? "Edit Journal Entry" : "New Journal Entry"}
        description="Double-entry voucher — Dr must equal Cr before submission."
      />

      <FormSection title="Voucher Header">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Field label="Date" required>
            <input type="date" value={draft.entryDate} onChange={(e) => setDraft((d) => ({ ...d, entryDate: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Reference Type">
            <select value={draft.referenceType} onChange={(e) => setDraft((d) => ({ ...d, referenceType: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {REFERENCE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Reference No.">
            <input type="text" value={draft.referenceNumber} onChange={(e) => setDraft((d) => ({ ...d, referenceNumber: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Remarks">
            <input type="text" value={draft.remarks} onChange={(e) => setDraft((d) => ({ ...d, remarks: e.target.value }))} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
        </div>
      </FormSection>

      {/* Lines */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5">
          <h3 className="text-sm font-semibold font-display">Ledger Lines ({draft.lines.length})</h3>
          <button type="button" onClick={addLine} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
            <Plus className="h-3.5 w-3.5" /> Add Line
          </button>
        </div>
        <div className="overflow-x-auto border-t border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 min-w-[220px]">Account</th>
                <th className="px-4 py-2.5 w-32 text-right">Debit (₹)</th>
                <th className="px-4 py-2.5 w-32 text-right">Credit (₹)</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {draft.lines.map((line, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">
                    <EntityCombobox
                      options={accountOptions}
                      value={typeof line.account === "object" ? (line.account as any)?._id ?? "" : line.account ?? ""}
                      onChange={(v) => setLine(idx, { account: v })}
                      placeholder="Select account…"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number" min="0" step="0.01" disabled={!!Number(line.credit)}
                      value={line.debit || ""}
                      onChange={(e) => setLine(idx, { debit: Number(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-input bg-transparent px-2 py-1.5 text-right font-mono-numbers text-sm disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number" min="0" step="0.01" disabled={!!Number(line.debit)}
                      value={line.credit || ""}
                      onChange={(e) => setLine(idx, { credit: Number(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-input bg-transparent px-2 py-1.5 text-right font-mono-numbers text-sm disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text" value={line.description ?? ""}
                      onChange={(e) => setLine(idx, { description: e.target.value })}
                      className="w-full bg-transparent px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </td>
                  <td className="px-2">
                    <button type="button" onClick={() => removeLine(idx)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live balance meter */}
      <div
        className={cn(
          "rounded-2xl border p-5 shadow-sm transition-colors",
          isBalanced ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"
        )}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Debit</p>
            <p className="mt-1 text-lg font-bold font-mono-numbers">{formatMoney(totalDebit)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Credit</p>
            <p className="mt-1 text-lg font-bold font-mono-numbers">{formatMoney(totalCredit)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difference</p>
            <motion.p
              animate={{ color: isBalanced ? "#059669" : "#dc2626" }}
              className="mt-1 text-lg font-bold font-mono-numbers"
            >
              {formatMoney(Math.abs(difference))}
            </motion.p>
          </div>
        </div>
        {/* Difference meter */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            animate={{ width: `${balancePct * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className={cn("h-full rounded-full", isBalanced ? "bg-emerald-500" : "bg-gradient-to-r from-red-500 to-amber-500")}
          />
        </div>
        <p className={cn("mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold", isBalanced ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
          {isBalanced && <Check className="h-3.5 w-3.5" />}
          {isBalanced ? "Balanced — ready to post" : "Entry is unbalanced — submission is disabled"}
        </p>
      </div>

      {/* Sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl md:pl-[264px]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2.5">
          <button type="button" onClick={() => navigate("/journal-entries")} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button
            type="button" disabled={saving}
            onClick={() => save(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save as Draft
          </button>
          <button
            type="button" disabled={saving || !isBalanced}
            title={!isBalanced ? "Balance the entry to enable submission" : undefined}
            onClick={() => save(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
            Save &amp; Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryFormPage;
