import { apiClient } from "../client";
import { unwrap } from "../normalize";
import { adaptAging } from "../adapters";

/** Backend activity log: performedBy may be populated or missing performedByName. */
const adaptActivity = (a: any): ActivityItem => ({
  ...a,
  performedByName: a.performedByName ?? a.performedBy?.name ?? "System",
  entityName: a.entityName ?? "",
});

export interface DashboardSummary {
  totalActiveLedgerAccounts: number;
  totalActiveReceivableAccounts: number;
  totalActivePayableAccounts: number;
  totalUnpostedJournalEntries: number;
}

export interface ActivityItem {
  _id: string;
  action: "Created" | "Submitted" | "Updated" | "Cancelled" | "Deleted" | "Activated" | "Blocked" | string;
  entity: string;
  entityName: string;
  description: string;
  performedByName: string;
  createdAt: string;
}

/**
 * A single day of the cash-flow pulse series.
 * ⚠ VERIFY: the backend does not expose this endpoint yet. In live (non-mock) mode this
 * call will 404; the dashboard falls back to computing the pulse from the trial-balance
 * report, so this adapter is safe to delete without breaking the page.
 */
export interface CashFlowDay {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
}

/** AR/AP aging bucket row (same shape as the ar-aging / ap-aging reports). */
export interface AgingRow {
  partyName: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  total: number;
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get("/dashboard/summary");
    return unwrap<DashboardSummary>(res);
  },

  getRecentActivities: async (limit: number = 10): Promise<ActivityItem[]> => {
    const res = await apiClient.get(`/dashboard/recent-activities?limit=${limit}`);
    return unwrap<ActivityItem[]>(res).map(adaptActivity);
  },

  /** Daily cash series — served by the backend from submitted Payments. */
  getCashFlowSeries: async (days: number = 30): Promise<CashFlowDay[]> => {
    const res = await apiClient.get("/dashboard/cash-flow-series", { params: { days } });
    return unwrap<CashFlowDay[]>(res);
  },

  /** Aging rows — reuses the AR/AP aging report endpoints, adapted to party rows. */
  getArAging: async (): Promise<AgingRow[]> => {
    const res = await apiClient.get("/reports/ar-aging", { params: { asOfDate: new Date().toISOString().slice(0, 10) } });
    return adaptAging(unwrap<any>(res)) as AgingRow[];
  },

  getApAging: async (): Promise<AgingRow[]> => {
    const res = await apiClient.get("/reports/ap-aging", { params: { asOfDate: new Date().toISOString().slice(0, 10) } });
    return adaptAging(unwrap<any>(res)) as AgingRow[];
  },
};
