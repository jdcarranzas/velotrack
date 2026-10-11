import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/services/http/apiError";

import SkaterFormModal from ".";

const props = {
  categories: [{ id: 1, name: "Juvenil", description: null, isActive: true }],
  teams: [
    { id: 4, name: "Élite A", description: null, venueId: 2, isActive: true },
  ],
  venues: [
    {
      id: 2,
      name: "Bogotá",
      description: null,
      organizationId: 1,
      isActive: true,
    },
  ],
};

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("SkaterFormModal", () => {
  it("no envía si faltan datos obligatorios", async () => {
    const onSubmit = vi.fn();
    render(
      <SkaterFormModal {...props} onSubmit={onSubmit} onClose={() => {}} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar patinador" }),
    );
    expect(await screen.findByText("Escribe el nombre")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía el SkaterRegistrationRequest con la sede del equipo", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(
      <SkaterFormModal {...props} onSubmit={onSubmit} onClose={onClose} />,
    );

    // Con un solo equipo se elige solo y la sede sale de él
    expect(screen.getByLabelText("Sede")).toHaveValue("Bogotá");

    fill("Nombre completo", "Ana Demo");
    fill("Documento", "DEMO-002");
    fill("Fecha de nacimiento", "2015-03-10");
    fill("Categoría", "1");
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar patinador" }),
    );

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Ana Demo",
      idNumber: "DEMO-002",
      dateOfBirth: "2015-03-10",
      categoryId: 1,
      teamId: 4,
      venueId: 2,
      telephone: undefined,
      email: undefined,
    });
  });

  it("explica un 400 de talentms", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError(400, "x", []));
    render(
      <SkaterFormModal {...props} onSubmit={onSubmit} onClose={() => {}} />,
    );
    fill("Nombre completo", "Ana Demo");
    fill("Documento", "DEMO-001");
    fill("Fecha de nacimiento", "2015-03-10");
    fill("Categoría", "1");
    fireEvent.click(
      screen.getByRole("button", { name: "Registrar patinador" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /el documento no esté registrado/,
    );
  });
});
