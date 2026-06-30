import api from "./api";

export const getGeneralLedger = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.accountId) query.set("accountId", params.accountId);
  const qs = query.toString();
  return api.get(`/reports/general-ledger${qs ? `?${qs}` : ""}`);
};

export const getTrialBalance = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api.get(`/reports/trial-balance${qs ? `?${qs}` : ""}`);
};

export const getProfitAndLoss = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api.get(`/reports/profit-loss${qs ? `?${qs}` : ""}`);
};

export const getBalanceSheet = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api.get(`/reports/balance-sheet${qs ? `?${qs}` : ""}`);
};

export const getCashFlow = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api.get(`/reports/cash-flow${qs ? `?${qs}` : ""}`);
};

export const getSalesRegister = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.customerId) query.set("customerId", params.customerId);
  const qs = query.toString();
  return api.get(`/reports/sales-register${qs ? `?${qs}` : ""}`);
};

export const getPurchaseRegister = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.supplierId) query.set("supplierId", params.supplierId);
  const qs = query.toString();
  return api.get(`/reports/purchase-register${qs ? `?${qs}` : ""}`);
};

export const getCustomerStatement = (params = {}) => {
  const query = new URLSearchParams();
  if (params.customerId) query.set("customerId", params.customerId);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api.get(`/reports/customer-statement${qs ? `?${qs}` : ""}`);
};

export const getVendorStatement = (params = {}) => {
  const query = new URLSearchParams();
  if (params.supplierId) query.set("supplierId", params.supplierId);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  const qs = query.toString();
  return api.get(`/reports/vendor-statement${qs ? `?${qs}` : ""}`);
};

export const getARAging = (params = {}) => {
  const query = new URLSearchParams();
  if (params.asOfDate) query.set("asOfDate", params.asOfDate);
  const qs = query.toString();
  return api.get(`/reports/ar-aging${qs ? `?${qs}` : ""}`);
};

export const getAPAging = (params = {}) => {
  const query = new URLSearchParams();
  if (params.asOfDate) query.set("asOfDate", params.asOfDate);
  const qs = query.toString();
  return api.get(`/reports/ap-aging${qs ? `?${qs}` : ""}`);
};

export const downloadReport = async (type, format, params = {}) => {
  const response = await api.get("/reports/export", {
    params: { type, format, ...params },
    responseType: "blob",
  });

  const contentDisposition = response.headers["content-disposition"];
  let filename = `${type}-${new Date().toISOString().slice(0, 10)}.${format}`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+?)"?$/);
    if (match) filename = match[1];
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
