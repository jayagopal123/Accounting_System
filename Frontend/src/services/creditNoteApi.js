import api from "./api";

export const getCreditNotes = () => {
  return api.get("/credit-notes");
};

export const getCreditNoteById = (id) => {
  return api.get(`/credit-notes/${id}`);
};

export const createCreditNote = (data) => {
  return api.post("/credit-notes", data);
};

export const updateCreditNote = (id, data) => {
  return api.put(`/credit-notes/${id}`, data);
};

export const submitCreditNote = (id) => {
  return api.patch(`/credit-notes/${id}/submit`);
};

export const cancelCreditNote = (id) => {
  return api.patch(`/credit-notes/${id}/cancel`);
};
