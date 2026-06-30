import api from "./api";

export const getBudgets = () => api.get("/budgets");
export const getBudgetById = (id) => api.get(`/budgets/${id}`);
export const createBudget = (data) => api.post("/budgets", data);
export const updateBudget = (id, data) => api.patch(`/budgets/${id}`, data);
export const approveBudget = (id) => api.patch(`/budgets/${id}/approve`);
export const closeBudget = (id) => api.patch(`/budgets/${id}/close`);
export const getBudgetVsActual = (id) => api.get(`/budgets/${id}/vs-actual`);
