import api from "./api";

export const getFiscalYears = () => api.get("/settings/fiscal-years");
export const getFiscalYearById = (id) => api.get(`/settings/fiscal-years/${id}`);
export const createFiscalYear = (data) => api.post("/settings/fiscal-years", data);
export const updateFiscalYear = (id, data) => api.patch(`/settings/fiscal-years/${id}`, data);
export const closeFiscalYear = (id) => api.patch(`/settings/fiscal-years/${id}/close`);
