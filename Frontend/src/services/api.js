import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach Authorization header from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error.message,
    ),
);

export default api;
