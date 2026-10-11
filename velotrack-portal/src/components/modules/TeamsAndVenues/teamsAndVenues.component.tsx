import { Pencil, Plus } from "lucide-react";

import Alert from "@/components/atoms/Alert";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Checkbox from "@/components/atoms/Checkbox";
import Spinner from "@/components/atoms/Spinner";
import Card from "@/components/molecules/Card";
import DataTable from "@/components/molecules/DataTable";
import EmptyState from "@/components/molecules/EmptyState";
import PageHeader from "@/components/molecules/PageHeader";
import type { Team, Venue } from "@/models/talent.model";
import type { VenueWithTeams } from "@/models/talent.selectors";
import type { ApiError } from "@/services/http/apiError";

import TeamsAndVenuesStyles from "./teamsAndVenues.styles";

export type TeamsAndVenuesProps = {
  groups: VenueWithTeams[];
  isLoading: boolean;
  error: ApiError | null;
  // Error de la última acción (activar o desactivar)
  actionError: string | null;
  includeInactive: boolean;
  // Id del recurso que se está activando o desactivando ("venue-1", "team-3")
  pendingKey: string | null;
  onIncludeInactiveChange: (value: boolean) => void;
  onCreateVenue: () => void;
  onEditVenue: (venue: Venue) => void;
  onToggleVenue: (venue: Venue) => void;
  onCreateTeam: (venue: Venue) => void;
  onEditTeam: (team: Team) => void;
  onToggleTeam: (team: Team) => void;
};

const TeamsAndVenuesComponent = ({
  groups,
  isLoading,
  error,
  actionError,
  includeInactive,
  pendingKey,
  onIncludeInactiveChange,
  onCreateVenue,
  onEditVenue,
  onToggleVenue,
  onCreateTeam,
  onEditTeam,
  onToggleTeam,
}: TeamsAndVenuesProps) => (
  <div className="teamsAndVenues">
    <PageHeader
      title="Equipos y Sedes"
      description="Cada equipo pertenece a una sede. Nada se borra: se desactiva."
      actions={
        <div className="teamsAndVenues__toolbar">
          <Checkbox
            label="Mostrar inactivos"
            checked={includeInactive}
            onChange={onIncludeInactiveChange}
          />
          <Button icon={<Plus size={16} />} onClick={onCreateVenue}>
            Nueva sede
          </Button>
        </div>
      }
    />

    {actionError && (
      <div className="teamsAndVenues__alert">
        <Alert>{actionError}</Alert>
      </div>
    )}

    {isLoading ? (
      <Card>
        <Spinner label="Cargando sedes y equipos…" />
      </Card>
    ) : error ? (
      <Card>
        <EmptyState
          tone="error"
          title="No se pudieron cargar las sedes"
          description={error.message}
        />
      </Card>
    ) : groups.length === 0 ? (
      <Card>
        <EmptyState
          title="Todavía no hay sedes"
          description="Crea la primera sede para poder agregarle equipos."
        />
      </Card>
    ) : (
      <div className="teamsAndVenues__list">
        {groups.map(({ venue, teams }) => (
          <Card
            key={venue.id}
            title={venue.isActive ? venue.name : `${venue.name} (inactiva)`}
            description={venue.description ?? undefined}
            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Pencil size={12} />}
                  onClick={() => onEditVenue(venue)}
                >
                  Editar
                </Button>
                <Button
                  variant={venue.isActive ? "danger" : "secondary"}
                  size="sm"
                  disabled={pendingKey === `venue-${venue.id}`}
                  onClick={() => onToggleVenue(venue)}
                >
                  {venue.isActive ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  size="sm"
                  icon={<Plus size={12} />}
                  disabled={!venue.isActive}
                  onClick={() => onCreateTeam(venue)}
                >
                  Nuevo equipo
                </Button>
              </>
            }
          >
            <DataTable
              plain
              rows={teams}
              getRowKey={(team) => team.id}
              caption={`Equipos de ${venue.name}`}
              emptyMessage="Esta sede no tiene equipos."
              columns={[
                {
                  key: "name",
                  header: "Equipo",
                  render: (team) => team.name,
                },
                {
                  key: "description",
                  header: "Descripción",
                  muted: true,
                  render: (team) => team.description || "—",
                },
                {
                  key: "status",
                  header: "Estado",
                  render: (team) =>
                    team.isActive ? (
                      <Badge tone="success" withDot>
                        Activo
                      </Badge>
                    ) : (
                      <Badge withDot>Inactivo</Badge>
                    ),
                },
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: (team) => (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTeam(team)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pendingKey === `team-${team.id}`}
                        onClick={() => onToggleTeam(team)}
                      >
                        {team.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </>
                  ),
                },
              ]}
            />
          </Card>
        ))}
      </div>
    )}

    <style jsx>{TeamsAndVenuesStyles}</style>
  </div>
);

export default TeamsAndVenuesComponent;
