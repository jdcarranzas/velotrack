import type { z } from "zod";

import type { ApiFieldError } from "@/services/http/apiError";

export type FieldErrors = Record<string, string>;

// Errores de zod a { "laps.0.time": "mensaje" }; se queda con el primero de
// cada campo.
export const zodToFieldErrors = (error: z.ZodError): FieldErrors =>
  error.issues.reduce<FieldErrors>((errors, issue) => {
    const key = issue.path.join(".");
    if (!(key in errors)) errors[key] = issue.message;
    return errors;
  }, {});

export const apiToFieldErrors = (errors: ApiFieldError[]): FieldErrors =>
  Object.fromEntries(errors.map(({ field, message }) => [field, message]));

// Número escrito por el usuario: acepta coma decimal. "" → undefined.
export const parseNumberInput = (value: string): number | undefined => {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return undefined;
  return Number(trimmed);
};

// Lista separada por comas o espacios: "15, 15.5" → [15, 15.5]
export const parseNumberList = (value: string): number[] =>
  value
    .split(/[;\s]+|,\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item.replace(",", ".")));
