import { apiClient } from "../client";
import { unwrap } from "../normalize";
import {
  adaptTaxRate,
  taxRateToBackend,
  adaptTaxGroup,
  taxGroupToBackend,
  adaptTaxCalculation,
} from "../adapters";

export interface TaxRateItem {
  _id: string;
  name: string;
  code: string;
  rate: number;
  isActive: boolean;
  description?: string;
}

export interface TaxGroupLine {
  taxRate: string | TaxRateItem;
  rate: number;
}

export interface TaxGroupItem {
  _id: string;
  name: string;
  code: string;
  totalRate: number;
  isActive: boolean;
  taxes: TaxGroupLine[];
}

export interface CalculateTaxDTO {
  groupId: string;
  subtotal: number;
}

export interface CalculateTaxResult {
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  group?: TaxGroupItem;
}

export const taxService = {
  // Tax Rates
  getTaxRates: async (): Promise<TaxRateItem[]> => {
    const res = await apiClient.get("/tax-rates");
    return unwrap<TaxRateItem[]>(res).map(adaptTaxRate);
  },

  getActiveTaxRates: async (): Promise<TaxRateItem[]> => {
    const res = await apiClient.get("/tax-rates/active");
    return unwrap<TaxRateItem[]>(res).map(adaptTaxRate);
  },

  getTaxRateById: async (id: string): Promise<TaxRateItem> => {
    const res = await apiClient.get(`/tax-rates/${id}`);
    return unwrapAs(res, adaptTaxRate);
  },

  createTaxRate: async (data: Partial<TaxRateItem>): Promise<TaxRateItem> => {
    const res = await apiClient.post("/tax-rates", taxRateToBackend(data));
    return unwrapAs(res, adaptTaxRate);
  },

  updateTaxRate: async (id: string, data: Partial<TaxRateItem>): Promise<TaxRateItem> => {
    const res = await apiClient.put(`/tax-rates/${id}`, taxRateToBackend(data));
    return unwrapAs(res, adaptTaxRate);
  },

  // Tax Groups
  getTaxGroups: async (): Promise<TaxGroupItem[]> => {
    const res = await apiClient.get("/tax-groups");
    return unwrap<TaxGroupItem[]>(res).map(adaptTaxGroup);
  },

  getActiveTaxGroups: async (): Promise<TaxGroupItem[]> => {
    const res = await apiClient.get("/tax-groups/active");
    return unwrap<TaxGroupItem[]>(res).map(adaptTaxGroup);
  },

  getTaxGroupById: async (id: string): Promise<TaxGroupItem> => {
    const res = await apiClient.get(`/tax-groups/${id}`);
    return unwrapAs(res, adaptTaxGroup);
  },

  createTaxGroup: async (data: Partial<TaxGroupItem>): Promise<TaxGroupItem> => {
    const res = await apiClient.post("/tax-groups", taxGroupToBackend(data));
    return unwrapAs(res, adaptTaxGroup);
  },

  updateTaxGroup: async (id: string, data: Partial<TaxGroupItem>): Promise<TaxGroupItem> => {
    const res = await apiClient.put(`/tax-groups/${id}`, taxGroupToBackend(data));
    return unwrapAs(res, adaptTaxGroup);
  },

  calculateTax: async (payload: CalculateTaxDTO): Promise<CalculateTaxResult> => {
    const res = await apiClient.post("/tax-groups/calculate", payload);
    return unwrapAs(res, adaptTaxCalculation(payload.subtotal));
  },
};

function unwrapAs<T>(res: any, map: (d: any) => T): T {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return map(payload);
}
