import Alert from "@/components/atoms/Alert";
import type { ApiError } from "@/services/http/apiError";

import FormErrorStyles from "./formError.styles";

export type FormErrorProps = {
  error: ApiError | null;
  // Texto para un 400 de talentms, que no explica qué falló
  badRequestMessage?: string;
  // Texto para un 409 (otro guardó el recurso antes)
  conflictMessage?: string;
};

// Error de la API al enviar un formulario. Si la API señaló campos concretos,
// esos se muestran junto a cada campo y aquí solo va el mensaje general.
const FormErrorComponent = ({
  error,
  badRequestMessage,
  conflictMessage,
}: FormErrorProps) => {
  if (!error) return null;
  const message =
    error.status === 400 && badRequestMessage && !error.fieldErrors.length
      ? badRequestMessage
      : error.status === 409 && conflictMessage
        ? conflictMessage
        : error.message;
  return (
    <div className="formError">
      <Alert>{message}</Alert>

      <style jsx>{FormErrorStyles}</style>
    </div>
  );
};

export default FormErrorComponent;
