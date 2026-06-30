import api from "./api";

export const getTaxRates = () => {
  return api.get("/tax-rates");
};

export const getActiveTaxRates = () => {
  return api.get("/tax-rates/active");
};

export const getTaxRateById = (id) => {
  return api.get(`/tax-rates/${id}`);
};

export const createTaxRate = (data) => {
  return api.post("/tax-rates", data);
};

export const updateTaxRate = (id, data) => {
  return api.put(`/tax-rates/${id}`, data);
};
