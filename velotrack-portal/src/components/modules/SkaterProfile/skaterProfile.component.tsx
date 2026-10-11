import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import Spinner from "@/components/atoms/Spinner";
import BackLink from "@/components/molecules/BackLink";
import Card from "@/components/molecules/Card";
import EmptyState from "@/components/molecules/EmptyState";
import InfoField from "@/components/molecules/InfoField";
import SessionStats from "@/components/molecules/SessionStats";
import SessionTable from "@/components/molecules/SessionTable";
import type { TrainingSession } from "@/models/session.model";
import type { AthleteStats } from "@/models/session.selectors";
import type { SkaterRow } from "@/models/talent.selectors";
import type { ApiError } from "@/services/http/apiError";
import { formatDate } from "@/utils/helpers/date";

import SkaterProfileStyles from "./skaterProfile.styles";

export type CaptureData = {
  sessions: TrainingSession[];
  stats: AthleteStats;
  isLoading: boolean;
  error: ApiError | null;
};

export type SkaterProfileProps = {
  row: SkaterRow | null;
  coachName: string | null;
  isLoading: boolean;
  error: ApiError | null;
  // null mientras captura y talentms no compartan el id del atleta
  capture: CaptureData | null;
  today: Date;
};

const CAPTURE_PENDING =
  "Las estadísticas y sesiones aparecerán cuando talentms y captura compartan el id del atleta.";

// Nota: styled-jsx solo aplica sus clases al JSX escrito dentro de este return
// (incluidos ternarios y .map), no al de funciones auxiliares.
const SkaterProfileComponent = ({
  row,
  coachName,
  isLoading,
  error,
  capture,
  today,
}: SkaterProfileProps) => (
  <div className="skaterProfile">
    <BackLink href="/talent/skaters" label="Volver a Patinadores" />

    {isLoading ? (
      <Spinner label="Cargando patinador…" />
    ) : error ? (
      <EmptyState
        tone="error"
        title="No se pudo cargar el patinador"
        description={error.message}
      />
    ) : !row ? (
      <EmptyState
        title="Patinador no encontrado"
        description="No existe o no pertenece a tus equipos."
      />
    ) : (
      <div className="skaterProfile__layout">
        <div className="skaterProfile__main">
          <Card>
            <div className="skaterProfile__identity">
              <Avatar name={row.skater.name} size="lg" />
              <div>
                <h1 className="skaterProfile__name">{row.skater.name}</h1>
                <p className="skaterProfile__subtitle">
                  {row.categoryName} · {row.teamName} · {row.venueName}
                </p>
                {row.isMinor && (
                  <div className="skaterProfile__badges">
                    <Badge tone="warning">Menor</Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="skaterProfile__info">
              <InfoField label="Documento" value={row.skater.idNumber} />
              <InfoField
                label="Fecha de nacimiento"
                value={formatDate(row.skater.dateOfBirth)}
              />
              <InfoField label="Edad" value={`${row.age} años`} />
              <InfoField label="Teléfono" value={row.skater.telephone} />
              <InfoField label="Correo" value={row.skater.email} />
              <InfoField label="Entrenador" value={coachName} />
              <InfoField
                label="Registrado el"
                value={formatDate(row.skater.createdAt)}
              />
            </div>
          </Card>

          <Card title="Últimas sesiones">
            {!capture ? (
              <EmptyState
                title="Sin vínculo con captura"
                description={CAPTURE_PENDING}
              />
            ) : capture.isLoading ? (
              <Spinner label="Cargando sesiones…" />
            ) : capture.error ? (
              <EmptyState
                tone="error"
                title="No se pudieron cargar las sesiones"
                description={capture.error.message}
              />
            ) : (
              <SessionTable
                sessions={capture.sessions.slice(0, 5)}
                plain
                emptyMessage="Todavía no tiene sesiones registradas."
              />
            )}
          </Card>
        </div>

        <aside aria-label="Estadísticas">
          {capture ? (
            <SessionStats stats={capture.stats} today={today} />
          ) : (
            <Card>
              <EmptyState
                title="Estadísticas no disponibles"
                description={CAPTURE_PENDING}
              />
            </Card>
          )}
        </aside>
      </div>
    )}

    <style jsx>{SkaterProfileStyles}</style>
  </div>
);

export default SkaterProfileComponent;
