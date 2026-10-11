import { z } from "zod";

import {
  fromDateTimeInputValue,
  toDateTimeInputValue,
} from "@/utils/helpers/date";
import { parseNumberInput, parseNumberList } from "@/utils/helpers/forms";

import {
  SESSION_STATUSES,
  type SessionInput,
  type TrainingSession,
} from "./session.model";

// Validación del formulario de sesión. Repite los rangos de SessionRequest y
// las reglas de SessionRules de captura para avisar antes de enviar.

const MAX_SPEED_KMH = 150;
const MAX_SECONDS = 86400;

// Número opcional escrito en un input de texto
const optionalNumber = (
  label: string,
  {
    min,
    max,
    integer = false,
  }: { min: number; max: number; integer?: boolean },
) =>
  z
    .string()
    .transform(parseNumberInput)
    .pipe(
      z
        .number(`${label}: escribe un número`)
        .min(min, `${label}: mínimo ${min}`)
        .max(max, `${label}: máximo ${max}`)
        .refine((value) => !integer || Number.isInteger(value), {
          message: `${label}: debe ser un número entero`,
        })
        .optional(),
    );

const lapSchema = z.object({
  time: z
    .string()
    .transform(parseNumberInput)
    .pipe(
      z
        .number("Escribe el tiempo de la vuelta")
        .gt(0, "El tiempo debe ser mayor que 0")
        .max(MAX_SECONDS, `Máximo ${MAX_SECONDS} s`),
    ),
  splits: z
    .string()
    .transform(parseNumberList)
    .pipe(
      z
        .array(
          z
            .number("Los parciales deben ser números")
            .gt(0, "Cada parcial debe ser mayor que 0")
            .max(MAX_SECONDS),
        )
        .max(100, "Máximo 100 parciales"),
    ),
});

const intervalSchema = z.object({
  fromSecond: optionalNumber("Desde", {
    min: 0,
    max: MAX_SECONDS,
    integer: true,
  }),
  toSecond: optionalNumber("Hasta", {
    min: 1,
    max: MAX_SECONDS,
    integer: true,
  }),
  completedLaps: optionalNumber("Vueltas", {
    min: 0,
    max: 1000,
    integer: true,
  }),
});

export const sessionFormSchema = z
  .object({
    // Id del patinador (talentms) elegido en el select
    athleteId: z
      .string()
      .min(1, "Elige el patinador")
      .transform(Number)
      .pipe(z.number().int().positive("Elige el patinador")),
    sessionDate: z.string().min(1, "Elige la fecha y hora"),
    status: z.enum(SESSION_STATUSES, "Elige el estado"),
    startSpeedKmh: optionalNumber("Velocidad de salida", {
      min: 0,
      max: MAX_SPEED_KMH,
    }),
    maxSpeedKmh: optionalNumber("Velocidad máxima", {
      min: 0,
      max: MAX_SPEED_KMH,
    }),
    averageSpeedKmh: optionalNumber("Velocidad media", {
      min: 0,
      max: MAX_SPEED_KMH,
    }),
    completedLaps: optionalNumber("Vueltas", {
      min: 0,
      max: 1000,
      integer: true,
    }),
    laps: z.array(lapSchema).max(1000),
    intervals: z.array(intervalSchema).max(1000),
    resistanceScore: optionalNumber("Resistencia", { min: 0, max: 10 }),
    recoverySeconds: optionalNumber("Recuperación", {
      min: 0,
      max: 3600,
      integer: true,
    }),
    observations: z
      .string()
      .max(2000, "Máximo 2000 caracteres")
      .transform((value) => value.trim() || null),
  })
  .superRefine((values, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });

    if (values.status === "COMPLETADA") {
      if (values.startSpeedKmh === undefined) {
        issue(
          ["startSpeedKmh"],
          "Una sesión completada requiere velocidad de salida",
        );
      }
      if (!values.completedLaps) {
        issue(
          ["completedLaps"],
          "Una sesión completada requiere al menos una vuelta",
        );
      } else if (values.laps.length !== values.completedLaps) {
        issue(["laps"], "Registra el tiempo de todas las vueltas declaradas");
      }
    }

    if (
      values.completedLaps !== undefined &&
      values.laps.length > values.completedLaps
    ) {
      issue(["laps"], "Hay más tiempos que vueltas declaradas");
    }

    if (values.maxSpeedKmh !== undefined) {
      if (
        values.startSpeedKmh !== undefined &&
        values.startSpeedKmh > values.maxSpeedKmh
      ) {
        issue(
          ["startSpeedKmh"],
          "La velocidad de salida no puede superar la máxima",
        );
      }
      if (
        values.averageSpeedKmh !== undefined &&
        values.averageSpeedKmh > values.maxSpeedKmh
      ) {
        issue(
          ["averageSpeedKmh"],
          "La velocidad media no puede superar la máxima",
        );
      }
    }

    values.laps.forEach((lap, index) => {
      const splitsTotal = lap.splits.reduce((sum, split) => sum + split, 0);
      if (splitsTotal > lap.time) {
        issue(
          ["laps", index, "splits"],
          "Los parciales superan el tiempo de la vuelta",
        );
      }
    });

    let previousEnd = -1;
    let intervalLaps = 0;
    values.intervals.forEach((interval, index) => {
      const { fromSecond, toSecond, completedLaps } = interval;
      if (
        fromSecond === undefined ||
        toSecond === undefined ||
        completedLaps === undefined
      ) {
        issue(["intervals", index], "Completa desde, hasta y vueltas");
        return;
      }
      if (fromSecond >= toSecond) {
        issue(["intervals", index], "El inicio debe ser menor que el fin");
      } else if (fromSecond < previousEnd) {
        issue(
          ["intervals", index],
          "Los intervalos deben estar ordenados y no superponerse",
        );
      }
      previousEnd = toSecond;
      intervalLaps += completedLaps;
    });
    if (
      values.completedLaps !== undefined &&
      intervalLaps > values.completedLaps
    ) {
      issue(
        ["intervals"],
        "Las vueltas por intervalo superan el total de la sesión",
      );
    }
  })
  .transform((values): Omit<SessionInput, "version"> => ({
    athleteId: values.athleteId,
    sessionDate: fromDateTimeInputValue(values.sessionDate),
    status: values.status,
    technical: {
      startSpeedKmh: values.startSpeedKmh ?? null,
      maxSpeedKmh: values.maxSpeedKmh ?? null,
      averageSpeedKmh: values.averageSpeedKmh ?? null,
      completedLaps: values.completedLaps ?? null,
      laps: values.laps.map((lap) => ({
        timeMs: Math.round(lap.time * 1000),
        splitsMs: lap.splits.map((split) => Math.round(split * 1000)),
      })),
      intervals: values.intervals.map((interval) => ({
        fromSecond: interval.fromSecond ?? 0,
        toSecond: interval.toSecond ?? 0,
        completedLaps: interval.completedLaps ?? 0,
      })),
    },
    physical: {
      resistanceScore: values.resistanceScore ?? null,
      recoverySeconds: values.recoverySeconds ?? null,
    },
    observations: values.observations,
  }));

