import Button from "@/components/atoms/Button";
import Checkbox from "@/components/atoms/Checkbox";
import TextInput from "@/components/atoms/TextInput";
import FormActions from "@/components/molecules/FormActions";
import FormError from "@/components/molecules/FormError";
import FormField from "@/components/molecules/FormField";
import FormGrid from "@/components/molecules/FormGrid";
import Modal from "@/components/molecules/Modal";
import { useForm } from "@/hooks/useForm";
import { useSubmit } from "@/hooks/useSubmit";
import type { Coach, CoachInput, Team, Venue } from "@/models/talent.model";
import { coachFormSchema, type CoachFormValues } from "@/models/talent.schema";
import { findName } from "@/models/talent.selectors";
import { apiToFieldErrors } from "@/utils/helpers/forms";

import CoachFormModalStyles from "./coachFormModal.styles";

export type CoachFormModalProps = {
  teams: Team[];
  venues: Venue[];
  onSubmit: (input: CoachInput) => Promise<Coach>;
  onCreated: (coach: Coach) => void;
  onClose: () => void;
};

const EMPTY_VALUES: CoachFormValues = {
  name: "",
  email: "",
  password: "",
  telephone: "",
  teamIds: [],
};

// Registro de un entrenador (POST /api/coaches). Exige al menos un equipo.
const CoachFormModalContainer = ({
  teams,
  venues,
  onSubmit,
  onCreated,
  onClose,
}: CoachFormModalProps) => {
  const { values, errors, setValue, setErrors, validate } = useForm(
    coachFormSchema,
    EMPTY_VALUES,
  );
  const { submit, isSubmitting, error } = useSubmit(onSubmit);

  const toggleTeam = (teamId: number, checked: boolean) =>
    setValue(
      "teamIds",
      checked
        ? [...values.teamIds, teamId]
        : values.teamIds.filter((id) => id !== teamId),
    );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = validate();
    if (!input) return;
    const result = await submit(input);
    if (result.ok) onCreated(result.data);
    else setErrors(apiToFieldErrors(result.error.fieldErrors));
  };

  return (
    <Modal title="Registrar entrenador" onClose={onClose} wide>
      <form onSubmit={handleSubmit} noValidate>
        <FormGrid>
          <FormField label="Nombre" htmlFor="coach-name" error={errors.name}>
            <TextInput
              id="coach-name"
              value={values.name}
              invalid={!!errors.name}
              onChange={(event) => setValue("name", event.target.value)}
            />
          </FormField>
          <FormField label="Correo" htmlFor="coach-email" error={errors.email}>
            <TextInput
              id="coach-email"
              type="email"
              value={values.email}
              invalid={!!errors.email}
              onChange={(event) => setValue("email", event.target.value)}
            />
          </FormField>
          <FormField
            label="Contraseña"
            htmlFor="coach-password"
            error={errors.password}
          >
            <TextInput
              id="coach-password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              invalid={!!errors.password}
              onChange={(event) => setValue("password", event.target.value)}
            />
          </FormField>
          <FormField label="Teléfono" htmlFor="coach-telephone" optional>
            <TextInput
              id="coach-telephone"
              type="tel"
              value={values.telephone}
              onChange={(event) => setValue("telephone", event.target.value)}
            />
          </FormField>
        </FormGrid>

        <fieldset className="coachFormModal__teams">
          <legend className="coachFormModal__legend">Equipos</legend>
          {teams.map((team) => (
            <Checkbox
              key={team.id}
              label={team.name}
              hint={findName(venues, team.venueId)}
              checked={values.teamIds.includes(team.id)}
              onChange={(checked) => toggleTeam(team.id, checked)}
            />
          ))}
          {errors.teamIds && (
            <span className="coachFormModal__error" role="alert">
              {errors.teamIds}
            </span>
          )}
        </fieldset>

        <FormError
          error={error}
          badRequestMessage="No se pudo registrar. Revisa que el correo no esté registrado y que los equipos estén activos."
        />

        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando…" : "Registrar entrenador"}
          </Button>
        </FormActions>
      </form>

      <style jsx>{CoachFormModalStyles}</style>
    </Modal>
  );
};

export default CoachFormModalContainer;
