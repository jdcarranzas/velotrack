import StatCard from "@/components/molecules/StatCard";
import {
  type AthleteStats,
  RECENT_SESSIONS_FOR_AVERAGE,
} from "@/models/session.selectors";
import { formatMonthYear, formatShortDate } from "@/utils/helpers/date";
import { formatLapMs, formatSpeedKmh } from "@/utils/helpers/format";

import SessionStatsStyles from "./sessionStats.styles";

export type SessionStatsProps = {
  stats: AthleteStats;
  today: Date;
  // 1 columna (perfil, a la derecha) o 4 (historial, arriba)
  layout?: "column" | "row";
};

// Las cuatro tarjetas del perfil: mejor vuelta, velocidad máxima, sesiones del
// mes y promedio de vuelta.
const SessionStatsComponent = ({
  stats,
  today,
  layout = "column",
}: SessionStatsProps) => {
  const { bestLap, maxSpeedKmh, sessionsThisMonth, averageLapMs } = stats;
  return (
    <div
      className="sessionStats"
      style={{ "--columns": layout === "row" ? 4 : 1 } as React.CSSProperties}
    >
      <StatCard
        label="Mejor vuelta"
        value={bestLap ? formatLapMs(bestLap.timeMs) : null}
        caption={
          bestLap
            ? formatShortDate(bestLap.session.sessionDate)
            : "Sin vueltas registradas"
        }
        tone="primary"
      />
      <StatCard
        label="Vel. máx. registrada"
        value={maxSpeedKmh === null ? null : formatSpeedKmh(maxSpeedKmh)}
        unit="km/h"
        caption="En el periodo consultado"
        tone="success"
      />
      <StatCard
        label="Sesiones en el mes"
        value={sessionsThisMonth}
        caption={formatMonthYear(today)}
        tone="accent"
      />
      <StatCard
        label="Promedio vuelta"
        value={averageLapMs === null ? null : formatLapMs(averageLapMs)}
        caption={`Últimas ${RECENT_SESSIONS_FOR_AVERAGE} sesiones con vueltas`}
        tone="warning"
      />

      <style jsx>{SessionStatsStyles}</style>
    </div>
  );
};

export default SessionStatsComponent;
