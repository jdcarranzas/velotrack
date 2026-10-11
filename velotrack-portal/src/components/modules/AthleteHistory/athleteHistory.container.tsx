"use client";
import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useAthleteSessions } from "@/hooks/data/useAthleteSessions";
import { useSkaters } from "@/hooks/data/useSkaters";
import { useToday } from "@/hooks/useToday";
import { getAthleteStats } from "@/models/session.selectors";
import { toSkaterOptions } from "@/models/talent.selectors";
import { HISTORY_DEFAULT_DAYS } from "@/utils/constants/sessions";
import {
  addDays,
  endOfDayExclusiveIso,
  startOfDayIso,
  toDateInputValue,
} from "@/utils/helpers/date";

import AthleteHistoryComponent, {
  type HistoryDraft,
} from "./athleteHistory.component";

// Captura devuelve como máximo 100 por página; con una página se calculan las
// estadísticas de todo el periodo en casi todos los casos.
const HISTORY_PAGE_SIZE = 100;

// "7" → 7; cualquier otra cosa → null
const parseSkaterId = (value: string | undefined): number | null => {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : null;
};

export type AthleteHistoryContainerProps = {
  // Valores de la URL (?athleteId&from&to). athleteId es el id del patinador.
  athleteId?: string;
  from?: string;
  to?: string;
};

// Historial de un patinador (GET /api/v1/athletes/{id}/sessions). La URL guarda
// la consulta para poder compartirla o volver a ella.
const AthleteHistoryContainer = ({
  athleteId,
  from,
  to,
}: AthleteHistoryContainerProps) => {
  const router = useRouter();
  const today = useToday();
  const skaters = useSkaters();
  const defaultFrom = toDateInputValue(addDays(today, -HISTORY_DEFAULT_DAYS));
  const defaultTo = toDateInputValue(today);
  const query = {
    athleteId: parseSkaterId(athleteId),
    from: from || defaultFrom,
    to: to || defaultTo,
  };

  const [draft, setDraft] = useState<HistoryDraft>({
    athleteId: query.athleteId === null ? "" : String(query.athleteId),
    from: query.from,
    to: query.to,
  });
  const [draftError, setDraftError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const { sessions, isLoading, error } = useAthleteSessions(query.athleteId, {
    from: startOfDayIso(query.from),
    to: endOfDayExclusiveIso(query.to),
    limit: HISTORY_PAGE_SIZE,
    offset,
  });
  const stats = useMemo(
    () => getAthleteStats(sessions, today),
    [sessions, today],
  );

  const search = () => {
    const id = parseSkaterId(draft.athleteId);
    if (id === null) {
      setDraftError("Elige un patinador");
      return;
    }
    setDraftError(null);
    setOffset(0);
    const params = new URLSearchParams({ athleteId: String(id) });
    if (draft.from) params.set("from", draft.from);
    if (draft.to) params.set("to", draft.to);
    router.push(`/sessions/history?${params.toString()}`);
  };

  return (
    <AthleteHistoryComponent
      draft={draft}
      draftError={draftError}
      athleteId={query.athleteId}
      skaterOptions={toSkaterOptions(skaters.rows)}
      isLoadingSkaters={skaters.isLoading}
      sessions={sessions}
      stats={stats}
      today={today}
      isLoading={isLoading}
      error={error}
      offset={offset}
      limit={HISTORY_PAGE_SIZE}
      onDraftChange={setDraft}
      onSearch={search}
      onOffsetChange={setOffset}
    />
  );
};

export default AthleteHistoryContainer;
