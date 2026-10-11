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
import type { Category, SkaterInput, Team, Venue } from "@/models/talent.model";
import {
  skaterFormSchema,
  type SkaterFormValues,
} from "@/models/talent.schema";
import { findName } from "@/models/talent.selectors";
import { apiToFieldErrors } from "@/utils/helpers/forms";

export type SkaterFormModalProps = {
  categories: Category[];
  // Solo los equipos activos del entrenador
  teams: Team[];
  venues: Venue[];
  onSubmit: (input: SkaterInput) => Promise<void>;
  onClose: () => void;
};

const getInitialValues = (teams: Team[]): SkaterFormValues => ({
  name: "",
  idNumber: "",
  dateOfBirth: "",
  categoryId: "",
  // Con un solo equipo se elige solo
  teamId: teams.length === 1 ? String(teams[0].id) : "",
  venueId: teams.length === 1 ? String(teams[0].venueId) : "",
  telephone: "",
  email: "",
});

// Registro de un patinador (POST /api/skaters). La sede sale del equipo.
const SkaterFormModalContainer = ({
  categories,
  teams,
  venues,
  onSubmit,
  onClose,
}: SkaterFormModalProps) => {
  const { values, errors, setValue, setValues, setErrors, validate } = useForm(
    skaterFormSchema,
    getInitialValues(teams),
  );
  const { submit, isSubmitting, error } = useSubmit(onSubmit);

  const selectTeam = (teamId: string) => {
    const team = teams.find((item) => String(item.id) === teamId);
    setValue("teamId", teamId);
    setValues((current) => ({
      ...current,
      venueId: team ? String(team.venueId) : "",
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = validate();
    if (!input) return;
    const result = await submit(input);
    if (result.ok) onClose();
    else setErrors(apiToFieldErrors(result.error.fieldErrors));
  };

  return (
    <Modal
      title="Registrar patinador"
      description="Queda en el equipo que elijas y en la sede de ese equipo."
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormGrid>
          <FormField
            label="Nombre completo"
            htmlFor="skater-name"
            error={errors.name}
          >
            <TextInput
              id="skater-name"
              value={values.name}
              invalid={!!errors.name}
              onChange={(event) => setValue("name", event.target.value)}
            />
          </FormField>
          <FormField
            label="Documento"
            htmlFor="skater-idNumber"
            error={errors.idNumber}
          >
            <TextInput
              id="skater-idNumber"
              value={values.idNumber}
              invalid={!!errors.idNumber}
              placeholder="TI-1020345678"
              onChange={(event) => setValue("idNumber", event.target.value)}
            />
          </FormField>
          <FormField
            label="Fecha de nacimiento"
            htmlFor="skater-dateOfBirth"
            error={errors.dateOfBirth}
          >
            <TextInput
              id="skater-dateOfBirth"
              type="date"
              value={values.dateOfBirth}
              invalid={!!errors.dateOfBirth}
              onChange={(event) => setValue("dateOfBirth", event.target.value)}
            />
          </FormField>
          <FormField
            label="Categoría"
            htmlFor="skater-categoryId"
            error={errors.categoryId}
          >
            <Select
              id="skater-categoryId"
              value={values.categoryId}
              invalid={!!errors.categoryId}
              placeholder="Elige una categoría"
              options={categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              }))}
              onChange={(event) => setValue("categoryId", event.target.value)}
            />
          </FormField>
          <FormField
            label="Equipo"
            htmlFor="skater-teamId"
            error={errors.teamId}
          >
            <Select
              id="skater-teamId"
              value={values.teamId}
              invalid={!!errors.teamId}
              placeholder="Elige un equipo"
              options={teams.map((team) => ({
                value: String(team.id),
                label: team.name,
              }))}
              onChange={(event) => selectTeam(event.target.value)}
            />
          </FormField>
          <FormField label="Sede" htmlFor="skater-venue" error={errors.venueId}>
            <TextInput
              id="skater-venue"
              value={
                values.venueId ? findName(venues, Number(values.venueId)) : ""
              }
              placeholder="Sale del equipo"
              disabled
            />
          </FormField>
          <FormField label="Teléfono" htmlFor="skater-telephone" optional>
            <TextInput
              id="skater-telephone"
              type="tel"
              value={values.telephone}
              placeholder="+57 310 234 5678"
              onChange={(event) => setValue("telephone", event.target.value)}
            />
          </FormField>
          <FormField
            label="Correo"
            htmlFor="skater-email"
            error={errors.email}
            optional
          >
            <TextInput
              id="skater-email"
              type="email"
              value={values.email}
              invalid={!!errors.email}
              onChange={(event) => setValue("email", event.target.value)}
            />
          </FormField>
        </FormGrid>

        <FormError
          error={error}
          badRequestMessage="No se pudo registrar. Revisa que el documento no esté registrado y que la categoría, el equipo y la sede estén activos."
        />

        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando…" : "Registrar patinador"}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
};

export default SkaterFormModalContainer;
