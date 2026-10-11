import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient, buildUrl } from "./apiClient";
import { ApiError } from "./apiError";

const mockFetch = (status: number, body?: unknown) => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const catchError = async (promise: Promise<unknown>): Promise<ApiError> => {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("La promesa no falló");
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("buildUrl", () => {
  it("antepone el prefijo de la gateway y omite valores vacíos", () => {
    expect(
      buildUrl("/api/teams", { venueId: 2, activeOnly: false, coachId: null }),
    ).toBe("/gateway/api/teams?venueId=2&activeOnly=false");
  });

  it("codifica las fechas ISO con zona horaria", () => {
    expect(
      buildUrl("/api/v1/agenda", { from: "2026-09-01T00:00:00-05:00" }),
    ).toBe("/gateway/api/v1/agenda?from=2026-09-01T00%3A00%3A00-05%3A00");
  });
});

describe("apiClient", () => {
  it("devuelve el JSON de una respuesta exitosa", async () => {
    const fetchMock = mockFetch(200, [{ id: 1, name: "Equipo A" }]);
    await expect(apiClient.get("/api/teams")).resolves.toEqual([
      { id: 1, name: "Equipo A" },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/gateway/api/teams",
      expect.objectContaining({ method: "GET", body: undefined }),
    );
  });

  it("envía el cuerpo como JSON", async () => {
    const fetchMock = mockFetch(201, { id: 3 });
    await apiClient.post("/api/categories", { name: "Infantil" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe('{"name":"Infantil"}');
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("usa el mensaje propio si talentms no envía uno", async () => {
    mockFetch(404, { status: 404, error: "Not Found", path: "/api/teams/9" });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = await catchError(apiClient.get("/api/teams/9"));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe("No se encontró lo que buscas.");
  });

  it("usa el detalle y los campos del ProblemDetail de captura", async () => {
    mockFetch(400, {
      title: "Bad Request",
      detail: "Revise los campos de la solicitud",
      errors: [{ field: "athleteId", message: "no debe ser nulo" }],
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = await catchError(apiClient.post("/api/v1/sessions", {}));
    expect(error.message).toBe("Revise los campos de la solicitud");
    expect(error.fieldErrors).toEqual([
      { field: "athleteId", message: "no debe ser nulo" },
    ]);
  });

  it("convierte un fallo de red en ApiError con estado 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fail")));
    const error = await catchError(apiClient.get("/api/teams"));
    expect(error.status).toBe(0);
  });
});
