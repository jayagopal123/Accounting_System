import { apiClient } from "../client";
import { type Paged } from "../normalize";
import { adaptBudget, adaptBudgetList, adaptBudgetVsActual, budgetToBackend } from "../adapters";
import { type AccountItem } from "./accountService";

export interface BudgetItem {
  _id: string;
  name: string;
  fiscalYear: string;
  account: string | AccountItem;
  budgetAmount: number;
  actualAmount?: number;
  status: "Draft" | "Approved" | "Closed";
  remarks?: string;
  createdAt?: string;
}

export interface BudgetVsActualPeriod {
  month: string;
  budget: number;
  actual: number;
}

export interface BudgetVsActualResponse {
  budget: BudgetItem;
  actual: number;
  variance: number;
  utilizationPercentage: number;
  breakdown: BudgetVsActualPeriod[];
}

export const budgetService = {
  getBudgets: async (params?: Record<string, any>): Promise<Paged<BudgetItem>> => {
    const res = await apiClient.get("/budgets", { params });
    return adaptBudgetList(res);
  },

  getBudgetById: async (id: string): Promise<BudgetItem> => {
    const res = await apiClient.get(`/budgets/${id}`);
    return unwrapAsBudget(res);
  },

  createBudget: async (data: Partial<BudgetItem>): Promise<BudgetItem> => {
    const res = await apiClient.post("/budgets", budgetToBackend(data));
    return unwrapAsBudget(res);
  },

  updateBudget: async (id: string, data: Partial<BudgetItem>): Promise<BudgetItem> => {
    const res = await apiClient.patch(`/budgets/${id}`, budgetToBackend(data));
    return unwrapAsBudget(res);
  },

  approveBudget: async (id: string): Promise<BudgetItem> => {
    const res = await apiClient.patch(`/budgets/${id}/approve`);
    return unwrapAsBudget(res);
  },

  closeBudget: async (id: string): Promise<BudgetItem> => {
    const res = await apiClient.patch(`/budgets/${id}/close`);
    return unwrapAsBudget(res);
  },

  getBudgetVsActual: async (id: string): Promise<BudgetVsActualResponse> => {
    const res = await apiClient.get(`/budgets/${id}/vs-actual`);
    const data = res.data;
    const payload = data && typeof data === "object" && "data" in data ? data.data : data;
    return adaptBudgetVsActual(payload);
  },
};

function unwrapAsBudget(res: any): BudgetItem {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return adaptBudget(payload);
}
