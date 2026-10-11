import { useCallback, useState } from "react";

import type { ApiError } from "@/services/http/apiError";

import { toApiError } from "./useAsyncData";

export type SubmitResult<T> =
  { ok: true; data: T } | { ok: false; error: ApiError };

export type Submit<Args extends unknown[], T> = {
  submit: (...args: Args) => Promise<SubmitResult<T>>;
  isSubmitting: boolean;
  // Último error, para mostrarlo en el formulario
  error: ApiError | null;
  resetError: () => void;
};

// Envía una escritura a la API y guarda su estado para el formulario.
export const useSubmit = <Args extends unknown[], T>(
  action: (...args: Args) => Promise<T>,
): Submit<Args, T> => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const submit = useCallback(
    async (...args: Args): Promise<SubmitResult<T>> => {
      setIsSubmitting(true);
      setError(null);
      try {
        return { ok: true, data: await action(...args) };
      } catch (caught) {
        const apiError = toApiError(caught);
        setError(apiError);
        return { ok: false, error: apiError };
      } finally {
        setIsSubmitting(false);
      }
    },
    [action],
  );

  const resetError = useCallback(() => setError(null), []);

  return { submit, isSubmitting, error, resetError };
};
