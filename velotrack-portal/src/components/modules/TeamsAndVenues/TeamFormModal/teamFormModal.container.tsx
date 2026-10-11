import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import TextInput from "@/components/atoms/TextInput";
import FormActions from "@/components/molecules/FormActions";
import FormError from "@/components/molecules/FormError";
import FormField from "@/components/molecules/FormField";
import FormGrid from "@/components/molecules/FormGrid";
import Modal from "@/components/molecules/Modal";
import { useForm } from "@/hooks/useForm";
import { useSubmit } from "@/hooks/useSubmit";
import type { Team, TeamInput, Venue } from "@/models/talent.model";
import { teamFormSchema } from "@/models/talent.schema";
import { apiToFieldErrors } from "@/utils/helpers/forms";

export type TeamFormModalProps = {
  // Sin team es un equipo nuevo
  team: Team | null;
  // Sede elegida al crear desde la tarjeta de una sede
  defaultVenueId: number | null;
  venues: Venue[];
  onSubmit: (input: TeamInput) => Promise<void>;
  onClose: () => void;
};

// Crear (POST /api/teams) o editar (PUT /api/teams/{id}) un equipo
const TeamFormModalContainer = ({
  team,
  defaultVenueId,
  venues,
  onSubmit,
  onClose,
}: TeamFormModalProps) => {
  const { values, errors, setValue, setErrors, validate } = useForm(
    teamFormSchema,
    {
      name: team?.name ?? "",
      description: team?.description ?? "",
      venueId: String(team?.venueId ?? defaultVenueId ?? ""),
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
    <Modal title={team ? "Editar equipo" : "Nuevo equipo"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <FormGrid columns={1}>
          <FormField label="Nombre" htmlFor="team-name" error={errors.name}>
            <TextInput
              id="team-name"
              value={values.name}
              invalid={!!errors.name}
              placeholder="Élite A"
              onChange={(event) => setValue("name", event.target.value)}
            />
          </FormField>
          <FormField label="Descripción" htmlFor="team-description" optional>
            <TextInput
              id="team-description"
              value={values.description}
              onChange={(event) => setValue("description", event.target.value)}
            />
          </FormField>
          <FormField label="Sede" htmlFor="team-venueId" error={errors.venueId}>
            <Select
              id="team-venueId"
              value={values.venueId}
              invalid={!!errors.venueId}
              placeholder="Elige una sede"
              options={venues.map((venue) => ({
                value: String(venue.id),
                label: venue.name,
              }))}
              onChange={(event) => setValue("venueId", event.target.value)}
            />
          </FormField>
        </FormGrid>

        <FormError
          error={error}
          badRequestMessage="No se pudo guardar. Revisa que la sede esté activa."
        />

        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar equipo"}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
};

export default TeamFormModalContainer;
