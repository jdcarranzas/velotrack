import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Skater, TalentCatalogs } from "@/models/talent.model";
import {
  buildSkaterRows,
  EMPTY_SKATER_FILTERS,
} from "@/models/talent.selectors";

import SkaterListComponent, {
  type SkaterListProps,
} from "./skaterList.component";

const catalogs: TalentCatalogs = {
  categories: [{ id: 1, name: "Juvenil", description: null, isActive: true }],
  teams: [
    { id: 1, name: "Élite A", description: null, venueId: 1, isActive: true },
  ],
  venues: [
    {
      id: 1,
      name: "Bogotá",
      description: null,
      organizationId: 1,
      isActive: true,
    },
  ],
};

const skater: Skater = {
  id: 7,
  name: "Santiago Ríos Vargas",
  idNumber: "TI-1020345678",
  dateOfBirth: "2009-03-14",
  categoryId: 1,
  teamId: 1,
  venueId: 1,
  telephone: null,
  email: null,
  createdAt: "2026-10-10T00:42:42Z",
};

const rows = buildSkaterRows([skater], catalogs, new Date(2026, 9, 10));

const renderList = (props: Partial<SkaterListProps> = {}) =>
  render(
    <SkaterListComponent
      rows={rows}
      totalCount={rows.length}
      isLoading={false}
      error={null}
      filters={EMPTY_SKATER_FILTERS}
      categoryOptions={[{ value: "1", label: "Juvenil" }]}
      teamOptions={[{ value: "1", label: "Élite A" }]}
      canRegister
      onFiltersChange={() => {}}
      onRegister={() => {}}
      {...props}
    />,
  );

describe("SkaterList", () => {
  it("muestra cada patinador con sus datos cruzados y el enlace al perfil", () => {
    renderList();
    const row = screen.getByRole("row", { name: /Santiago Ríos Vargas/ });
    expect(within(row).getByText("Menor")).toBeInTheDocument();
    expect(within(row).getByText("17")).toBeInTheDocument();
    expect(within(row).getByText("Juvenil")).toBeInTheDocument();
    expect(within(row).getByText("Bogotá")).toBeInTheDocument();
    expect(
      within(row).getByRole("link", { name: /Ver perfil/ }),
    ).toHaveAttribute("href", "/talent/skaters/7");
    expect(screen.getByText("1 de 1 atletas")).toBeInTheDocument();
  });

  it("avisa los cambios de filtros", () => {
    const onFiltersChange = vi.fn();
    renderList({ onFiltersChange });
    fireEvent.click(screen.getByRole("button", { name: "Solo menores" }));
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...EMPTY_SKATER_FILTERS,
      onlyMinors: true,
    });
  });

  it("muestra el error de carga", () => {
    renderList({
      error: Object.assign(new Error("Sin conexión"), {
        status: 0,
        fieldErrors: [],
        name: "ApiError",
      }),
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Sin conexión");
  });
});
