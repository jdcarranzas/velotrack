import { describe, expect, it } from "vitest";

import type { TrainingSession } from "./session.model";
import { getAthleteStats, getSessionBestLapMs } from "./session.selectors";

const session = (
  id: string,
  sessionDate: string,
  lapsMs: number[],
  maxSpeedKmh: number | null,
): TrainingSession => ({
  id,
  athleteId: 1,
  coachId: "c",
  teamId: "t",
  sessionDate,
  status: "COMPLETADA",
  technical: {
    startSpeedKmh: 20,
    maxSpeedKmh,
    averageSpeedKmh: null,
    completedLaps: lapsMs.length,
    laps: lapsMs.map((timeMs) => ({ timeMs, splitsMs: [] })),
    intervals: [],
  },
  physical: { resistanceScore: null, recoverySeconds: null },
  observations: null,
  version: 0,
  createdAt: sessionDate,
  updatedAt: sessionDate,
});

const sessions = [
  session("1", "2026-09-22T15:00:00Z", [17020, 17500], 47.1),
  session("2", "2026-09-27T15:00:00Z", [16210, 16800], 49.8),
  session("3", "2026-09-25T15:00:00Z", [16550], 48.4),
  session("4", "2026-08-01T15:00:00Z", [], null),
];

describe("getAthleteStats", () => {
  const stats = getAthleteStats(sessions, new Date(2026, 8, 30));

  it("encuentra la mejor vuelta y su sesión", () => {
    expect(stats.bestLap?.timeMs).toBe(16210);
    expect(stats.bestLap?.session.id).toBe("2");
  });

  it("toma la velocidad máxima registrada", () => {
    expect(stats.maxSpeedKmh).toBe(49.8);
  });

  it("cuenta las sesiones del mes", () => {
    expect(stats.sessionsThisMonth).toBe(3);
  });

  it("promedia las vueltas de las últimas tres sesiones con vueltas", () => {
    expect(stats.averageLapMs).toBe(
      Math.round((16210 + 16800 + 16550 + 17020 + 17500) / 5),
    );
  });

  it("devuelve null sin datos", () => {
    expect(getAthleteStats([], new Date())).toEqual({
      bestLap: null,
      maxSpeedKmh: null,
      sessionsThisMonth: 0,
      averageLapMs: null,
    });
  });
});

describe("getSessionBestLapMs", () => {
  it("devuelve null si la sesión no tiene vueltas", () => {
    expect(getSessionBestLapMs(sessions[3])).toBeNull();
  });
});
