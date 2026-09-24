import { apiClient } from "../client";
import { unwrap, type Paged } from "../normalize";
import {
  adaptBankAccount,
  bankAccountToBackend,
  adaptBankTransaction,
  bankTransactionToBackend,
  adaptBankReconciliation,
  bankReconciliationToBackend,
} from "../adapters";
import { type AccountItem } from "./accountService";

export interface BankAccountItem {
  _id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  branch?: string;
  ifscCode?: string;
  glAccount?: string | AccountItem;
  currentBalance?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface BankTransactionItem {
  _id: string;
  bankAccount: string | BankAccountItem;
  transactionDate: string;
  type: "Deposit" | "Withdrawal";
  amount: number;
  referenceNumber?: string;
  description?: string;
  status: "Unreconciled" | "Reconciled" | "Cancelled";
  createdAt?: string;
}

export interface BankReconciliationItem {
  _id: string;
  bankAccount: string | BankAccountItem;
  statementStartDate: string;
  statementEndDate: string;
  openingBalance: number;
  closingBalance: number;
  clearedBalance: number;
  difference: number;
  status: "Draft" | "Completed" | "Verified";
  notes?: string;
  reconciledTransactions?: string[];
  createdAt?: string;
}

export const bankingService = {
  // Bank Accounts
  getBankAccounts: async (): Promise<BankAccountItem[]> => {
    const res = await apiClient.get("/bank-accounts");
    return unwrap<BankAccountItem[]>(res).map(adaptBankAccount);
  },

  getBankAccountById: async (id: string): Promise<BankAccountItem> => {
    const res = await apiClient.get(`/bank-accounts/${id}`);
    return unwrapAs(res, adaptBankAccount);
  },

  createBankAccount: async (data: Partial<BankAccountItem>): Promise<BankAccountItem> => {
    const res = await apiClient.post("/bank-accounts", bankAccountToBackend(data));
    return unwrapAs(res, adaptBankAccount);
  },

  updateBankAccount: async (id: string, data: Partial<BankAccountItem>): Promise<BankAccountItem> => {
    const res = await apiClient.patch(`/bank-accounts/${id}`, bankAccountToBackend(data));
    return unwrapAs(res, adaptBankAccount);
  },

  toggleBankAccountStatus: async (id: string): Promise<BankAccountItem> => {
    const res = await apiClient.patch(`/bank-accounts/${id}/toggle-status`);
    return unwrapAs(res, adaptBankAccount);
  },

  // Bank Transactions
  getBankTransactions: async (params?: Record<string, any>): Promise<Paged<BankTransactionItem>> => {
    const res = await apiClient.get("/bank-transactions", { params });
    const page = normalizePagedAny(res);
    return { ...page, items: page.items.map(adaptBankTransaction) };
  },

  getUnreconciledTransactions: async (bankAccountId: string): Promise<BankTransactionItem[]> => {
    const res = await apiClient.get(`/bank-transactions/unreconciled/${bankAccountId}`);
    return unwrap<BankTransactionItem[]>(res).map(adaptBankTransaction);
  },

  createBankTransaction: async (data: Partial<BankTransactionItem>): Promise<BankTransactionItem> => {
    const res = await apiClient.post("/bank-transactions", bankTransactionToBackend(data));
    return unwrapAs(res, adaptBankTransaction);
  },

  // Bank Reconciliations
  getBankReconciliations: async (params?: { bankAccount?: string }): Promise<Paged<BankReconciliationItem>> => {
    const res = await apiClient.get("/bank-reconciliation", { params });
    const page = normalizePagedAny(res);
    return { ...page, items: page.items.map(adaptBankReconciliation) };
  },

  getBankReconciliationById: async (id: string): Promise<BankReconciliationItem> => {
    const res = await apiClient.get(`/bank-reconciliation/${id}`);
    return unwrapAs(res, adaptBankReconciliation);
  },

  createBankReconciliation: async (data: Partial<BankReconciliationItem>): Promise<BankReconciliationItem> => {
    const res = await apiClient.post("/bank-reconciliation", bankReconciliationToBackend(data));
    return unwrapAs(res, adaptBankReconciliation);
  },

  matchTransactions: async (id: string, transactionIds: string[]): Promise<BankReconciliationItem> => {
    const res = await apiClient.patch(`/bank-reconciliation/${id}/match`, { transactionIds });
    return unwrapAs(res, adaptBankReconciliation);
  },

  completeReconciliation: async (id: string): Promise<BankReconciliationItem> => {
    const res = await apiClient.patch(`/bank-reconciliation/${id}/complete`);
    return unwrapAs(res, adaptBankReconciliation);
  },

  verifyReconciliation: async (id: string): Promise<BankReconciliationItem> => {
    const res = await apiClient.patch(`/bank-reconciliation/${id}/verify`);
    return unwrapAs(res, adaptBankReconciliation);
  },
};

function unwrapAs<T>(res: any, map: (d: any) => T): T {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return map(payload);
}

function normalizePagedAny(res: any): Paged<any> {
  const root = res.data;
  const payload = root?.data !== undefined ? root.data : root;
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.data) ? payload.data : [];
  return { items, page: payload?.page ?? 1, totalPages: payload?.totalPages ?? 1, total: payload?.total ?? items.length };
}
