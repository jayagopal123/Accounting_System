import api from "./api";

export const getSuppliers = (params = {}) => {
  return api.get("/suppliers", { params });
};

export const getSupplierById = (id) => {
  return api.get(`/suppliers/${id}`);
};

export const createSupplier = (data) => {
  return api.post("/suppliers", data);
};

export const updateSupplier = (id, data) => {
  return api.put(`/suppliers/${id}`, data);
};

export const deleteSupplier = (id) => {
  return api.delete(`/suppliers/${id}`);
};

export const blockSupplier = (id) => {
  return api.patch(`/suppliers/${id}/block`);
};

export const activateSupplier = (id) => {
  return api.patch(`/suppliers/${id}/activate`);
};
