import { describe, expect, it } from "vitest";

import type { Skater, TalentCatalogs } from "./talent.model";
import {
  buildSkaterRows,
  EMPTY_SKATER_FILTERS,
  filterSkaterRows,
  getCoachScope,
  groupTeamsByVenue,
} from "./talent.selectors";

const catalogs: TalentCatalogs = {
  categories: [
    { id: 1, name: "Juvenil", description: null, isActive: true },
    { id: 2, name: "Mayores", description: null, isActive: true },
  ],
  teams: [
    { id: 1, name: "Élite A", description: null, venueId: 1, isActive: true },
    { id: 2, name: "Élite B", description: null, venueId: 2, isActive: false },
  ],
  venues: [
    {
      id: 1,
      name: "Bogotá",
      description: null,
      organizationId: 1,
      isActive: true,
    },
    {
      id: 2,
      name: "Cali",
      description: null,
      organizationId: 1,
      isActive: true,
    },
  ],
};

const skater = (overrides: Partial<Skater>): Skater => ({
  id: 1,
  name: "Ana Demo",
  idNumber: "TI-1",
  dateOfBirth: "2009-03-14",
  categoryId: 1,
  teamId: 1,
  venueId: 1,
  telephone: null,
  email: null,
  createdAt: "2026-10-10T00:00:00Z",
  ...overrides,
});

const today = new Date(2026, 9, 10);

describe("buildSkaterRows", () => {
  it("calcula la edad, marca a los menores y cruza los nombres", () => {
    const [row] = buildSkaterRows([skater({})], catalogs, today);
    expect(row).toMatchObject({
      age: 17,
      isMinor: true,
      categoryName: "Juvenil",
      teamName: "Élite A",
      venueName: "Bogotá",
    });
  });

  it("cumple años el mismo día", () => {
    const [row] = buildSkaterRows(
      [skater({ dateOfBirth: "2008-10-10" })],
      catalogs,
      today,
    );
    expect(row.age).toBe(18);
    expect(row.isMinor).toBe(false);
  });

  it("muestra un guion si falta un catálogo", () => {
    const [row] = buildSkaterRows(
      [skater({ categoryId: 99 })],
      catalogs,
      today,
    );
    expect(row.categoryName).toBe("—");
  });
});

describe("filterSkaterRows", () => {
  const rows = buildSkaterRows(
    [
      skater({ id: 1, name: "Santiago Ríos" }),
      skater({
        id: 2,
        name: "Mateo Gómez",
        dateOfBirth: "2004-01-01",
        categoryId: 2,
      }),
    ],
    catalogs,
    today,
  );

  it("busca sin importar tildes ni mayúsculas", () => {
    const result = filterSkaterRows(rows, {
      ...EMPTY_SKATER_FILTERS,
      search: "rios",
    });
    expect(result.map((row) => row.skater.id)).toEqual([1]);
  });

  it("filtra por categoría y por menores", () => {
    expect(
      filterSkaterRows(rows, { ...EMPTY_SKATER_FILTERS, categoryId: 2 }),
    ).toHaveLength(1);
    expect(
      filterSkaterRows(rows, { ...EMPTY_SKATER_FILTERS, onlyMinors: true })[0]
        .skater.name,
    ).toBe("Santiago Ríos");
  });
});

describe("groupTeamsByVenue", () => {
  it("oculta los equipos inactivos salvo que se pidan", () => {
    expect(
      groupTeamsByVenue(catalogs.venues, catalogs.teams, false)[1].teams,
    ).toEqual([]);
    expect(
      groupTeamsByVenue(catalogs.venues, catalogs.teams, true)[1].teams,
    ).toHaveLength(1);
  });
});

describe("getCoachScope", () => {
  it("devuelve los equipos del entrenador y sus sedes", () => {
    const scope = getCoachScope([1], catalogs);
    expect(scope.teams.map((team) => team.name)).toEqual(["Élite A"]);
    expect(scope.venues.map((venue) => venue.name)).toEqual(["Bogotá"]);
  });
});
