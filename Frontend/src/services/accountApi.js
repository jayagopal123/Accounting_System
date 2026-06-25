import api from "./api";

export const getAccounts = () => {
  return api.get("/accounts");
};

export const getAccountTree = () => {
  return api.get("/accounts/tree");
};

export const getAccountById = (id) => {
  return api.get(`/accounts/${id}`);
};

export const getNextAccountCode = () => {
  return api.get("/accounts/next-code");
};

export const createAccount = (data) => {
  return api.post("/accounts", data);
};

export const updateAccount = (id, data) => {
  return api.put(`/accounts/${id}`, data);
};

export const deleteAccount = (id) => {
  return api.delete(`/accounts/${id}`);
};

export const updateStatus = (id, status) => {
  return api.patch(`/accounts/${id}/status`, {
    status,
  });
};
