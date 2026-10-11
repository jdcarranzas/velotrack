import type { SessionInput, SessionRangeQuery } from "@/models/session.model";

import {
  toSessionRequest,
  toTrainingSession,
  type TrainingSessionDto,
} from "./sessionsMapper";
import { apiClient } from "../http/apiClient";

type Signal = { signal?: AbortSignal };

const toSessions = (dtos: TrainingSessionDto[]) => dtos.map(toTrainingSession);

// Servicio de captura a través de la gateway. Convierte los tiempos de
// segundos (API) a milisegundos (portal) y al revés.
export const sessionsService = {
  // POST /api/v1/sessions (201 + Location)
  createSession: async (input: SessionInput) =>
    toTrainingSession(
      await apiClient.post<TrainingSessionDto>(
        "/api/v1/sessions",
        toSessionRequest(input),
      ),
    ),

  // GET /api/v1/sessions/{id}
  getSession: async (id: string, { signal }: Signal = {}) =>
    toTrainingSession(
      await apiClient.get<TrainingSessionDto>(`/api/v1/sessions/${id}`, {
        signal,
      }),
    ),

  // PUT /api/v1/sessions/{id}. Reemplaza todo el contenido editable; exige la
  // versión que se leyó (409 si otro la cambió antes).
  updateSession: async (id: string, input: SessionInput) =>
    toTrainingSession(
      await apiClient.put<TrainingSessionDto>(
        `/api/v1/sessions/${id}`,
        toSessionRequest(input),
      ),
    ),

  // PATCH /api/v1/sessions/{id}/observations. null borra las observaciones.
  updateObservations: async (
    id: string,
    version: number,
    observations: string | null,
  ) =>
    toTrainingSession(
      await apiClient.patch<TrainingSessionDto>(
        `/api/v1/sessions/${id}/observations`,
        { version, observations },
      ),
    ),

  // GET /api/v1/athletes/{athleteId}/sessions?from&to&limit&offset
  // athleteId es el id del patinador en talentms (404 si captura no lo conoce).
  // Rango [from, to), orden descendente por fecha.
  listAthleteSessions: async (
    athleteId: number,
    { from, to, limit, offset, signal }: SessionRangeQuery & Signal,
  ) =>
    toSessions(
      await apiClient.get<TrainingSessionDto[]>(
        `/api/v1/athletes/${athleteId}/sessions`,
        { query: { from, to, limit, offset }, signal },
      ),
    ),

  // GET /api/v1/agenda?from&to&team&limit&offset. Solo sesiones PROGRAMADA:
  // las del entrenador (team=false) o las de su equipo (team=true).
  listAgenda: async ({
    from,
    to,
    team = false,
    limit,
    offset,
    signal,
  }: SessionRangeQuery & { team?: boolean } & Signal) =>
    toSessions(
      await apiClient.get<TrainingSessionDto[]>("/api/v1/agenda", {
        query: { from, to, team, limit, offset },
        signal,
      }),
    ),
};
