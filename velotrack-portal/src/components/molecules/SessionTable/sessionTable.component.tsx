import { ArrowRight } from "lucide-react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import DataTable, {
  type DataTableColumn,
} from "@/components/molecules/DataTable";
import type { TrainingSession } from "@/models/session.model";
import { getSessionBestLapMs } from "@/models/session.selectors";
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_TONES,
} from "@/utils/constants/sessions";
import { formatDateTime } from "@/utils/helpers/date";
import { formatLapMs, formatSpeedKmh } from "@/utils/helpers/format";

export type SessionTableProps = {
  sessions: TrainingSession[];
  // Columna con el atleta (en la agenda); en el historial sobra
  showAthlete?: boolean;
  // Nombres de los patinadores por id, para la columna del atleta
  athleteNames?: Map<number, string>;
  plain?: boolean;
  emptyMessage?: string;
  footer?: React.ReactNode;
};

const getAthleteColumn = (
  athleteNames: Map<number, string>,
): DataTableColumn<TrainingSession> => ({
  key: "athlete",
  header: "Atleta",
  render: (session) =>
    session.athleteId === null ? (
      "—"
    ) : (
      <Button
        variant="ghost"
        size="sm"
        href={`/sessions/history?athleteId=${session.athleteId}`}
      >
        {athleteNames.get(session.athleteId) ??
          `Patinador ${session.athleteId}`}
      </Button>
    ),
});

const COLUMNS: DataTableColumn<TrainingSession>[] = [
  {
    key: "date",
    header: "Fecha",
    mono: true,
    muted: true,
    render: (session) => formatDateTime(session.sessionDate),
  },
  {
    key: "status",
    header: "Estado",
    render: (session) => (
      <Badge tone={SESSION_STATUS_TONES[session.status]}>
        {SESSION_STATUS_LABELS[session.status]}
      </Badge>
    ),
  },
  {
    key: "laps",
    header: "Vueltas",
    align: "center",
    render: (session) => session.technical.completedLaps ?? "—",
  },
  {
    key: "bestLap",
    header: "Mejor vuelta",
    align: "right",
    mono: true,
    render: (session) => {
      const bestLapMs = getSessionBestLapMs(session);
      return bestLapMs === null ? "—" : formatLapMs(bestLapMs);
    },
  },
  {
    key: "maxSpeed",
    header: "Vel. máx.",
    align: "right",
    mono: true,
    render: (session) =>
      session.technical.maxSpeedKmh === null
        ? "—"
        : `${formatSpeedKmh(session.technical.maxSpeedKmh)} km/h`,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: (session) => (
      <Button variant="ghost" size="sm" href={`/sessions/${session.id}`}>
        Ver
        <ArrowRight size={12} aria-hidden="true" />
      </Button>
    ),
  },
];

// Tabla de sesiones de captura ("Últimas sesiones" del perfil, historial y agenda)
const SessionTableComponent = ({
  sessions,
  showAthlete = false,
  athleteNames = new Map(),
  plain = false,
  emptyMessage = "No hay sesiones en este periodo.",
  footer,
}: SessionTableProps) => (
  <DataTable
    columns={
      showAthlete
        ? [COLUMNS[0], getAthleteColumn(athleteNames), ...COLUMNS.slice(1)]
        : COLUMNS
    }
    rows={sessions}
    getRowKey={(session) => session.id}
    plain={plain}
    caption="Sesiones"
    emptyMessage={emptyMessage}
    footer={footer}
  />
);

export default SessionTableComponent;
