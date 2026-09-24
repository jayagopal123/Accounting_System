import { apiClient } from "../client";
import { normalizePaged, unwrap, type Paged } from "../normalize";
import { type DocumentItem } from "./documentService";
import { type AccountItem } from "./accountService";

export type PaymentType = "Receipt" | "Payment";
export type InvoiceType = "SalesInvoice" | "PurchaseInvoice";
export type PaymentMethod = "Bank Transfer" | "Cash" | "Cheque" | "Online" | "Other";

export interface PaymentItem {
  _id: string;
  paymentNumber: string;
  paymentType: PaymentType;
  invoiceType: InvoiceType;
  invoice: string | DocumentItem;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  account: string | AccountItem;
  remarks?: string;
  status: "Submitted" | "Cancelled";
  createdAt?: string;
}

export interface CreatePaymentDTO {
  paymentType: PaymentType;
  invoiceType: InvoiceType;
  invoice: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  account: string;
  remarks?: string;
}

export const paymentService = {
  getPayments: async (params?: { page?: number; limit?: number; paymentType?: string; status?: string }): Promise<Paged<PaymentItem>> => {
    const res = await apiClient.get("/payments", { params });
    return normalizePaged<PaymentItem>(res);
  },

  getPaymentById: async (id: string): Promise<PaymentItem> => {
    const res = await apiClient.get(`/payments/${id}`);
    return unwrap<PaymentItem>(res);
  },

  createPayment: async (data: CreatePaymentDTO): Promise<PaymentItem> => {
    const res = await apiClient.post("/payments", data);
    return unwrap<PaymentItem>(res);
  },

  submitPayment: async (id: string): Promise<PaymentItem> => {
    const res = await apiClient.patch(`/payments/${id}/submit`);
    return unwrap<PaymentItem>(res);
  },

  cancelPayment: async (id: string): Promise<PaymentItem> => {
    const res = await apiClient.patch(`/payments/${id}/cancel`);
    return unwrap<PaymentItem>(res);
  },
};
