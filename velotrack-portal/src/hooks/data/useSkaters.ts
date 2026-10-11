import { useCallback, useMemo } from "react";

import { useCoachSession } from "@/context/CoachSession";
import type { SkaterInput } from "@/models/talent.model";
import { buildSkaterRows, type SkaterRow } from "@/models/talent.selectors";
import type { ApiError } from "@/services/http/apiError";
import { talentService } from "@/services/modules/talentService";

import { useAsyncData } from "../useAsyncData";
import { useToday } from "../useToday";

export type UseSkaters = {
  rows: SkaterRow[];
  error: ApiError | null;
  isLoading: boolean;
  reload: () => void;
  registerSkater: (input: SkaterInput) => Promise<void>;
};

// Patinadores de todos los equipos del entrenador, cruzados con los catálogos.
// talentms solo lista por equipo, así que se pide un equipo a la vez en paralelo.
export const useSkaters = (): UseSkaters => {
  const { coachId, coach, coachError, catalogs, catalogsError, isLoading } =
    useCoachSession();
  const today = useToday();
  const teamIdsKey = coach ? coach.teamIds.join(",") : null;

  const loader = useCallback(
    async (signal: AbortSignal) => {
      if (!teamIdsKey) return [];
      const lists = await Promise.all(
        teamIdsKey.split(",").map((teamId) =>
          talentService.listSkatersByTeam(Number(teamId), {
            coachId,
            signal,
          }),
        ),
      );
      return lists.flat();
    },
    [coachId, teamIdsKey],
  );
  const skaters = useAsyncData(loader);

  const rows = useMemo(
    () => buildSkaterRows(skaters.data ?? [], catalogs, today),
    [skaters.data, catalogs, today],
  );

  const { reload } = skaters;
  const registerSkater = useCallback(
    async (input: SkaterInput) => {
      await talentService.registerSkater(input);
      reload();
    },
    [reload],
  );

  return {
    rows,
    error: coachError ?? catalogsError ?? skaters.error,
    isLoading:
      isLoading ||
      (!coach && !coachError) ||
      (skaters.isLoading && !skaters.data),
    reload,
    registerSkater,
  };
};
