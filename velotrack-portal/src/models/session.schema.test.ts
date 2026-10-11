import { describe, expect, it } from "vitest";

import { zodToFieldErrors } from "@/utils/helpers/forms";

import { sessionFormSchema, type SessionFormValues } from "./session.schema";

const base: SessionFormValues = {
  athleteId: "1",
  sessionDate: "2026-09-27T10:00",
  status: "BORRADOR",
  startSpeedKmh: "",
  maxSpeedKmh: "",
  averageSpeedKmh: "",
  completedLaps: "",
  laps: [],
  intervals: [],
  resistanceScore: "",
  recoverySeconds: "",
  observations: "",
};

const errorsOf = (values: SessionFormValues) => {
  const result = sessionFormSchema.safeParse(values);
  return result.success ? {} : zodToFieldErrors(result.error);
};

describe("sessionFormSchema", () => {
  it("acepta un borrador sin métricas", () => {
    const result = sessionFormSchema.parse(base);
    expect(result.technical.completedLaps).toBeNull();
    expect(result.observations).toBeNull();
  });

  it("convierte una sesión completa con coma decimal y milisegundos", () => {
    const result = sessionFormSchema.parse({
      ...base,
      status: "COMPLETADA",
      startSpeedKmh: "20",
      maxSpeedKmh: "40,5",
      completedLaps: "2",
      laps: [
        { time: "30.5", splits: "15 15.5" },
        { time: "31", splits: "" },
      ],
      intervals: [{ fromSecond: "0", toSecond: "62", completedLaps: "2" }],
    });
    expect(result.technical.maxSpeedKmh).toBe(40.5);
    expect(result.technical.laps[0]).toEqual({
      timeMs: 30500,
      splitsMs: [15000, 15500],
    });
  });

  it("exige velocidad de salida y todas las vueltas en una sesión completada", () => {
    const errors = errorsOf({
      ...base,
      status: "COMPLETADA",
      completedLaps: "2",
    });
    expect(errors.startSpeedKmh).toBeDefined();
    expect(errors.laps).toBe(
      "Registra el tiempo de todas las vueltas declaradas",
    );
  });

  it("no deja que la salida supere la máxima", () => {
    const errors = errorsOf({
      ...base,
      startSpeedKmh: "50",
      maxSpeedKmh: "40",
    });
    expect(errors.startSpeedKmh).toBe(
      "La velocidad de salida no puede superar la máxima",
    );
  });

  it("no deja que los parciales superen la vuelta", () => {
    const errors = errorsOf({
      ...base,
      completedLaps: "1",
      laps: [{ time: "20", splits: "15 10" }],
    });
    expect(errors["laps.0.splits"]).toBeDefined();
  });

  it("rechaza intervalos superpuestos", () => {
    const errors = errorsOf({
      ...base,
      intervals: [
        { fromSecond: "0", toSecond: "30", completedLaps: "1" },
        { fromSecond: "20", toSecond: "40", completedLaps: "1" },
      ],
    });
    expect(errors["intervals.1"]).toBe(
      "Los intervalos deben estar ordenados y no superponerse",
    );
  });

  it("rechaza valores fuera de rango", () => {
    expect(errorsOf({ ...base, maxSpeedKmh: "151" }).maxSpeedKmh).toBeDefined();
    expect(
      errorsOf({ ...base, resistanceScore: "11" }).resistanceScore,
    ).toBeDefined();
    expect(errorsOf({ ...base, athleteId: "" }).athleteId).toBeDefined();
  });
});
