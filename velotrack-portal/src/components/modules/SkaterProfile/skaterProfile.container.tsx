"use client";
import { useMemo } from "react";

import { useCoachSession } from "@/context/CoachSession";
import { useAthleteSessions } from "@/hooks/data/useAthleteSessions";
import { useSkater } from "@/hooks/data/useSkater";
import { useToday } from "@/hooks/useToday";
import { getAthleteStats } from "@/models/session.selectors";
import { HISTORY_DEFAULT_DAYS } from "@/utils/constants/sessions";
import { FEATURES } from "@/utils/features";
import { addDays } from "@/utils/helpers/date";

import SkaterProfileComponent from "./skaterProfile.component";

export type SkaterProfileContainerProps = {
  skaterId: number;
};

const SkaterProfileContainer = ({ skaterId }: SkaterProfileContainerProps) => {
  const { row, isLoading, error } = useSkater(skaterId);
  const { coach } = useCoachSession();
  const today = useToday();

  const range = useMemo(
    () => ({
      from: addDays(today, -HISTORY_DEFAULT_DAYS).toISOString(),
      to: addDays(today, 1).toISOString(),
      limit: 100,
      offset: 0,
    }),
    [today],
  );
  // Con captureLink apagado no se pide nada (athleteId null)
  const athleteId = FEATURES.captureLink && row ? row.skater.id : null;
  const capture = useAthleteSessions(athleteId, range);
  const stats = useMemo(
    () => getAthleteStats(capture.sessions, today),
    [capture.sessions, today],
  );

  return (
    <SkaterProfileComponent
      row={row}
      coachName={coach?.name ?? null}
      isLoading={isLoading}
      error={error}
      capture={athleteId !== null ? { ...capture, stats } : null}
      today={today}
    />
  );
};

export default SkaterProfileContainer;
