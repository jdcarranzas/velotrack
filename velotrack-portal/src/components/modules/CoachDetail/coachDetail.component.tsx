import { Pencil, Plus } from "lucide-react";

import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Spinner from "@/components/atoms/Spinner";
import TextInput from "@/components/atoms/TextInput";
import Card from "@/components/molecules/Card";
import DataTable from "@/components/molecules/DataTable";
import EmptyState from "@/components/molecules/EmptyState";
import InfoField from "@/components/molecules/InfoField";
import PageHeader from "@/components/molecules/PageHeader";
import type { CoachDetail } from "@/hooks/data/useCoach";
import type { TalentCatalogs } from "@/models/talent.model";
import { findName } from "@/models/talent.selectors";
import type { ApiError } from "@/services/http/apiError";
import { formatDateTime } from "@/utils/helpers/date";

import CoachDetailStyles from "./coachDetail.styles";

export type CoachDetailProps = {
  detail: CoachDetail | null;
  catalogs: TalentCatalogs;
  isLoading: boolean;
  error: ApiError | null;
  // Es el entrenador que usa el portal (NEXT_PUBLIC_COACH_ID)
  isCurrentCoach: boolean;
  lookupId: string;
  onLookupIdChange: (value: string) => void;
  onLookup: () => void;
  onEditTeams: () => void;
  onRegister: () => void;
};

const ACTION_LABELS: Record<string, string> = {
  ASSIGNED: "Asignado",
  REMOVED: "Retirado",
};

const CoachDetailComponent = ({
  detail,
  catalogs,
  isLoading,
  error,
  isCurrentCoach,
  lookupId,
  onLookupIdChange,
  onLookup,
  onEditTeams,
  onRegister,
}: CoachDetailProps) => (
  <div className="coachDetail">
    <PageHeader
      title="Entrenadores"
      description=""
      actions={
        <div className="coachDetail__toolbar">
          <form
            className="coachDetail__lookup"
            onSubmit={(event) => {
              event.preventDefault();
              onLookup();
            }}
          >
            <TextInput
              aria-label="Id del entrenador"
              placeholder="Id"
              inputMode="numeric"
              mono
              value={lookupId}
              onChange={(event) => onLookupIdChange(event.target.value)}
            />
            <Button type="submit" variant="secondary">
              Ver
            </Button>
          </form>
          <Button icon={<Plus size={16} />} onClick={onRegister}>
            Registrar entrenador
          </Button>
        </div>
      }
    />

    {isLoading ? (
      <Card>
        <Spinner label="Cargando entrenador…" />
      </Card>
    ) : error ? (
      <Card>
        <EmptyState
          tone="error"
          title={
            error.status === 404
              ? "No existe un entrenador con ese id"
              : "No se pudo cargar el entrenador"
          }
          description={error.status === 404 ? undefined : error.message}
        />
      </Card>
    ) : (
      detail && (
        <>
          <Card>
            <div className="coachDetail__identity">
              <Avatar name={detail.coach.name} size="lg" />
              <div>
                <h2 className="coachDetail__name">{detail.coach.name}</h2>
                <div className="coachDetail__badges">
                  <Badge
                    tone={
                      detail.coach.status === "active" ? "success" : "neutral"
                    }
                    withDot
                  >
                    {detail.coach.status === "active"
                      ? "Activo"
                      : detail.coach.status}
                  </Badge>
                  {isCurrentCoach && <Badge tone="info">Eres tú</Badge>}
                </div>
              </div>
            </div>
            <div className="coachDetail__info">
              <InfoField label="Id" value={detail.coach.id} mono />
              <InfoField label="Correo" value={detail.coach.email} />
              <InfoField label="Teléfono" value={detail.coach.telephone} />
            </div>
          </Card>

          <Card
            title="Equipos asignados"
            description={
              detail.access.venueIds.length
                ? `Acceso a las sedes: ${detail.access.venueIds
                    .map((id) => findName(catalogs.venues, id))
                    .join(", ")}`
                : "Sin acceso a ninguna sede"
            }
            actions={
              <Button
                variant="outline"
                size="sm"
                icon={<Pencil size={12} />}
                onClick={onEditTeams}
              >
                Editar equipos
              </Button>
            }
          >
            <DataTable
              plain
              rows={detail.access.teamIds}
              getRowKey={(teamId) => teamId}
              caption="Equipos asignados"
              emptyMessage="No tiene equipos asignados."
              columns={[
                {
                  key: "team",
                  header: "Equipo",
                  render: (teamId) => findName(catalogs.teams, teamId),
                },
                {
                  key: "venue",
                  header: "Sede",
                  muted: true,
                  render: (teamId) =>
                    findName(
                      catalogs.venues,
                      catalogs.teams.find((team) => team.id === teamId)
                        ?.venueId,
                    ),
                },
              ]}
            />
          </Card>

          <Card
            title="Historial de accesos"
            description="Cada alta y baja de equipos queda registrada."
          >
            <DataTable
              plain
              rows={detail.history}
              getRowKey={(entry) => entry.id}
              caption="Historial de accesos"
              emptyMessage="Sin cambios registrados."
              columns={[
                {
                  key: "date",
                  header: "Fecha",
                  mono: true,
                  muted: true,
                  render: (entry) => formatDateTime(entry.changedAt),
                },
                {
                  key: "action",
                  header: "Cambio",
                  render: (entry) => (
                    <Badge
                      tone={
                        entry.actionType === "ASSIGNED" ? "success" : "danger"
                      }
                    >
                      {ACTION_LABELS[entry.actionType] ?? entry.actionType}
                    </Badge>
                  ),
                },
                {
                  key: "team",
                  header: "Equipo",
                  render: (entry) => findName(catalogs.teams, entry.teamId),
                },
                {
                  key: "venue",
                  header: "Sede",
                  muted: true,
                  render: (entry) => findName(catalogs.venues, entry.venueId),
                },
                {
                  key: "performedBy",
                  header: "Hecho por",
                  muted: true,
                  render: (entry) =>
                    entry.performedById === null
                      ? "—"
                      : `Entrenador ${entry.performedById}`,
                },
              ]}
            />
          </Card>
        </>
      )
    )}

    <style jsx>{CoachDetailStyles}</style>
  </div>
);

export default CoachDetailComponent;
