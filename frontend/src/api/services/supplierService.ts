import { apiClient } from "../client";
import { type Paged } from "../normalize";
import { adaptSupplier, adaptSupplierList, partyToBackend } from "../adapters";
import { type Address } from "./customerService";

export interface SupplierItem {
  _id: string;
  supplierCode: string;
  name: string;
  companyName?: string;
  supplierGroup?: string;
  supplierType?: string;
  gstin?: string;
  pan?: string;
  taxCategory?: string;
  creditDays?: number;
  paymentTerms?: string;
  contactPerson?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  billingAddress?: Address;
  remarks?: string;
  tags?: string[];
  status: "Active" | "Blocked";
  createdAt?: string;
}

export const supplierService = {
  getSuppliers: async (params?: { page?: number; limit?: number; search?: string }): Promise<Paged<SupplierItem>> => {
    const res = await apiClient.get("/suppliers", { params });
    return adaptSupplierList(res);
  },

  getSupplierById: async (id: string): Promise<SupplierItem> => {
    const res = await apiClient.get(`/suppliers/${id}`);
    return unwrapAsSupplier(res);
  },

  createSupplier: async (data: Partial<SupplierItem>): Promise<SupplierItem> => {
    const res = await apiClient.post("/suppliers", partyToBackend(data, "supplier"));
    return unwrapAsSupplier(res);
  },

  updateSupplier: async (id: string, data: Partial<SupplierItem>): Promise<SupplierItem> => {
    const res = await apiClient.put(`/suppliers/${id}`, partyToBackend(data, "supplier"));
    return unwrapAsSupplier(res);
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },

  blockSupplier: async (id: string): Promise<SupplierItem> => {
    const res = await apiClient.patch(`/suppliers/${id}/block`);
    return unwrapAsSupplier(res);
  },

  activateSupplier: async (id: string): Promise<SupplierItem> => {
    const res = await apiClient.patch(`/suppliers/${id}/activate`);
    return unwrapAsSupplier(res);
  },
};

function unwrapAsSupplier(res: any): SupplierItem {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return adaptSupplier(payload);
}
