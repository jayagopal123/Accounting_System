import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { handleMockRequest } from "./mocks/adapter";

export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:5000/api/v1/auth";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authClient: AxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock interceptor adapter when VITE_USE_MOCKS=true
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

if (USE_MOCKS) {
  apiClient.defaults.adapter = async (config) => {
    const mockRes = await handleMockRequest(config);
    if (mockRes) return mockRes;
    return defaultAdapter(config);
  };

  authClient.defaults.adapter = async (config) => {
    const mockRes = await handleMockRequest(config);
    if (mockRes) return mockRes;
    return defaultAdapter(config);
  };
}

// Request interceptor to attach Bearer token
function attachToken(config: InternalAxiosRequestConfig) {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

apiClient.interceptors.request.use(attachToken);
authClient.interceptors.request.use(attachToken);

// Response interceptor
function handleResponseError(error: AxiosError) {
  if (!error.response) {
    return Promise.reject(new ApiError(error.message || "Network error occurred", 0));
  }

  const status = error.response.status;
  const data = error.response.data as any;

  if (status === 401) {
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      const current = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?redirect=${current}`;
    }
    return Promise.reject(new ApiError("Session expired. Please log in again.", 401, "UNAUTHORIZED"));
  }

  if (status === 403) {
    return Promise.reject(
      new ApiError(
        data?.message || "You do not have permission to perform this action.",
        403,
        "FORBIDDEN"
      )
    );
  }

  const message = data?.error?.message || data?.message || error.message || "An unexpected error occurred";
  const fieldErrors = data?.fieldErrors || data?.errors || undefined;

  return Promise.reject(new ApiError(message, status, data?.code, fieldErrors));
}

apiClient.interceptors.response.use((res) => res, handleResponseError);
authClient.interceptors.response.use((res) => res, handleResponseError);

export default apiClient;
