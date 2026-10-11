import type { SessionStatus } from "@/models/session.model";

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  PROGRAMADA: "Programada",
  BORRADOR: "Borrador",
  COMPLETADA: "Completada",
};

export const SESSION_STATUS_TONES: Record<
  SessionStatus,
  "info" | "neutral" | "success"
> = {
  PROGRAMADA: "info",
  BORRADOR: "neutral",
  COMPLETADA: "success",
};

// Tamaño de página de los listados de captura (la API admite 1-100)
export const SESSIONS_PAGE_SIZE = 20;

// Días hacia atrás que muestra por defecto el historial de un atleta
export const HISTORY_DEFAULT_DAYS = 90;

// Días hacia adelante que muestra por defecto la agenda
export const AGENDA_DEFAULT_DAYS = 30;
