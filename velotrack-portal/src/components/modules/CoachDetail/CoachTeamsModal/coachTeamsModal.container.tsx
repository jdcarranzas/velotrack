import { useState } from "react";

import Button from "@/components/atoms/Button";
import Checkbox from "@/components/atoms/Checkbox";
import FormActions from "@/components/molecules/FormActions";
import FormError from "@/components/molecules/FormError";
import Modal from "@/components/molecules/Modal";
import { useSubmit } from "@/hooks/useSubmit";
import type { Team, Venue } from "@/models/talent.model";
import { findName } from "@/models/talent.selectors";

import CoachTeamsModalStyles from "./coachTeamsModal.styles";

export type CoachTeamsModalProps = {
  coachName: string;
  // Equipos que se pueden asignar (activos)
  teams: Team[];
  venues: Venue[];
  selectedTeamIds: number[];
  onSubmit: (teamIds: number[]) => Promise<void>;
  onClose: () => void;
};

// Reemplaza todos los equipos del entrenador (PUT /api/coaches/{id}/teams).
// Cada alta y baja queda en el historial de accesos.
const CoachTeamsModalContainer = ({
  coachName,
  teams,
  venues,
  selectedTeamIds,
  onSubmit,
  onClose,
}: CoachTeamsModalProps) => {
  const [selected, setSelected] = useState(selectedTeamIds);
  const { submit, isSubmitting, error } = useSubmit(onSubmit);

  const toggle = (teamId: number, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, teamId] : current.filter((id) => id !== teamId),
    );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await submit(selected);
    if (result.ok) onClose();
  };

  return (
    <Modal
      title="Editar equipos"
      description={`Equipos a los que ${coachName} tiene acceso.`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <fieldset className="coachTeamsModal__list">
          <legend className="visually-hidden">Equipos</legend>
          {teams.length === 0 && (
            <p className="coachTeamsModal__empty">No hay equipos activos.</p>
          )}
          {teams.map((team) => (
            <Checkbox
              key={team.id}
              label={team.name}
              hint={findName(venues, team.venueId)}
              checked={selected.includes(team.id)}
              onChange={(checked) => toggle(team.id, checked)}
            />
          ))}
        </fieldset>

        <FormError
          error={error}
          badRequestMessage="No se pudo guardar. Revisa que los equipos estén activos."
        />

        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar equipos"}
          </Button>
        </FormActions>
      </form>

      <style jsx>{CoachTeamsModalStyles}</style>
    </Modal>
  );
};

export default CoachTeamsModalContainer;
