import { apiClient } from "../client";
import { unwrap } from "../normalize";
import {
  adaptFiscalYear,
  fiscalYearToBackend,
  adaptNumberingSeries,
  numberingSeriesToBackend,
  adaptCostCenter,
  costCenterToBackend,
} from "../adapters";

export interface FiscalYearItem {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  createdAt?: string;
}

export interface NumberingSeriesItem {
  _id: string;
  documentType: string;
  prefix: string;
  padding: number;
  nextNumber: number;
  suffix?: string;
  description?: string;
}

export interface CostCenterItem {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  description?: string;
}

export const settingsService = {
  // Fiscal Years
  getFiscalYears: async (): Promise<FiscalYearItem[]> => {
    const res = await apiClient.get("/settings/fiscal-years");
    return unwrap<FiscalYearItem[]>(res).map(adaptFiscalYear);
  },

  getFiscalYearById: async (id: string): Promise<FiscalYearItem> => {
    const res = await apiClient.get(`/settings/fiscal-years/${id}`);
    return unwrapAs(res, adaptFiscalYear);
  },

  createFiscalYear: async (data: Partial<FiscalYearItem>): Promise<FiscalYearItem> => {
    const res = await apiClient.post("/settings/fiscal-years", fiscalYearToBackend(data));
    return unwrapAs(res, adaptFiscalYear);
  },

  updateFiscalYear: async (id: string, data: Partial<FiscalYearItem>): Promise<FiscalYearItem> => {
    const res = await apiClient.patch(`/settings/fiscal-years/${id}`, fiscalYearToBackend(data));
    return unwrapAs(res, adaptFiscalYear);
  },

  closeFiscalYear: async (id: string): Promise<FiscalYearItem> => {
    const res = await apiClient.patch(`/settings/fiscal-years/${id}/close`);
    return unwrapAs(res, adaptFiscalYear);
  },

  // Numbering Series
  getNumberingSeries: async (): Promise<NumberingSeriesItem[]> => {
    const res = await apiClient.get("/settings/numbering-series");
    return unwrap<NumberingSeriesItem[]>(res).map(adaptNumberingSeries);
  },

  createNumberingSeries: async (data: Partial<NumberingSeriesItem>): Promise<NumberingSeriesItem> => {
    const res = await apiClient.post("/settings/numbering-series", numberingSeriesToBackend(data));
    return unwrapAs(res, adaptNumberingSeries);
  },

  updateNumberingSeries: async (id: string, data: Partial<NumberingSeriesItem>): Promise<NumberingSeriesItem> => {
    const res = await apiClient.patch(`/settings/numbering-series/${id}`, numberingSeriesToBackend(data));
    return unwrapAs(res, adaptNumberingSeries);
  },

  getNextNumber: async (documentType: string): Promise<string> => {
    const res = await apiClient.get(`/settings/numbering-series/next/${documentType}`);
    const data = unwrap<{ nextNumber: string }>(res);
    return data.nextNumber;
  },

  // Cost Centers
  getCostCenters: async (): Promise<CostCenterItem[]> => {
    const res = await apiClient.get("/cost-centers");
    return unwrap<CostCenterItem[]>(res).map(adaptCostCenter);
  },

  createCostCenter: async (data: Partial<CostCenterItem>): Promise<CostCenterItem> => {
    const res = await apiClient.post("/cost-centers", costCenterToBackend(data));
    return unwrapAs(res, adaptCostCenter);
  },

  updateCostCenter: async (id: string, data: Partial<CostCenterItem>): Promise<CostCenterItem> => {
    const res = await apiClient.patch(`/cost-centers/${id}`, costCenterToBackend(data));
    return unwrapAs(res, adaptCostCenter);
  },
};

function unwrapAs<T>(res: any, map: (d: any) => T): T {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return map(payload);
}
