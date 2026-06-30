import api from "./api";

export const getBankTransactions = (params = {}) => api.get("/bank-transactions", { params });
export const getBankTransactionById = (id) => api.get(`/bank-transactions/${id}`);
export const createBankTransaction = (data) => api.post("/bank-transactions", data);
export const getTransactionsByBankAccount = (bankAccountId) =>
  api.get(`/bank-transactions/by-account/${bankAccountId}`);
export const getUnreconciledTransactions = (bankAccountId) =>
  api.get(`/bank-transactions/unreconciled/${bankAccountId}`);
export const updateTransactionStatus = (id, status) =>
  api.patch(`/bank-transactions/${id}/status`, { status });
export const cancelBankTransaction = (id) =>
  api.patch(`/bank-transactions/${id}/cancel`);
