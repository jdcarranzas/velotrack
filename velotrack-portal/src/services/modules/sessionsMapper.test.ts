import { describe, expect, it } from "vitest";

import {
  toCaptureAthleteId,
  toSessionRequest,
  toSkaterId,
  toTrainingSession,
  type TrainingSessionDto,
} from "./sessionsMapper";

const dto: TrainingSessionDto = {
  id: "b82bf7de-c396-42dd-9578-b708a97141ea",
  athleteId: "00000001-0000-4000-8000-000000000099",
  coachId: "11111111-1111-1111-1111-111111111111",
  teamId: "22222222-2222-2222-2222-222222222222",
  sessionDate: "2026-09-27T15:00:00Z",
  status: "COMPLETADA",
  technical: {
    startSpeedKmh: 20,
    maxSpeedKmh: 40,
    averageSpeedKmh: 30,
    completedLaps: 2,
    laps: [
      { timeSeconds: 30.5, splitSeconds: [15, 15.5] },
      { timeSeconds: 16.21, splitSeconds: null },
    ],
    intervals: [{ fromSecond: 0, toSecond: 62, completedLaps: 2 }],
  },
  physical: { resistanceScore: 8, recoverySeconds: 120 },
  observations: "Buen ritmo.",
  version: 0,
  createdAt: "2026-10-10T23:15:01.883189Z",
  updatedAt: "2026-10-10T23:15:01.883189Z",
};

describe("toTrainingSession", () => {
  it("convierte los tiempos de vuelta a milisegundos", () => {
    const session = toTrainingSession(dto);
    expect(session.technical.laps).toEqual([
      { timeMs: 30500, splitsMs: [15000, 15500] },
      { timeMs: 16210, splitsMs: [] },
    ]);
  });

  it("acepta una sesión sin métricas", () => {
    const session = toTrainingSession({
      ...dto,
      status: "BORRADOR",
      technical: null,
      physical: null,
    });
    expect(session.technical.laps).toEqual([]);
    expect(session.technical.maxSpeedKmh).toBeNull();
    expect(session.physical.recoverySeconds).toBeNull();
  });
});

describe("toSessionRequest", () => {
  it("vuelve a segundos y conserva la versión", () => {
    const session = toTrainingSession(dto);
    const request = toSessionRequest({ ...session, athleteId: 99, version: 3 });
    expect(request.technical.laps).toEqual([
      { timeSeconds: 30.5, splitSeconds: [15, 15.5] },
      { timeSeconds: 16.21, splitSeconds: [] },
    ]);
    expect(request.version).toBe(3);
    expect(request).not.toHaveProperty("id");
  });

  it("no envía version al crear", () => {
    const session = {
      ...toTrainingSession(dto),
      athleteId: 99,
      version: undefined,
    };
    expect(toSessionRequest(session)).not.toHaveProperty("version");
  });
});

describe("id del atleta", () => {
  it("codifica el id del patinador como el UUID de captura y al revés", () => {
    expect(toCaptureAthleteId(99)).toBe("00000001-0000-4000-8000-000000000099");
    expect(toSkaterId("00000001-0000-4000-8000-000000000099")).toBe(99);
    expect(toTrainingSession(dto).athleteId).toBe(99);
  });

  it("devuelve null para un UUID sin equivalencia", () => {
    expect(toSkaterId("33333333-3333-3333-3333-333333333333")).toBeNull();
  });

  it("envía el UUID codificado al crear", () => {
    const request = toSessionRequest({
      ...toTrainingSession(dto),
      athleteId: 7,
    });
    expect(request.athleteId).toBe("00000001-0000-4000-8000-000000000007");
  });
});
