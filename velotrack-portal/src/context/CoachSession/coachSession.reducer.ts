import type { Coach, TalentCatalogs } from "@/models/talent.model";
import type { ApiError } from "@/services/http/apiError";

export type CoachSessionState = {
  coach: Coach | null;
  coachError: ApiError | null;
  catalogs: TalentCatalogs;
  catalogsError: ApiError | null;
  // Primera carga: hasta que llega no hay nada que mostrar
  isLoading: boolean;
  reloadKey: number;
};

export type CoachSessionAction =
  | { type: "reload" }
  | { type: "coachLoaded"; coach: Coach }
  | { type: "coachFailed"; error: ApiError }
  | { type: "catalogsLoaded"; catalogs: TalentCatalogs }
  | { type: "catalogsFailed"; error: ApiError };

export const initialCoachSessionState: CoachSessionState = {
  coach: null,
  coachError: null,
  catalogs: { categories: [], teams: [], venues: [] },
  catalogsError: null,
  isLoading: true,
  reloadKey: 0,
};

// Al recargar se conservan los datos actuales hasta que llegan los nuevos, para
// que la pantalla no parpadee después de cada cambio.
export const coachSessionReducer = (
  state: CoachSessionState,
  action: CoachSessionAction,
): CoachSessionState => {
  switch (action.type) {
    case "reload":
      return { ...state, reloadKey: state.reloadKey + 1 };
    case "coachLoaded":
      return { ...state, coach: action.coach, coachError: null };
    case "coachFailed":
      return { ...state, coach: null, coachError: action.error };
    case "catalogsLoaded":
      return {
        ...state,
        catalogs: action.catalogs,
        catalogsError: null,
        isLoading: false,
      };
    case "catalogsFailed":
      return { ...state, catalogsError: action.error, isLoading: false };
  }
};
