import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SkaterRow } from "@/models/talent.selectors";

import SkaterProfileComponent from "./skaterProfile.component";

const row: SkaterRow = {
  skater: {
    id: 1,
    name: "Ana Demo",
    idNumber: "DEMO-001",
    dateOfBirth: "2015-03-10",
    categoryId: 1,
    teamId: 1,
    venueId: 1,
    telephone: "+57 310 234 5678",
    email: null,
    createdAt: "2026-10-10T00:42:42Z",
  },
  age: 11,
  isMinor: true,
  categoryName: "Juvenil",
  teamName: "Equipo A",
  venueName: "Pista Central",
};

describe("SkaterProfile", () => {
  it("muestra los datos de talentms y avisa que falta el vínculo con captura", () => {
    render(
      <SkaterProfileComponent
        row={row}
        coachName="Coach Demo"
        isLoading={false}
        error={null}
        capture={null}
        today={new Date(2026, 9, 10)}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Ana Demo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Juvenil · Equipo A · Pista Central"),
    ).toBeInTheDocument();
    expect(screen.getByText("+57 310 234 5678")).toBeInTheDocument();
    // Correo vacío
    expect(screen.getByText("Sin registrar")).toBeInTheDocument();
    expect(screen.getByText("Sin vínculo con captura")).toBeInTheDocument();
  });

  it("indica si el patinador no es de los equipos del entrenador", () => {
    render(
      <SkaterProfileComponent
        row={null}
        coachName={null}
        isLoading={false}
        error={null}
        capture={null}
        today={new Date()}
      />,
    );
    expect(screen.getByText("Patinador no encontrado")).toBeInTheDocument();
  });
});
