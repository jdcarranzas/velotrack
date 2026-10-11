import { useState } from "react";

import Button from "@/components/atoms/Button";
import Textarea from "@/components/atoms/Textarea";
import FormActions from "@/components/molecules/FormActions";
import FormError from "@/components/molecules/FormError";
import FormField from "@/components/molecules/FormField";
import { useSubmit } from "@/hooks/useSubmit";
import { observationsSchema } from "@/models/session.schema";

export type ObservationsEditorProps = {
  observations: string | null;
  onSave: (observations: string | null) => Promise<void>;
};

// Edita solo las observaciones (PATCH /api/v1/sessions/{id}/observations).
// Dejarlas vacías las borra.
const ObservationsEditorContainer = ({
  observations,
  onSave,
}: ObservationsEditorProps) => {
  const [value, setValue] = useState(observations ?? "");
  const [validationError, setValidationError] = useState<string>();
  const { submit, isSubmitting, error } = useSubmit(onSave);
  const isDirty = value !== (observations ?? "");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = observationsSchema.safeParse(value);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message);
      return;
    }
    setValidationError(undefined);
    await submit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label="Observaciones"
        htmlFor="session-detail-observations"
        error={validationError}
        hint={`${value.length}/2000 · Se guardan sin cambiar el resto de la sesión.`}
      >
        <Textarea
          id="session-detail-observations"
          value={value}
          maxLength={2000}
          placeholder="Sin observaciones"
          onChange={(event) => setValue(event.target.value)}
        />
      </FormField>

      <FormError
        error={error}
        conflictMessage="La sesión cambió mientras escribías. Recarga la página y vuelve a intentarlo."
      />

      <FormActions>
        <Button
          variant="secondary"
          disabled={!isDirty || isSubmitting}
          onClick={() => setValue(observations ?? "")}
        >
          Descartar
        </Button>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar observaciones"}
        </Button>
      </FormActions>
    </form>
  );
};

export default ObservationsEditorContainer;
