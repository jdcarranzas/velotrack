import { API_BASE_PATH } from "@/utils/constants/api";

import { ApiError, getStatusMessage, toApiError } from "./apiError";

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type Method = "GET" | "POST" | "PUT" | "PATCH";

// Arma la URL relativa al portal. Los valores null o undefined no se envían.
export const buildUrl = (
  path: string,
  query?: Record<string, QueryValue>,
): string => {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined)
      params.append(key, String(value));
  });
  const search = params.toString();
  return `${API_BASE_PATH}${path}${search ? `?${search}` : ""}`;
};

const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async <T>(
  method: Method,
  path: string,
  { query, body, headers, signal }: RequestOptions = {},
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    // Una petición cancelada no es un error de la API: se propaga tal cual.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(0, getStatusMessage(0), []);
  }

  const data = await readBody(response);
  if (!response.ok) {
    const apiError = toApiError(response.status, data);
    console.warn(`${method} ${path} respondió ${response.status}`, data);
    throw apiError;
  }
  return data as T;
};

// Cliente HTTP de la gateway. Solo lo usan los servicios de src/services/modules.
export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),
};
