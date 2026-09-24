import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Pencil, Ban, CheckCircle2, FileText, Receipt, BarChart3, Clock,
  Building2, Mail, Phone, MapPin, ArrowLeft,
} from "lucide-react";
import { PARTY_CONFIG, usePartyDetail, usePartyMutations, type PartyKind } from "../partyConfig";
import { documentService, type DocumentItem } from "@/api/services/documentService";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { PageHeader } from "@/components/feedback/PageHeader";
import { RouteFallback } from "@/app/guards";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatMoney } from "@/lib/formatMoney";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";

export const PartyDetailPage: React.FC<{ kind: PartyKind }> = ({ kind }) => {
  const { id } = useParams();
  const cfg = PARTY_CONFIG[kind];
  const navigate = useNavigate();
  const { data: party, isLoading, error, refetch } = usePartyDetail(kind, id);
  const { toggleStatus } = usePartyMutations(kind);
  const [tab, setTab] = useState<"overview" | "invoices" | "activity">("overview");

  // Invoices tab filters cached document list client-side (spec 11.2.3).
  const { data: invoices } = useQuery({
    queryKey: [(kind === "customer" ? "salesInvoices" : "purchaseInvoices"), "all", { forParty: id }] as const,
    queryFn: () => documentService.getList(kind === "customer" ? "sales-invoices" : "purchase-invoices", { limit: 200 }),
    enabled: tab === "invoices" && !!id,
  });

  if (isLoading) return <RouteFallback />;
  if (error || !party) {
    return <ErrorState title="Not found" message={(error as Error)?.message ?? "Record unavailable."} onRetry={() => refetch()} />;
  }

  const docType = kind === "customer" ? "sales-invoices" : "purchase-invoices";
  const myInvoices = (invoices?.items ?? []).filter((d: DocumentItem) => {
    const p = (d as any)[cfg.kind];
    return typeof p === "object" ? p?._id === id : p === id;
  });

  const outstanding = myInvoices
    .filter((d) => d.status === "Submitted")
    .reduce((sum, d) => sum + (d.grandTotal - (d.amountPaid ?? 0)), 0);

  const deepLinks = (
    <div className="flex flex-wrap gap-2">
      <Link to={`/${docType}/new?${cfg.kind}=${id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary/90">
        <Receipt className="h-3.5 w-3.5" /> New {kind === "customer" ? "Invoice" : "Bill"}
      </Link>
      <Link to={`/reports/${kind}-statement?${cfg.kind}Id=${id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted">
        <FileText className="h-3.5 w-3.5" /> Statement
      </Link>
      <Link to={`/reports/${kind === "customer" ? "ar" : "ap"}-aging?${cfg.kind}Id=${id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted">
        <BarChart3 className="h-3.5 w-3.5" /> {kind === "customer" ? "AR" : "AP"} Aging
      </Link>
      <Link to={`/${docType}?${cfg.kind}=${id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted">
        <FileText className="h-3.5 w-3.5" /> All {kind === "customer" ? "Invoices" : "Bills"}
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={party.name}
        description={`${(party as any)[cfg.codeField]} · ${(party as any)[cfg.groupField] || "—"} · GSTIN ${party.gstin || "—"}`}
        badge={<StatusBadge status={party.status} />}
        backButton={
          <Link to={`/${kind}s`} className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {deepLinks}
            <button
              onClick={() => toggleStatus(party._id, party.status)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted"
            >
              {party.status === "Active" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {party.status === "Active" ? "Block" : "Activate"}
            </button>
            <button
              onClick={() => navigate(`/${kind}s/${id}/edit`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {(["overview", "invoices", "activity"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              tab === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {t === "invoices" ? (kind === "customer" ? "Invoices" : "Bills") : t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm md:col-span-2">
            <h3 className="text-sm font-semibold font-display">Contact & Address</h3>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {(party as any).companyName || "—"}</p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {party.email || "—"}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {party.phone || party.mobile || "—"}</p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {party.billingAddress
                  ? [party.billingAddress.line1, party.billingAddress.city, party.billingAddress.state, party.billingAddress.postalCode].filter(Boolean).join(", ")
                  : "—"}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outstanding</p>
              <p className="mt-1 text-2xl font-bold font-mono-numbers text-foreground">{formatMoney(outstanding)}</p>
            </div>
            {kind === "customer" && (
              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credit Limit</p>
                <p className="mt-1 text-xl font-bold font-mono-numbers">{formatMoney((party as any).creditLimit ?? 0)}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{(party as any).creditDays ?? 0} credit days</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {myInvoices.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">No documents yet.</td></tr>
              )}
              {myInvoices.map((d) => (
                <tr key={d._id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/${docType}/${d._id}`)}>
                  <td className="px-4 py-3 font-mono-numbers text-xs font-semibold text-primary">{d.invoiceNumber || d.noteNumber}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(d.invoiceDate || d.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-mono-numbers text-xs">{formatMoney(d.grandTotal)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 text-center shadow-sm">
          <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">
            Activity for this {cfg.kind} comes from System Logs — available to administrators under System → System Logs.
          </p>
        </div>
      )}
    </div>
  );
};

export default PartyDetailPage;
