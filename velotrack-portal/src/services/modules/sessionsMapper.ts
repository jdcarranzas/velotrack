import type {
  SessionInput,
  SessionStatus,
  TrainingSession,
} from "@/models/session.model";

// DTOs de captura tal como viajan por la API (tiempos en segundos).
export type LapDto = { timeSeconds: number; splitSeconds: number[] | null };

export type TechnicalDto = {
  startSpeedKmh: number | null;
  maxSpeedKmh: number | null;
  averageSpeedKmh: number | null;
  completedLaps: number | null;
  laps: LapDto[] | null;
  intervals:
    { fromSecond: number; toSecond: number; completedLaps: number }[] | null;
};

export type PhysicalDto = {
  resistanceScore: number | null;
  recoverySeconds: number | null;
};

export type TrainingSessionDto = {
  id: string;
  athleteId: string;
  coachId: string;
  teamId: string;
  sessionDate: string;
  status: SessionStatus;
  technical: TechnicalDto | null;
  physical: PhysicalDto | null;
  observations: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type SessionRequestDto = {
  athleteId: string;
  sessionDate: string;
  status: SessionStatus;
  technical: TechnicalDto;
  physical: PhysicalDto;
  observations: string | null;
  version?: number;
};

// Captura identifica al patinador de talentms con un UUID que codifica su id:
// "00000001-0000-4000-8000-" + el id en decimal con ceros a la izquierda hasta
// 12 dígitos (patinador 99 → 00000001-0000-4000-8000-000000000099).
const ATHLETE_UUID_PREFIX = "00000001-0000-4000-8000-";
const ATHLETE_UUID_PATTERN = /^00000001-0000-4000-8000-(\d{12})$/i;

export const toCaptureAthleteId = (skaterId: number): string =>
  `${ATHLETE_UUID_PREFIX}${String(skaterId).padStart(12, "0")}`;

// null si el UUID no codifica un patinador (datos anteriores al vínculo)
export const toSkaterId = (captureAthleteId: string): number | null => {
  const match = ATHLETE_UUID_PATTERN.exec(captureAthleteId);
  return match ? Number(match[1]) : null;
};

const secondsToMs = (seconds: number) => Math.round(seconds * 1000);
const msToSeconds = (ms: number) => ms / 1000;

export const toTrainingSession = (
  dto: TrainingSessionDto,
): TrainingSession => ({
  id: dto.id,
  athleteId: toSkaterId(dto.athleteId),
  coachId: dto.coachId,
  teamId: dto.teamId,
  sessionDate: dto.sessionDate,
  status: dto.status,
  technical: {
    startSpeedKmh: dto.technical?.startSpeedKmh ?? null,
    maxSpeedKmh: dto.technical?.maxSpeedKmh ?? null,
    averageSpeedKmh: dto.technical?.averageSpeedKmh ?? null,
    completedLaps: dto.technical?.completedLaps ?? null,
    laps: (dto.technical?.laps ?? []).map((lap) => ({
      timeMs: secondsToMs(lap.timeSeconds),
      splitsMs: (lap.splitSeconds ?? []).map(secondsToMs),
    })),
    intervals: dto.technical?.intervals ?? [],
  },
  physical: {
    resistanceScore: dto.physical?.resistanceScore ?? null,
    recoverySeconds: dto.physical?.recoverySeconds ?? null,
  },
  observations: dto.observations,
  version: dto.version,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const toSessionRequest = (input: SessionInput): SessionRequestDto => ({
  athleteId: toCaptureAthleteId(input.athleteId),
  sessionDate: input.sessionDate,
  status: input.status,
  technical: {
    ...input.technical,
    laps: input.technical.laps.map((lap) => ({
      timeSeconds: msToSeconds(lap.timeMs),
      splitSeconds: lap.splitsMs.map(msToSeconds),
    })),
  },
  physical: input.physical,
  observations: input.observations,
  ...(input.version === undefined ? {} : { version: input.version }),
});
