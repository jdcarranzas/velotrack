import { useCallback } from "react";

import { useCoachSession } from "@/context/CoachSession";
import type {
  AccessAuditEntry,
  Coach,
  CoachAccess,
  CoachInput,
} from "@/models/talent.model";
import type { ApiError } from "@/services/http/apiError";
import { talentService } from "@/services/modules/talentService";

import { useAsyncData } from "../useAsyncData";

export type CoachDetail = {
  coach: Coach;
  access: CoachAccess;
  history: AccessAuditEntry[];
};

export type UseCoach = {
  detail: CoachDetail | null;
  error: ApiError | null;
  isLoading: boolean;
  assignTeams: (teamIds: number[]) => Promise<void>;
};

// Un entrenador con sus accesos y el historial de cambios de equipos.
export const useCoach = (coachId: number): UseCoach => {
  const { coachId: currentCoachId, reload: reloadSession } = useCoachSession();

  const loader = useCallback(
    async (signal: AbortSignal): Promise<CoachDetail> => {
      const [coach, access, history] = await Promise.all([
        talentService.getCoach(coachId, { signal }),
        talentService.getCoachAccess(coachId, { signal }),
        talentService.getCoachAccessHistory(coachId, { signal }),
      ]);
      return { coach, access, history };
    },
    [coachId],
  );
  const { data, error, isLoading, reload } = useAsyncData(loader);

  const assignTeams = useCallback(
    async (teamIds: number[]) => {
      // Quien hace el cambio es el entrenador que usa el portal
      await talentService.assignCoachTeams(coachId, teamIds, {
        performedById: currentCoachId,
      });
      reload();
      if (coachId === currentCoachId) reloadSession();
    },
    [coachId, currentCoachId, reload, reloadSession],
  );

  return { detail: data, error, isLoading: isLoading && !data, assignTeams };
};

// POST /api/coaches
export const useRegisterCoach = () =>
  useCallback((input: CoachInput) => talentService.registerCoach(input), []);
