import api from "./api";

export const getCustomers = (params = {}) => {
  return api.get("/customers", { params });
};

export const getCustomerById = (id) => {
  return api.get(`/customers/${id}`);
};

export const createCustomer = (data) => {
  return api.post("/customers", data);
};

export const updateCustomer = (id, data) => {
  return api.put(`/customers/${id}`, data);
};

export const deleteCustomer = (id) => {
  return api.delete(`/customers/${id}`);
};

export const blockCustomer = (id) => {
  return api.patch(`/customers/${id}/block`);
};

export const activateCustomer = (id) => {
  return api.patch(`/customers/${id}/activate`);
};
