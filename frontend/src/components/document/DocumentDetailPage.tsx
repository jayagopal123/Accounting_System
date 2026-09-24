import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { DOC_TYPES, getPartyName, getPartyCode, getPartyGstin } from "./docTypes";
import { DocumentDetail } from "./DocumentDetail";
import { queryKeys } from "@/api/queryKeys";
import { documentService } from "@/api/services/documentService";
import { createInvalidator } from "@/api/invalidation";
import { RouteFallback } from "@/app/guards";
import { ErrorState } from "@/components/feedback/ErrorState";

export const DocumentDetailPage: React.FC<{ docTypeKey: keyof typeof DOC_TYPES }> = ({ docTypeKey }) => {
  const { id } = useParams();
  const cfg = DOC_TYPES[docTypeKey];
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidate = createInvalidator(queryClient);

  const nsKeys = (queryKeys as any)[cfg.queryKeyNS];
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: nsKeys.detail(id ?? ""),
    queryFn: () => documentService.getById(cfg.type, id!),
    enabled: !!id,
  });

  if (isLoading) return <RouteFallback />;
  if (error || !data) {
    return (
      <ErrorState
        title="Document not found"
        message={(error as Error)?.message ?? "This document may have been deleted."}
        onRetry={() => refetch()}
      />
    );
  }

  const doAction = async (actionId: string, nextStatus: string) => {
    try {
      if (actionId === "submit") await documentService.submit(cfg.type, data._id);
      else if (actionId === "cancel") await documentService.cancel(cfg.type, data._id);
      invalidate.onDocumentChange(cfg.type as any, data._id);
      toast.success(`${cfg.titleSingular} ${actionId === "submit" ? "submitted" : "cancelled"}. Status: ${nextStatus}.`);
    } catch (err: any) {
      toast.error(err?.message || "Action failed.");
    }
  };

  return (
    <DocumentDetail
      type={cfg.type}
      title={cfg.titleSingular}
      document={data}
      partyName={getPartyName(data)}
      partyCode={getPartyCode(data)}
      partyGstin={getPartyGstin(data)}
      onStatusAction={doAction}
      onEdit={data.status === "Draft" ? () => navigate(`/${cfg.type}/${data._id}/edit`) : undefined}
      isLoading={false}
      extraAction={
        cfg.paymentInvoiceType && data.status === "Submitted" ? (
          <a
            href={`/payments/new?paymentType=${cfg.paymentInvoiceType === "SalesInvoice" ? "Receipt" : "Payment"}&invoiceType=${cfg.paymentInvoiceType}&invoice=${data._id}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/payments/new?paymentType=${cfg.paymentInvoiceType === "SalesInvoice" ? "Receipt" : "Payment"}&invoiceType=${cfg.paymentInvoiceType}&invoice=${data._id}`);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            {cfg.paymentInvoiceType === "SalesInvoice" ? "Record receipt" : "Record payment"}
          </a>
        ) : undefined
      }
    />
  );
};

export default DocumentDetailPage;
