import { apiClient } from "../client";
import { type Paged } from "../normalize";
import { adaptJournalEntry, adaptJournalEntryList, journalEntryToBackend } from "../adapters";
import { type AccountItem } from "./accountService";

export interface JournalEntryLine {
  _id?: string;
  account: string | AccountItem;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntryItem {
  _id: string;
  entryNumber: string;
  entryDate: string;
  referenceType?: "Sales" | "Purchase" | "Payment" | "Receipt" | "Contra" | "Other" | string;
  referenceNumber?: string;
  remarks?: string;
  items: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: "Draft" | "Submitted" | "Cancelled";
  createdAt?: string;
}

export const journalEntryService = {
  getJournalEntries: async (params?: { page?: number; limit?: number; status?: string }): Promise<Paged<JournalEntryItem>> => {
    const res = await apiClient.get("/journal-entries", { params });
    return adaptJournalEntryList(res);
  },

  getJournalEntryById: async (id: string): Promise<JournalEntryItem> => {
    const res = await apiClient.get(`/journal-entries/${id}`);
    return unwrapAsJe(res);
  },

  createJournalEntry: async (data: Partial<JournalEntryItem>): Promise<JournalEntryItem> => {
    const res = await apiClient.post("/journal-entries", journalEntryToBackend(data));
    return unwrapAsJe(res);
  },

  updateJournalEntry: async (id: string, data: Partial<JournalEntryItem>): Promise<JournalEntryItem> => {
    const res = await apiClient.put(`/journal-entries/${id}`, journalEntryToBackend(data));
    return unwrapAsJe(res);
  },

  submitJournalEntry: async (id: string): Promise<JournalEntryItem> => {
    const res = await apiClient.patch(`/journal-entries/${id}/submit`);
    return unwrapAsJe(res);
  },

  cancelJournalEntry: async (id: string): Promise<JournalEntryItem> => {
    const res = await apiClient.patch(`/journal-entries/${id}/cancel`);
    return unwrapAsJe(res);
  },
};

function unwrapAsJe(res: any): JournalEntryItem {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return adaptJournalEntry(payload);
}
