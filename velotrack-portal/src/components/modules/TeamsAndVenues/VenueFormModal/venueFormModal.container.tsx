import Button from "@/components/atoms/Button";
import TextInput from "@/components/atoms/TextInput";
import FormActions from "@/components/molecules/FormActions";
import FormError from "@/components/molecules/FormError";
import FormField from "@/components/molecules/FormField";
import FormGrid from "@/components/molecules/FormGrid";
import Modal from "@/components/molecules/Modal";
import { useForm } from "@/hooks/useForm";
import { useSubmit } from "@/hooks/useSubmit";
import type { Venue, VenueInput } from "@/models/talent.model";
import { venueFormSchema } from "@/models/talent.schema";
import { apiToFieldErrors } from "@/utils/helpers/forms";

export type VenueFormModalProps = {
  // Sin venue es una sede nueva
  venue: Venue | null;
  // Organización por defecto para una sede nueva (la de las sedes existentes)
  defaultOrganizationId: number | null;
  onSubmit: (input: VenueInput) => Promise<void>;
  onClose: () => void;
};

// Crear (POST /api/venues) o editar (PUT /api/venues/{id}) una sede
const VenueFormModalContainer = ({
  venue,
  defaultOrganizationId,
  onSubmit,
  onClose,
}: VenueFormModalProps) => {
  const { values, errors, setValue, setErrors, validate } = useForm(
    venueFormSchema,
    {
      name: venue?.name ?? "",
      description: venue?.description ?? "",
      organizationId: String(
        venue?.organizationId ?? defaultOrganizationId ?? "",
      ),
    },
  );
  const { submit, isSubmitting, error } = useSubmit(onSubmit);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = validate();
    if (!input) return;
    const result = await submit(input);
    if (result.ok) onClose();
    else setErrors(apiToFieldErrors(result.error.fieldErrors));
  };

  return (
    <Modal title={venue ? "Editar sede" : "Nueva sede"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormGrid columns={1}>
          <FormField label="Nombre" htmlFor="venue-name" error={errors.name}>
            <TextInput
              id="venue-name"
              value={values.name}
              invalid={!!errors.name}
              placeholder="Sede Bogotá"
              onChange={(event) => setValue("name", event.target.value)}
            />
          </FormField>
          <FormField label="Descripción" htmlFor="venue-description" optional>
            <TextInput
              id="venue-description"
              value={values.description}
              onChange={(event) => setValue("description", event.target.value)}
            />
          </FormField>
          <FormField
            label="Organización (id)"
            htmlFor="venue-organizationId"
            error={errors.organizationId}
            hint=""
          >
            <TextInput
              id="venue-organizationId"
              inputMode="numeric"
              mono
              value={values.organizationId}
              invalid={!!errors.organizationId}
              onChange={(event) =>
                setValue("organizationId", event.target.value)
              }
            />
          </FormField>
        </FormGrid>

        <FormError
          error={error}
          badRequestMessage="No se pudo guardar. Revisa que la organización exista."
        />

        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar sede"}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
};

export default VenueFormModalContainer;
