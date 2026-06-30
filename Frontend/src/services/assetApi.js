import api from "./api";

export const getAssets = () => api.get("/assets");
export const getAssetById = (id) => api.get(`/assets/${id}`);
export const createAsset = (data) => api.post("/assets", data);
export const updateAsset = (id, data) => api.patch(`/assets/${id}`, data);
export const activateAsset = (id) => api.patch(`/assets/${id}/activate`);
export const disposeAsset = (id, data) => api.patch(`/assets/${id}/dispose`, data);
export const runDepreciation = (id) => api.patch(`/assets/${id}/depreciate`);
export const runBulkDepreciation = () => api.post("/assets/depreciation/bulk");
export const getAssetSummary = () => api.get("/assets/summary");
export const getDepreciationSummary = () => api.get("/assets/depreciation/summary");
