import api from "./api";

export const getPurchaseInvoices = () => {
  return api.get("/purchase-invoices");
};

export const getPurchaseInvoiceById = (id) => {
  return api.get(`/purchase-invoices/${id}`);
};

export const createPurchaseInvoice = (data) => {
  return api.post("/purchase-invoices", data);
};

export const updatePurchaseInvoice = (id, data) => {
  return api.put(`/purchase-invoices/${id}`, data);
};

export const submitPurchaseInvoice = (id) => {
  return api.patch(`/purchase-invoices/${id}/submit`);
};

export const cancelPurchaseInvoice = (id) => {
  return api.patch(`/purchase-invoices/${id}/cancel`);
};
