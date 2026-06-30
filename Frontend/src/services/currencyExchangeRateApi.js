import api from "./api";

export const getExchangeRates = () => api.get("/settings/exchange-rates");
export const getExchangeRateById = (id) => api.get(`/settings/exchange-rates/${id}`);
export const createExchangeRate = (data) => api.post("/settings/exchange-rates", data);
export const updateExchangeRate = (id, data) => api.patch(`/settings/exchange-rates/${id}`, data);
export const getLatestRate = (fromCurrency, toCurrency) =>
  api.get(`/settings/exchange-rates/latest?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}`);
