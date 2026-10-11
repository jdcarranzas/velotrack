"use client";
import { useSession } from "@/hooks/data/useSession";
import { useSkaters } from "@/hooks/data/useSkaters";

import SessionDetailComponent from "./sessionDetail.component";

export type SessionDetailContainerProps = {
  sessionId: string;
};

const SessionDetailContainer = ({ sessionId }: SessionDetailContainerProps) => {
  const { session, isLoading, error, updateObservations } =
    useSession(sessionId);
  const { rows } = useSkaters();
  const athleteName =
    rows.find((row) => row.skater.id === session?.athleteId)?.skater.name ??
    null;
  return (
    <SessionDetailComponent
      session={session}
      athleteName={athleteName}
      isLoading={isLoading}
      error={error}
      onSaveObservations={updateObservations}
    />
  );
};

export default SessionDetailContainer;