export type SessionFormValues = z.input<typeof sessionFormSchema>;
export type SessionLapFormValues = SessionFormValues["laps"][number];
export type SessionIntervalFormValues = SessionFormValues["intervals"][number];

export const observationsSchema = z
  .string()
  .max(2000, "Máximo 2000 caracteres")
  .transform((value) => value.trim() || null);

const numberToInput = (value: number | null) =>
  value === null ? "" : String(value);

export const EMPTY_LAP: SessionLapFormValues = { time: "", splits: "" };

export const EMPTY_INTERVAL: SessionIntervalFormValues = {
  fromSecond: "",
  toSecond: "",
  completedLaps: "",
};

export const getEmptySessionFormValues = (
  athleteId = "",
): SessionFormValues => ({
  athleteId,
  sessionDate: "",
  status: "COMPLETADA",
  startSpeedKmh: "",
  maxSpeedKmh: "",
  averageSpeedKmh: "",
  completedLaps: "",
  laps: [],
  intervals: [],
  resistanceScore: "",
  recoverySeconds: "",
  observations: "",
});

// Una sesión de captura a los valores del formulario (para editarla)
export const sessionToFormValues = (
  session: TrainingSession,
): SessionFormValues => ({
  athleteId: session.athleteId === null ? "" : String(session.athleteId),
  sessionDate: toDateTimeInputValue(session.sessionDate),
  status: session.status,
  startSpeedKmh: numberToInput(session.technical.startSpeedKmh),
  maxSpeedKmh: numberToInput(session.technical.maxSpeedKmh),
  averageSpeedKmh: numberToInput(session.technical.averageSpeedKmh),
  completedLaps: numberToInput(session.technical.completedLaps),
  laps: session.technical.laps.map((lap) => ({
    time: String(lap.timeMs / 1000),
    splits: lap.splitsMs.map((split) => split / 1000).join(" "),
  })),
  intervals: session.technical.intervals.map((interval) => ({
    fromSecond: String(interval.fromSecond),
    toSecond: String(interval.toSecond),
    completedLaps: String(interval.completedLaps),
  })),
  resistanceScore: numberToInput(session.physical.resistanceScore),
  recoverySeconds: numberToInput(session.physical.recoverySeconds),
  observations: session.observations ?? "",
});
