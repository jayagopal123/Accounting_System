import { apiClient } from "../client";
import { type Paged } from "../normalize";
import { adaptDocument, adaptDocumentList, documentToBackend } from "../adapters";
import { type CustomerItem } from "./customerService";
import { type SupplierItem } from "./supplierService";
import { type TaxGroupItem } from "./taxService";

export type DocumentType = "sales-invoices" | "purchase-invoices" | "credit-notes" | "debit-notes";

export interface LineItem {
  _id?: string;
  itemName: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface DocumentItem {
  _id: string;
  invoiceNumber?: string;
  noteNumber?: string;
  customer?: string | CustomerItem;
  supplier?: string | SupplierItem;
  invoiceDate?: string;
  dueDate?: string;
  noteDate?: string;
  originalInvoice?: string | DocumentItem;
  taxGroup?: string | TaxGroupItem;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid?: number;
  status: "Draft" | "Submitted" | "Cancelled";
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function getDocumentEndpoint(type: DocumentType): string {
  return `/${type}`;
}

export const documentService = {
  getList: async (
    type: DocumentType,
    params?: { page?: number; limit?: number; search?: string; status?: string; customer?: string; supplier?: string }
  ): Promise<Paged<DocumentItem>> => {
    const res = await apiClient.get(getDocumentEndpoint(type), { params });
    return adaptDocumentList(res);
  },

  getById: async (type: DocumentType, id: string): Promise<DocumentItem> => {
    const res = await apiClient.get(`${getDocumentEndpoint(type)}/${id}`);
    return unwrapAsDoc(res);
  },

  create: async (type: DocumentType, data: Partial<DocumentItem>): Promise<DocumentItem> => {
    const res = await apiClient.post(getDocumentEndpoint(type), documentToBackend(data, type));
    return unwrapAsDoc(res);
  },

  update: async (type: DocumentType, id: string, data: Partial<DocumentItem>): Promise<DocumentItem> => {
    const res = await apiClient.put(`${getDocumentEndpoint(type)}/${id}`, documentToBackend(data, type));
    return unwrapAsDoc(res);
  },

  submit: async (type: DocumentType, id: string): Promise<DocumentItem> => {
    const res = await apiClient.patch(`${getDocumentEndpoint(type)}/${id}/submit`);
    return unwrapAsDoc(res);
  },

  cancel: async (type: DocumentType, id: string): Promise<DocumentItem> => {
    const res = await apiClient.patch(`${getDocumentEndpoint(type)}/${id}/cancel`);
    return unwrapAsDoc(res);
  },
};

function unwrapAsDoc(res: any): DocumentItem {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return adaptDocument(payload);
}
