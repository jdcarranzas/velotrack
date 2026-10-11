import { describe, expect, it } from "vitest";

import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("usa los valores por defecto cuando no hay variables", () => {
    expect(parseEnv({})).toEqual({ NEXT_PUBLIC_COACH_ID: 1 });
  });

  it("convierte el id del entrenador a número", () => {
    expect(parseEnv({ NEXT_PUBLIC_COACH_ID: "7" }).NEXT_PUBLIC_COACH_ID).toBe(
      7,
    );
  });

  it("falla con un id de entrenador inválido", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_COACH_ID: "abc" })).toThrow(
      /Variables de entorno inválidas/,
    );
    expect(() => parseEnv({ NEXT_PUBLIC_COACH_ID: "0" })).toThrow();
  });
});
