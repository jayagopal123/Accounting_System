import { type AxiosResponse } from "axios";

export interface Paged<T> {
  items: T[];
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
}

/**
 * Unwraps single response payload from standard backend envelope (response.data.data or response.data)
 */
export function unwrap<T>(response: AxiosResponse<any>): T {
  const data = response.data;
  if (data && typeof data === "object") {
    if ("data" in data) {
      return data.data as T;
    }
  }
  return data as T;
}

/**
 * Normalizes different pagination envelopes across the backend into a consistent Paged<T> structure.
 */
export function normalizePaged<T>(response: AxiosResponse<any>): Paged<T> {
  const root = response.data;
  const payload = root?.data !== undefined ? root.data : root;

  // Case 1: Customers { customers: [], totalPages, page, totalCustomers }
  if (payload && Array.isArray(payload.customers)) {
    return {
      items: payload.customers,
      page: payload.page || 1,
      totalPages: payload.totalPages || 1,
      total: payload.totalCustomers || payload.total || payload.customers.length,
    };
  }

  // Case 2: Suppliers { suppliers: [], totalPages, page, totalSuppliers }
  if (payload && Array.isArray(payload.suppliers)) {
    return {
      items: payload.suppliers,
      page: payload.page || 1,
      totalPages: payload.totalPages || 1,
      total: payload.totalSuppliers || payload.total || payload.suppliers.length,
    };
  }

  // Case 3: Notifications double-nested data.data or { notifications: [] }
  if (payload && payload.data && Array.isArray(payload.data)) {
    return {
      items: payload.data,
      page: payload.page || 1,
      totalPages: payload.totalPages || 1,
      total: payload.total || payload.data.length,
    };
  }

  // Case 4: Standard { data: T[], total, page, totalPages }
  if (payload && Array.isArray(payload.items)) {
    return {
      items: payload.items,
      page: payload.page || 1,
      totalPages: payload.totalPages || 1,
      total: payload.total || payload.items.length,
    };
  }

  // Case 5: Direct array returned in payload
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 1,
      totalPages: 1,
      total: payload.length,
    };
  }

  // Fallback empty
  return {
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
  };
}
