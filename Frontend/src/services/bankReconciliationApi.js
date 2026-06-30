import api from "./api";

export const getReconciliations = (params = {}) => api.get("/bank-reconciliation", { params });
export const getReconciliationById = (id) => api.get(`/bank-reconciliation/${id}`);
export const createReconciliation = (data) => api.post("/bank-reconciliation", data);
export const matchTransactions = (id, transactionIds) =>
  api.patch(`/bank-reconciliation/${id}/match`, { transactionIds });
export const completeReconciliation = (id) =>
  api.patch(`/bank-reconciliation/${id}/complete`);
export const verifyReconciliation = (id) =>
  api.patch(`/bank-reconciliation/${id}/verify`);
