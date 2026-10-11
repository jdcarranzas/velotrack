import { useCallback } from "react";

import type { SessionInput, TrainingSession } from "@/models/session.model";
import type { ApiError } from "@/services/http/apiError";
import { sessionsService } from "@/services/modules/sessionsService";

import { useAsyncData } from "../useAsyncData";

export type UseSession = {
  session: TrainingSession | null;
  error: ApiError | null;
  isLoading: boolean;
  updateSession: (input: SessionInput) => Promise<TrainingSession>;
  updateObservations: (observations: string | null) => Promise<void>;
};

// Una sesión de captura con sus ediciones. Cada edición envía la versión que se
// leyó; si otro la cambió antes, la API responde 409.
export const useSession = (sessionId: string): UseSession => {
  const loader = useCallback(
    (signal: AbortSignal) => sessionsService.getSession(sessionId, { signal }),
    [sessionId],
  );
  const { data, error, isLoading, reload } = useAsyncData(loader);

  const updateSession = useCallback(
    (input: SessionInput) => sessionsService.updateSession(sessionId, input),
    [sessionId],
  );

  const version = data?.version;
  const updateObservations = useCallback(
    async (observations: string | null) => {
      if (version === undefined) return;
      await sessionsService.updateObservations(
        sessionId,
        version,
        observations,
      );
      reload();
    },
    [sessionId, version, reload],
  );

  return {
    session: data,
    error,
    isLoading: isLoading && !data,
    updateSession,
    updateObservations,
  };
};

// POST /api/v1/sessions
export const useCreateSession = () =>
  useCallback(
    (input: SessionInput) => sessionsService.createSession(input),
    [],
  );
