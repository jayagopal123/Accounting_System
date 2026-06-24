import api from "./api";

export const getSalesInvoices = () => {
  return api.get("/sales-invoices");
};

export const getSalesInvoiceById = (id) => {
  return api.get(`/sales-invoices/${id}`);
};

export const createSalesInvoice = (data) => {
  return api.post("/sales-invoices", data);
};

export const updateSalesInvoice = (id, data) => {
  return api.put(`/sales-invoices/${id}`, data);
};

export const submitSalesInvoice = (id) => {
  return api.patch(`/sales-invoices/${id}/submit`);
};

export const cancelSalesInvoice = (id) => {
  return api.patch(`/sales-invoices/${id}/cancel`);
};
