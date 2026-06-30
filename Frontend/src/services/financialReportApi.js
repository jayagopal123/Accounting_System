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
