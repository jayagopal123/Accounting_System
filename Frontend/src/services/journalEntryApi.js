import api from "./api";

export const getJournalEntries = () => {
  return api.get("/journal-entries");
};

export const getJournalEntryById = (id) => {
  return api.get(`/journal-entries/${id}`);
};

export const createJournalEntry = (data) => {
  return api.post("/journal-entries", data);
};

export const updateJournalEntry = (id, data) => {
  return api.put(`/journal-entries/${id}`, data);
};

export const submitJournalEntry = (id) => {
  return api.patch(`/journal-entries/${id}/submit`);
};

export const cancelJournalEntry = (id) => {
  return api.patch(`/journal-entries/${id}/cancel`);
};
