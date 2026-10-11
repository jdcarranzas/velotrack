"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import { toApiError } from "@/hooks/useAsyncData";
import type { Coach, TalentCatalogs, Team, Venue } from "@/models/talent.model";
import { getCoachScope } from "@/models/talent.selectors";
import type { ApiError } from "@/services/http/apiError";
import { talentService } from "@/services/modules/talentService";
import { env } from "@/utils/constants/env";

import {
  coachSessionReducer,
  initialCoachSessionState,
} from "./coachSession.reducer";

export type CoachSessionValue = {
  coachId: number;
  coach: Coach | null;
  coachError: ApiError | null;
  // Equipos y sedes a los que tiene acceso el entrenador
  coachTeams: Team[];
  coachVenues: Venue[];
  // Catálogos completos (activos e inactivos) para cruzar ids con nombres
  catalogs: TalentCatalogs;
  catalogsError: ApiError | null;
  isLoading: boolean;
  // Vuelve a pedir entrenador y catálogos (después de crear o editar algo)
  reload: () => void;
};

const CoachSessionContext = createContext<CoachSessionValue | null>(null);

type CoachSessionProviderProps = {
  children: React.ReactNode;
};

// Sesión del entrenador: como no hay login, es el entrenador de
// NEXT_PUBLIC_COACH_ID. Comparte con todas las pantallas sus datos y los
// catálogos de talentms.
export const CoachSessionProvider = ({
  children,
}: CoachSessionProviderProps) => {
  const coachId = env.NEXT_PUBLIC_COACH_ID;
  const [state, dispatch] = useReducer(
    coachSessionReducer,
    initialCoachSessionState,
  );

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    talentService.getCoach(coachId, { signal }).then(
      (coach) => dispatch({ type: "coachLoaded", coach }),
      (error: unknown) => {
        if (!signal.aborted) {
          dispatch({ type: "coachFailed", error: toApiError(error) });
        }
      },
    );

    Promise.all([
      talentService.listCategories({ signal }),
      talentService.listTeams({ signal }),
      talentService.listVenues({ signal }),
    ]).then(
      ([categories, teams, venues]) =>
        dispatch({
          type: "catalogsLoaded",
          catalogs: { categories, teams, venues },
        }),
      (error: unknown) => {
        if (!signal.aborted) {
          dispatch({ type: "catalogsFailed", error: toApiError(error) });
        }
      },
    );

    return () => controller.abort();
  }, [coachId, state.reloadKey]);

  const reload = useCallback(() => dispatch({ type: "reload" }), []);

  const value = useMemo<CoachSessionValue>(() => {
    const scope = getCoachScope(state.coach?.teamIds ?? [], state.catalogs);
    return {
      coachId,
      coach: state.coach,
      coachError: state.coachError,
      coachTeams: scope.teams,
      coachVenues: scope.venues,
      catalogs: state.catalogs,
      catalogsError: state.catalogsError,
      isLoading: state.isLoading,
      reload,
    };
  }, [coachId, state, reload]);

  return (
    <CoachSessionContext.Provider value={value}>
      {children}
    </CoachSessionContext.Provider>
  );
};

export const useCoachSession = (): CoachSessionValue => {
  const value = useContext(CoachSessionContext);
  if (!value) {
    throw new Error("useCoachSession se usa dentro de CoachSessionProvider");
  }
  return value;
};
