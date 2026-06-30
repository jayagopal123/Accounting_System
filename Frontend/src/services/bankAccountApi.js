import api from "./api";

export const getBankAccounts = () => api.get("/bank-accounts");
export const getBankAccountById = (id) => api.get(`/bank-accounts/${id}`);
export const createBankAccount = (data) => api.post("/bank-accounts", data);
export const updateBankAccount = (id, data) => api.patch(`/bank-accounts/${id}`, data);
export const toggleBankAccountStatus = (id) => api.patch(`/bank-accounts/${id}/toggle-status`);
