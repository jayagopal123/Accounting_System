import { apiClient } from "../client";
import { adaptAccount, adaptAccountTree, accountStatusToBackend } from "../adapters";

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";

export interface AccountItem {
  _id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentAccount?: string | AccountItem | null;
  isGroup: boolean;
  balance?: number;
  status: "Active" | "Inactive";
  createdAt?: string;
}

export interface CreateAccountDTO {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentAccount?: string | null;
  isGroup?: boolean;
}

/**
 * Single source of truth helper for identifying cash & bank accounts.
 * Isolates code 1201/1202 or name heuristics so backend changes only touch here.
 */
export function isCashOrBankAccount(account?: AccountItem | null): boolean {
  if (!account) return false;
  const code = account.accountCode || "";
  const name = (account.accountName || "").toLowerCase();
  return (
    code.startsWith("120") ||
    name.includes("cash") ||
    name.includes("bank") ||
    name.includes("petty cash")
  );
}

function unwrapAsAccount(res: any): AccountItem {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return adaptAccount(payload);
}

export const accountService = {
  getAccounts: async (): Promise<AccountItem[]> => {
    const res = await apiClient.get("/accounts");
    const data = res.data;
    const payload = data && typeof data === "object" && "data" in data ? data.data : data;
    return (Array.isArray(payload) ? payload : []).map(adaptAccount);
  },

  getAccountTree: async (): Promise<AccountItem[]> => {
    const res = await apiClient.get("/accounts/tree");
    const data = res.data;
    const payload = data && typeof data === "object" && "data" in data ? data.data : data;
    return adaptAccountTree(payload) as AccountItem[];
  },

  getAccountById: async (id: string): Promise<AccountItem> => {
    const res = await apiClient.get(`/accounts/${id}`);
    return unwrapAsAccount(res);
  },

  getNextAccountCode: async (): Promise<string> => {
    const res = await apiClient.get("/accounts/next-code");
    const data = res.data;
    const payload = data && typeof data === "object" && "data" in data ? data.data : data;
    return payload.accountCode;
  },

  createAccount: async (data: CreateAccountDTO): Promise<AccountItem> => {
    const res = await apiClient.post("/accounts", data);
    return unwrapAsAccount(res);
  },

  updateAccount: async (id: string, data: Partial<CreateAccountDTO>): Promise<AccountItem> => {
    const res = await apiClient.put(`/accounts/${id}`, data);
    return unwrapAsAccount(res);
  },

  deleteAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`);
  },

  updateStatus: async (id: string, status: "Active" | "Inactive"): Promise<AccountItem> => {
    // Backend enum expects ACTIVE / INACTIVE
    const res = await apiClient.patch(`/accounts/${id}/status`, {
      status: accountStatusToBackend(status),
    });
    return unwrapAsAccount(res);
  },
};
