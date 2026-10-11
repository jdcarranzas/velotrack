"use client";
import { useState } from "react";

import { useAgenda } from "@/hooks/data/useAgenda";
import { useSkaters } from "@/hooks/data/useSkaters";
import { useToday } from "@/hooks/useToday";
import { getSkaterNames } from "@/models/talent.selectors";
import {
  AGENDA_DEFAULT_DAYS,
  SESSIONS_PAGE_SIZE,
} from "@/utils/constants/sessions";
import {
  addDays,
  endOfDayExclusiveIso,
  startOfDayIso,
  toDateInputValue,
} from "@/utils/helpers/date";

import SessionsAgendaComponent from "./sessionsAgenda.component";

// Agenda (GET /api/v1/agenda): sesiones PROGRAMADA del entrenador o su equipo
const SessionsAgendaContainer = () => {
  const today = useToday();
  const skaters = useSkaters();
  const [fromDate, setFromDate] = useState(() => toDateInputValue(today));
  const [toDate, setToDate] = useState(() =>
    toDateInputValue(addDays(today, AGENDA_DEFAULT_DAYS)),
  );
  const [team, setTeam] = useState(false);
  const [offset, setOffset] = useState(0);

  const { sessions, isLoading, error } = useAgenda({
    from: fromDate ? startOfDayIso(fromDate) : "",
    to: toDate ? endOfDayExclusiveIso(toDate) : "",
    team,
    limit: SESSIONS_PAGE_SIZE,
    offset,
  });

  // Cambiar un filtro vuelve a la primera página
  const withReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setOffset(0);
    };

  return (
    <SessionsAgendaComponent
      sessions={sessions}
      athleteNames={getSkaterNames(skaters.rows)}
      isLoading={isLoading}
      error={error}
      fromDate={fromDate}
      toDate={toDate}
      team={team}
      offset={offset}
      limit={SESSIONS_PAGE_SIZE}
      onFromDateChange={withReset(setFromDate)}
      onToDateChange={withReset(setToDate)}
      onTeamChange={withReset(setTeam)}
      onOffsetChange={setOffset}
    />
  );
};

export default SessionsAgendaContainer;
