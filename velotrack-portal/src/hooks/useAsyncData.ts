import { useCallback, useEffect, useState } from "react";

import { ApiError, getStatusMessage } from "@/services/http/apiError";

export type AsyncData<T> = {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  reload: () => void;
};

type Result<T> = {
  loader: unknown;
  reloadKey: number;
  data: T | null;
  error: ApiError | null;
};

export const toApiError = (error: unknown): ApiError =>
  error instanceof ApiError
    ? error
    : new ApiError(500, getStatusMessage(500), []);

// Ejecuta `loader` y guarda su resultado. El loader debe estar memorizado con
// useCallback: cuando cambia, se vuelve a cargar y se cancela la petición
// anterior. `reload` repite la carga conservando los datos mientras llega la
// nueva respuesta.
export const useAsyncData = <T>(
  loader: (signal: AbortSignal) => Promise<T>,
): AsyncData<T> => {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal).then(
      (data) => setResult({ loader, reloadKey, data, error: null }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ loader, reloadKey, data: null, error: toApiError(error) });
      },
    );
    return () => controller.abort();
  }, [loader, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const isSameLoader = result?.loader === loader;
  const isCurrent = isSameLoader && result?.reloadKey === reloadKey;

  return {
    data: isSameLoader ? (result?.data ?? null) : null,
    error: isCurrent ? (result?.error ?? null) : null,
    isLoading: !isCurrent,
    reload,
  };
};
