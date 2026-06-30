import api from "./api";

export const getDebitNotes = () => {
  return api.get("/debit-notes");
};

export const getDebitNoteById = (id) => {
  return api.get(`/debit-notes/${id}`);
};

export const createDebitNote = (data) => {
  return api.post("/debit-notes", data);
};

export const updateDebitNote = (id, data) => {
  return api.put(`/debit-notes/${id}`, data);
};

export const submitDebitNote = (id) => {
  return api.patch(`/debit-notes/${id}/submit`);
};

export const cancelDebitNote = (id) => {
  return api.patch(`/debit-notes/${id}/cancel`);
};
