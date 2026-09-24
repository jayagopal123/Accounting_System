import { apiClient } from "../client";
import {
  adaptTrialBalance,
  adaptProfitLoss,
  adaptBalanceSheet,
  adaptCashFlow,
  adaptGeneralLedger,
  adaptAging,
  adaptGstr,
  adaptRegister,
  adaptStatement,
} from "../adapters";

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  customerId?: string;
  supplierId?: string;
  asOfDate?: string;
  [key: string]: any;
}

export const reportService = {
  getTrialBalance: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/trial-balance", { params });
    return unwrapAs(res, adaptTrialBalance);
  },

  getGeneralLedger: async (params: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/general-ledger", { params });
    return unwrapAs(res, adaptGeneralLedger);
  },

  getProfitLoss: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/profit-loss", { params });
    return unwrapAs(res, adaptProfitLoss);
  },

  getBalanceSheet: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/balance-sheet", { params });
    return unwrapAs(res, adaptBalanceSheet);
  },

  getCashFlow: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/cash-flow", { params });
    return unwrapAs(res, adaptCashFlow);
  },

  getSalesRegister: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/sales-register", { params });
    return unwrapAs(res, (d) => adaptRegister(d).map((r: any) => ({ ...r, total: r.grandTotal })));
  },

  getPurchaseRegister: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/purchase-register", { params });
    return unwrapAs(res, (d) => adaptRegister(d).map((r: any) => ({ ...r, total: r.grandTotal })));
  },

  getCustomerStatement: async (params: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/customer-statement", { params });
    return unwrapAs(res, adaptStatement);
  },

  getVendorStatement: async (params: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/vendor-statement", { params });
    return unwrapAs(res, adaptStatement);
  },

  getArAging: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/ar-aging", { params });
    return unwrapAs(res, adaptAging);
  },

  getApAging: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/ap-aging", { params });
    return unwrapAs(res, adaptAging);
  },

  getGstr1: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/gst/gstr-1", { params });
    return unwrapAs(res, adaptGstr);
  },

  getGstr3b: async (params?: ReportFilterParams): Promise<any> => {
    const res = await apiClient.get("/reports/gst/gstr-3b", { params });
    return unwrapAs(res, adaptGstr);
  },

  exportReport: async (type: string, format: "xlsx" | "pdf", params?: Record<string, any>): Promise<{ blob: Blob; filename: string }> => {
    const res = await apiClient.get("/reports/export", {
      params: { ...params, type, format },
      responseType: "blob",
    });

    const disposition = res.headers["content-disposition"] || "";
    let filename = `${type}_report.${format}`;
    const match = disposition.match(/filename="?([^";]+)"?/i);
    if (match && match[1]) {
      filename = match[1];
    }

    return {
      blob: res.data as Blob,
      filename,
    };
  },
};

function unwrapAs<T>(res: any, map: (data: any) => T): T {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return map(payload);
}
