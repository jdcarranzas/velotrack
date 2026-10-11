import type {
  AccessAuditEntry,
  Category,
  CategoryInput,
  Coach,
  CoachAccess,
  CoachInput,
  Skater,
  SkaterInput,
  Team,
  TeamInput,
  Venue,
  VenueInput,
} from "@/models/talent.model";

import { apiClient } from "../http/apiClient";

type Signal = { signal?: AbortSignal };

// Servicio de talentms a través de la gateway. Los DTOs de talentms ya tienen
// la forma de los modelos, así que no hay conversión.
export const talentService = {
  // GET /api/venues?organizationId&activeOnly
  listVenues: ({
    activeOnly = false,
    organizationId,
    signal,
  }: { activeOnly?: boolean; organizationId?: number } & Signal = {}) =>
    apiClient.get<Venue[]>("/api/venues", {
      query: { activeOnly, organizationId },
      signal,
    }),

  // POST /api/venues
  createVenue: (input: VenueInput) =>
    apiClient.post<Venue>("/api/venues", input),

  // PUT /api/venues/{id}
  updateVenue: (id: number, input: VenueInput) =>
    apiClient.put<Venue>(`/api/venues/${id}`, input),

  // PATCH /api/venues/{id}/status
  setVenueActive: (id: number, active: boolean) =>
    apiClient.patch<Venue>(`/api/venues/${id}/status`, { active }),

  // GET /api/teams?venueId&activeOnly
  listTeams: ({
    activeOnly = false,
    venueId,
    signal,
  }: { activeOnly?: boolean; venueId?: number } & Signal = {}) =>
    apiClient.get<Team[]>("/api/teams", {
      query: { activeOnly, venueId },
      signal,
    }),

  // POST /api/teams
  createTeam: (input: TeamInput) => apiClient.post<Team>("/api/teams", input),

  // PUT /api/teams/{id}
  updateTeam: (id: number, input: TeamInput) =>
    apiClient.put<Team>(`/api/teams/${id}`, input),

  // PATCH /api/teams/{id}/status
  setTeamActive: (id: number, active: boolean) =>
    apiClient.patch<Team>(`/api/teams/${id}/status`, { active }),

  // GET /api/categories?activeOnly
  listCategories: ({
    activeOnly = false,
    signal,
  }: { activeOnly?: boolean } & Signal = {}) =>
    apiClient.get<Category[]>("/api/categories", {
      query: { activeOnly },
      signal,
    }),

  // POST /api/categories
  createCategory: (input: CategoryInput) =>
    apiClient.post<Category>("/api/categories", input),

  // PUT /api/categories/{id}
  updateCategory: (id: number, input: CategoryInput) =>
    apiClient.put<Category>(`/api/categories/${id}`, input),

  // PATCH /api/categories/{id}/status
  setCategoryActive: (id: number, active: boolean) =>
    apiClient.patch<Category>(`/api/categories/${id}/status`, { active }),

  // GET /api/skaters?teamId&coachId. Si el entrenador no tiene acceso al
  // equipo, talentms responde una lista vacía.
  listSkatersByTeam: (
    teamId: number,
    { coachId, signal }: { coachId?: number } & Signal = {},
  ) =>
    apiClient.get<Skater[]>("/api/skaters", {
      query: { teamId, coachId },
      signal,
    }),

  // POST /api/skaters
  registerSkater: (input: SkaterInput) =>
    apiClient.post<Skater>("/api/skaters", input),

  // GET /api/coaches/{id}
  getCoach: (id: number, { signal }: Signal = {}) =>
    apiClient.get<Coach>(`/api/coaches/${id}`, { signal }),

  // POST /api/coaches
  registerCoach: (input: CoachInput) =>
    apiClient.post<Coach>("/api/coaches", input),

  // PUT /api/coaches/{id}/teams. Reemplaza todos los equipos del entrenador.
  // X-Admin-Id queda en el historial de accesos como quien hizo el cambio.
  assignCoachTeams: (
    id: number,
    teamIds: number[],
    { performedById }: { performedById?: number } = {},
  ) =>
    apiClient.put<Coach>(`/api/coaches/${id}/teams`, teamIds, {
      headers:
        performedById === undefined
          ? undefined
          : { "X-Admin-Id": String(performedById) },
    }),

  // GET /api/coaches/{id}/access
  getCoachAccess: (id: number, { signal }: Signal = {}) =>
    apiClient.get<CoachAccess>(`/api/coaches/${id}/access`, { signal }),

  // GET /api/coaches/{id}/access-history
  getCoachAccessHistory: (id: number, { signal }: Signal = {}) =>
    apiClient.get<AccessAuditEntry[]>(`/api/coaches/${id}/access-history`, {
      signal,
    }),
};
