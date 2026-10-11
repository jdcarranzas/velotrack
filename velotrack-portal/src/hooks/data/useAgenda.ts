import { useCallback } from "react";

import type { TrainingSession } from "@/models/session.model";
import type { ApiError } from "@/services/http/apiError";
import { sessionsService } from "@/services/modules/sessionsService";

import { useAsyncData } from "../useAsyncData";

export type AgendaQuery = {
  from: string;
  to: string;
  team: boolean;
  limit: number;
  offset: number;
};

export type UseAgenda = {
  sessions: TrainingSession[];
  error: ApiError | null;
  isLoading: boolean;
};

// Sesiones PROGRAMADA del entrenador o de su equipo en un rango [from, to).
export const useAgenda = ({
  from,
  to,
  team,
  limit,
  offset,
}: AgendaQuery): UseAgenda => {
  const loader = useCallback(
    (signal: AbortSignal) =>
      sessionsService.listAgenda({ from, to, team, limit, offset, signal }),
    [from, to, team, limit, offset],
  );
  const { data, error, isLoading } = useAsyncData(loader);
  return { sessions: data ?? [], error, isLoading };
};
