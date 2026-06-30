import api from "./api";

export const getAssetCategories = () => api.get("/asset-categories");
export const getAssetCategoryById = (id) => api.get(`/asset-categories/${id}`);
export const createAssetCategory = (data) => api.post("/asset-categories", data);
export const updateAssetCategory = (id, data) => api.patch(`/asset-categories/${id}`, data);
export const toggleAssetCategoryStatus = (id) => api.patch(`/asset-categories/${id}/toggle-status`);
