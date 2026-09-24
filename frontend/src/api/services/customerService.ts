import { apiClient } from "../client";
import { type Paged } from "../normalize";
import { adaptCustomer, adaptCustomerList, partyToBackend } from "../adapters";

export interface Address {
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface CustomerItem {
  _id: string;
  customerCode: string;
  name: string;
  companyName?: string;
  customerGroup: "General" | "Retail" | "Wholesale" | "Government" | string;
  customerType: "Individual" | "Company" | "Partnership" | string;
  company?: string;
  territory?: string;
  gstin?: string;
  pan?: string;
  taxCategory?: string;
  creditLimit?: number;
  openingBalance?: number;
  creditDays?: number;
  paymentTerms?: string;
  allowCreditSales?: boolean;
  contactPerson?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  remarks?: string;
  tags?: string[];
  status: "Active" | "Blocked";
  createdAt?: string;
}

export const customerService = {
  getCustomers: async (params?: { page?: number; limit?: number; search?: string }): Promise<Paged<CustomerItem>> => {
    const res = await apiClient.get("/customers", { params });
    return adaptCustomerList(res);
  },

  getCustomerById: async (id: string): Promise<CustomerItem> => {
    const res = await apiClient.get(`/customers/${id}`);
    return unwrapAsCustomer(res);
  },

  createCustomer: async (data: Partial<CustomerItem>): Promise<CustomerItem> => {
    const res = await apiClient.post("/customers", partyToBackend(data, "customer"));
    return unwrapAsCustomer(res);
  },

  updateCustomer: async (id: string, data: Partial<CustomerItem>): Promise<CustomerItem> => {
    const res = await apiClient.put(`/customers/${id}`, partyToBackend(data, "customer"));
    return unwrapAsCustomer(res);
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  blockCustomer: async (id: string): Promise<CustomerItem> => {
    const res = await apiClient.patch(`/customers/${id}/block`);
    return unwrapAsCustomer(res);
  },

  activateCustomer: async (id: string): Promise<CustomerItem> => {
    const res = await apiClient.patch(`/customers/${id}/activate`);
    return unwrapAsCustomer(res);
  },
};

function unwrapAsCustomer(res: any): CustomerItem {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return adaptCustomer(payload);
}
