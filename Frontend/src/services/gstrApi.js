import api from "./api";

export const getGSTR1 = (params = {}) => {
  return api.get("/reports/gst/gstr-1", { params });
};

export const getGSTR3B = (params = {}) => {
  return api.get("/reports/gst/gstr-3b", { params });
};
