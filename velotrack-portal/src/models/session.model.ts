// Modelos de captura (`/api/v1/sessions`). Se diferencian del DTO en dos cosas:
// - `athleteId` es el id del patinador en talentms (entero). Captura lo guarda
//   como un UUID que lo codifica; la conversión está en sessionsMapper.
// - Los tiempos de vuelta y parciales van en milisegundos enteros (`timeMs`,
//   `splitsMs`) en lugar de segundos decimales. Los intervalos y la
//   recuperación siguen en segundos, como dice su nombre.

export const SESSION_STATUSES = [
  "PROGRAMADA",
  "BORRADOR",
  "COMPLETADA",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export type SessionLap = {
  timeMs: number;
  // Duraciones de los segmentos de la vuelta, no tiempos acumulados
  splitsMs: number[];
};

export type SessionInterval = {
  fromSecond: number;
  toSecond: number;
  completedLaps: number;
};

export type SessionTechnical = {
  startSpeedKmh: number | null;
  maxSpeedKmh: number | null;
  averageSpeedKmh: number | null;
  completedLaps: number | null;
  laps: SessionLap[];
  intervals: SessionInterval[];
};

export type SessionPhysical = {
  // Escala subjetiva 0-10
  resistanceScore: number | null;
  recoverySeconds: number | null;
};

export type TrainingSession = {
  id: string;
  // Id del patinador en talentms; null si la sesión es de un atleta sin
  // equivalencia (UUID que no sigue el formato de captura)
  athleteId: number | null;
  coachId: string;
  teamId: string;
  sessionDate: string;
  status: SessionStatus;
  technical: SessionTechnical;
  physical: SessionPhysical;
  observations: string | null;
  // Control de concurrencia: cada edición envía la versión que leyó
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type SessionInput = {
  // Id del patinador en talentms
  athleteId: number;
  sessionDate: string;
  status: SessionStatus;
  technical: SessionTechnical;
  physical: SessionPhysical;
  observations: string | null;
  version?: number;
};

export type SessionRangeQuery = {
  from: string;
  to: string;
  limit?: number;
  offset?: number;
};
