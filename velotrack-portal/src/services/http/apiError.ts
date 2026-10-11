import { repairDoubleUtf8 } from "@/utils/helpers/text";

export type ApiFieldError = {
  field: string;
  message: string;
};

// Mensajes para el usuario según el estado HTTP. talentms no envía un mensaje
// propio (solo `{ status, error, path }`), así que estos son el texto por defecto.
const STATUS_MESSAGES: Record<number, string> = {
  0: "No hay conexión con el servidor. Revisa tu red e intenta de nuevo.",
  400: "Revisa los datos enviados.",
  401: "No tienes una sesión activa.",
  403: "No tienes permiso para esta acción.",
  404: "No se encontró lo que buscas.",
  409: "El registro cambió mientras lo editabas. Recarga e intenta de nuevo.",
  503: "El servicio no está disponible en este momento.",
};

const SERVER_ERROR_MESSAGE =
  "Ocurrió un error en el servidor. Intenta de nuevo.";

export const getStatusMessage = (status: number): string =>
  STATUS_MESSAGES[status] ??
  (status >= 500 ? SERVER_ERROR_MESSAGE : STATUS_MESSAGES[400]);

// Error único para cualquier respuesta fallida de la gateway.
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: ApiFieldError[];

  constructor(status: number, message: string, fieldErrors: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseFieldErrors = (value: unknown): ApiFieldError[] =>
  Array.isArray(value)
    ? value
        .filter(isRecord)
        .filter(
          (item) =>
            typeof item.field === "string" && typeof item.message === "string",
        )
        .map((item) => ({
          field: item.field as string,
          message: repairDoubleUtf8(item.message as string),
        }))
    : [];

// Convierte el cuerpo de error de cualquiera de los dos servicios:
// - captura: ProblemDetail `{ title, detail, status, errors?: [{ field, message }] }`
// - talentms: error por defecto de Spring `{ timestamp, status, error, path }`
export const toApiError = (status: number, body: unknown): ApiError => {
  if (isRecord(body) && typeof body.detail === "string" && body.detail) {
    return new ApiError(
      status,
      repairDoubleUtf8(body.detail),
      parseFieldErrors(body.errors),
    );
  }
  return new ApiError(status, getStatusMessage(status), []);
};
