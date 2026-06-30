import api from "./api";

export const getPayments = () => {
  return api.get("/payments");
};

export const getPaymentById = (id) => {
  return api.get(`/payments/${id}`);
};

export const createPayment = (data) => {
  return api.post("/payments", data);
};

export const submitPayment = (id) => {
  return api.patch(`/payments/${id}/submit`);
};

export const cancelPayment = (id) => {
  return api.patch(`/payments/${id}/cancel`);
};
