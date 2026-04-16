import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "lms.token";

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && window.location.pathname !== "/login") {
      setAuthToken(null);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export type ApiError = {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
};

export function extractApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; fieldErrors?: Record<string, string>; status?: number }
      | undefined;
    return {
      status: err.response?.status ?? 0,
      message: data?.message ?? err.message,
      fieldErrors: data?.fieldErrors,
    };
  }
  return { status: 0, message: "Unexpected error" };
}
