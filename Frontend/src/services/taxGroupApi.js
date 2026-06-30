import api from "./api";

export const getTaxGroups = () => {
  return api.get("/tax-groups");
};

export const getActiveTaxGroups = () => {
  return api.get("/tax-groups/active");
};

export const getTaxGroupById = (id) => {
  return api.get(`/tax-groups/${id}`);
};

export const createTaxGroup = (data) => {
  return api.post("/tax-groups", data);
};

export const updateTaxGroup = (id, data) => {
  return api.put(`/tax-groups/${id}`, data);
};

export const calculateTax = (groupId, subtotal) => {
  return api.post("/tax-groups/calculate", { groupId, subtotal });
};
