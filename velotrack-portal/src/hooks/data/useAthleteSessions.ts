import { useCallback } from "react";

import type { TrainingSession } from "@/models/session.model";
import type { ApiError } from "@/services/http/apiError";
import { sessionsService } from "@/services/modules/sessionsService";

import { useAsyncData } from "../useAsyncData";

export type AthleteSessionsQuery = {
  from: string;
  to: string;
  limit: number;
  offset: number;
};

export type UseAthleteSessions = {
  sessions: TrainingSession[];
  error: ApiError | null;
  isLoading: boolean;
};

// Historial de sesiones de un patinador (id de talentms). Sin athleteId no
// pide nada.
export const useAthleteSessions = (
  athleteId: number | null,
  { from, to, limit, offset }: AthleteSessionsQuery,
): UseAthleteSessions => {
  const loader = useCallback(
    async (signal: AbortSignal) =>
      athleteId !== null
        ? sessionsService.listAthleteSessions(athleteId, {
            from,
            to,
            limit,
            offset,
            signal,
          })
        : [],
    [athleteId, from, to, limit, offset],
  );
  const { data, error, isLoading } = useAsyncData(loader);
  return { sessions: data ?? [], error, isLoading };
};
