import { isSameMonth } from "@/utils/helpers/date";

import type { TrainingSession } from "./session.model";

export const RECENT_SESSIONS_FOR_AVERAGE = 3;

export const getSessionBestLapMs = (session: TrainingSession): number | null =>
  session.technical.laps.length
    ? Math.min(...session.technical.laps.map((lap) => lap.timeMs))
    : null;

export type BestLap = { timeMs: number; session: TrainingSession };

export const getBestLap = (sessions: TrainingSession[]): BestLap | null =>
  sessions.reduce<BestLap | null>((best, session) => {
    const timeMs = getSessionBestLapMs(session);
    if (timeMs === null || (best && best.timeMs <= timeMs)) return best;
    return { timeMs, session };
  }, null);

export const getMaxSpeedKmh = (sessions: TrainingSession[]): number | null =>
  sessions.reduce<number | null>((max, session) => {
    const speed = session.technical.maxSpeedKmh;
    return speed !== null && (max === null || speed > max) ? speed : max;
  }, null);

export const countSessionsInMonth = (
  sessions: TrainingSession[],
  reference: Date,
): number =>
  sessions.filter((session) => isSameMonth(session.sessionDate, reference))
    .length;

// Promedio de todas las vueltas de las últimas N sesiones que tienen vueltas.
export const getAverageLapMs = (
  sessions: TrainingSession[],
  lastSessions = RECENT_SESSIONS_FOR_AVERAGE,
): number | null => {
  const laps = sortByDateDesc(sessions)
    .filter((session) => session.technical.laps.length)
    .slice(0, lastSessions)
    .flatMap((session) => session.technical.laps);
  if (!laps.length) return null;
  return Math.round(
    laps.reduce((sum, lap) => sum + lap.timeMs, 0) / laps.length,
  );
};

export const sortByDateDesc = (
  sessions: TrainingSession[],
): TrainingSession[] =>
  [...sessions].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));

export const sortByDateAsc = (sessions: TrainingSession[]): TrainingSession[] =>
  [...sessions].sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

export type AthleteStats = {
  bestLap: BestLap | null;
  maxSpeedKmh: number | null;
  sessionsThisMonth: number;
  averageLapMs: number | null;
};

export const getAthleteStats = (
  sessions: TrainingSession[],
  today: Date,
): AthleteStats => ({
  bestLap: getBestLap(sessions),
  maxSpeedKmh: getMaxSpeedKmh(sessions),
  sessionsThisMonth: countSessionsInMonth(sessions, today),
  averageLapMs: getAverageLapMs(sessions),
});
