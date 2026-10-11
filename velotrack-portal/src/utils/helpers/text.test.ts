import { describe, expect, it } from "vitest";

import { repairDoubleUtf8 } from "./text";

describe("repairDoubleUtf8", () => {
  it("repara texto codificado dos veces", () => {
    expect(repairDoubleUtf8("SesiÃ³n no encontrada")).toBe(
      "Sesión no encontrada",
    );
  });

  it("deja igual el texto correcto", () => {
    expect(repairDoubleUtf8("Sesión no encontrada")).toBe(
      "Sesión no encontrada",
    );
    expect(repairDoubleUtf8("Not Found")).toBe("Not Found");
  });
});
