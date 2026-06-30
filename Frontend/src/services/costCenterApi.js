import api from "./api";

export const getCostCenters = () => api.get("/cost-centers");
export const getCostCenterById = (id) => api.get(`/cost-centers/${id}`);
export const createCostCenter = (data) => api.post("/cost-centers", data);
export const updateCostCenter = (id, data) => api.patch(`/cost-centers/${id}`, data);
