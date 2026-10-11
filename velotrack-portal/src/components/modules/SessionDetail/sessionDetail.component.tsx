import { History, Pencil } from "lucide-react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Spinner from "@/components/atoms/Spinner";
import BackLink from "@/components/molecules/BackLink";
import Card from "@/components/molecules/Card";
import DataTable from "@/components/molecules/DataTable";
import EmptyState from "@/components/molecules/EmptyState";
import InfoField from "@/components/molecules/InfoField";
import StatCard from "@/components/molecules/StatCard";
import type { TrainingSession } from "@/models/session.model";
import { getSessionBestLapMs } from "@/models/session.selectors";
import type { ApiError } from "@/services/http/apiError";
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_TONES,
} from "@/utils/constants/sessions";
import { formatDateTime } from "@/utils/helpers/date";
import { formatLapMs, formatSpeedKmh } from "@/utils/helpers/format";

import ObservationsEditor from "./ObservationsEditor";
import SessionDetailStyles from "./sessionDetail.styles";

export type SessionDetailProps = {
  session: TrainingSession | null;
  // Nombre del patinador (de talentms), si es de los equipos del entrenador
  athleteName: string | null;
  isLoading: boolean;
  error: ApiError | null;
  onSaveObservations: (observations: string | null) => Promise<void>;
};

const speed = (kmh: number | null) =>
  kmh === null ? null : formatSpeedKmh(kmh);

const formatBestLap = (session: TrainingSession) => {
  const bestLapMs = getSessionBestLapMs(session);
  return bestLapMs === null ? null : formatLapMs(bestLapMs);
};

const SessionDetailComponent = ({
  session,
  athleteName,
  isLoading,
  error,
  onSaveObservations,
}: SessionDetailProps) => (
  <div className="sessionDetail">
    <BackLink href="/sessions/history" label="Volver a Sesiones" />

    {isLoading ? (
      <Card>
        <Spinner label="Cargando sesión…" />
      </Card>
    ) : !session ? (
      <Card>
        <EmptyState
          tone="error"
          title={
            error?.status === 404
              ? "La sesión no existe"
              : "No se pudo cargar la sesión"
          }
          description={error?.status === 404 ? undefined : error?.message}
        />
      </Card>
    ) : (
      <div className="sessionDetail__content">
        <Card
          actions={
            <>
              {session.athleteId !== null && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<History size={12} />}
                  href={`/sessions/history?athleteId=${session.athleteId}`}
                >
                  Historial del atleta
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                icon={<Pencil size={12} />}
                href={`/sessions/${session.id}/edit`}
              >
                Editar sesión
              </Button>
            </>
          }
        >
          <h1 className="sessionDetail__title">
            Sesión del {formatDateTime(session.sessionDate)}
            <Badge tone={SESSION_STATUS_TONES[session.status]}>
              {SESSION_STATUS_LABELS[session.status]}
            </Badge>
          </h1>
          <div className="sessionDetail__info">
            <InfoField
              label="Patinador"
              value={
                athleteName ??
                (session.athleteId === null
                  ? null
                  : `Patinador ${session.athleteId}`)
              }
            />
            <InfoField label="Entrenador" value={session.coachId} mono />
            <InfoField label="Equipo" value={session.teamId} mono />
            <InfoField
              label="Creada"
              value={formatDateTime(session.createdAt)}
            />
            <InfoField
              label="Última edición"
              value={formatDateTime(session.updatedAt)}
            />
            <InfoField label="Versión" value={session.version} mono />
          </div>
        </Card>

        <div className="sessionDetail__stats">
          <StatCard
            label="Vel. de salida"
            value={speed(session.technical.startSpeedKmh)}
            unit="km/h"
            tone="neutral"
          />
          <StatCard
            label="Vel. máxima"
            value={speed(session.technical.maxSpeedKmh)}
            unit="km/h"
            tone="success"
          />
          <StatCard
            label="Vel. media"
            value={speed(session.technical.averageSpeedKmh)}
            unit="km/h"
            tone="neutral"
          />
          <StatCard
            label="Vueltas"
            value={session.technical.completedLaps}
            tone="accent"
          />
          <StatCard
            label="Mejor vuelta"
            value={formatBestLap(session)}
            tone="primary"
          />
        </div>

        <div className="sessionDetail__columns">
          <Card title="Tiempos por vuelta">
            <DataTable
              plain
              caption="Tiempos por vuelta"
              rows={session.technical.laps.map((lap, index) => ({
                ...lap,
                index,
              }))}
              getRowKey={(lap) => lap.index}
              emptyMessage="Sin vueltas registradas."
              columns={[
                {
                  key: "index",
                  header: "Vuelta",
                  mono: true,
                  muted: true,
                  render: (lap) => `#${lap.index + 1}`,
                },
                {
                  key: "time",
                  header: "Tiempo",
                  mono: true,
                  align: "right",
                  render: (lap) => formatLapMs(lap.timeMs),
                },
                {
                  key: "splits",
                  header: "Parciales",
                  mono: true,
                  muted: true,
                  align: "right",
                  render: (lap) =>
                    lap.splitsMs.length
                      ? lap.splitsMs.map(formatLapMs).join(" · ")
                      : "—",
                },
              ]}
            />
          </Card>

          <Card title="Intervalos">
            <DataTable
              plain
              caption="Intervalos"
              rows={session.technical.intervals.map((interval, index) => ({
                ...interval,
                index,
              }))}
              getRowKey={(interval) => interval.index}
              emptyMessage="Sin intervalos registrados."
              columns={[
                {
                  key: "range",
                  header: "Tramo (s)",
                  mono: true,
                  render: (interval) =>
                    `${interval.fromSecond} – ${interval.toSecond}`,
                },
                {
                  key: "laps",
                  header: "Vueltas",
                  align: "right",
                  mono: true,
                  render: (interval) => interval.completedLaps,
                },
              ]}
            />
          </Card>
        </div>

        <div className="sessionDetail__columns">
          <Card title="Indicadores físicos">
            <div className="sessionDetail__info">
              <InfoField
                label="Resistencia"
                value={
                  session.physical.resistanceScore === null
                    ? null
                    : `${session.physical.resistanceScore} / 10`
                }
              />
              <InfoField
                label="Recuperación"
                value={
                  session.physical.recoverySeconds === null
                    ? null
                    : `${session.physical.recoverySeconds} s`
                }
              />
            </div>
          </Card>

          <Card title="Observaciones">
            <ObservationsEditor
              // Se reinicia con cada versión guardada
              key={session.version}
              observations={session.observations}
              onSave={onSaveObservations}
            />
          </Card>
        </div>
      </div>
    )}

    <style jsx>{SessionDetailStyles}</style>
  </div>
);

export default SessionDetailComponent;
