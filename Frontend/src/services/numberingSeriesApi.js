import api from "./api";

export const getNumberingSeries = () => api.get("/settings/numbering-series");
export const getNumberingSeriesById = (id) => api.get(`/settings/numbering-series/${id}`);
export const createNumberingSeries = (data) => api.post("/settings/numbering-series", data);
export const updateNumberingSeries = (id, data) => api.patch(`/settings/numbering-series/${id}`, data);
export const generateNextNumber = (documentType) => api.get(`/settings/numbering-series/next/${documentType}`);
