"use client";
import SessionForm from "@/components/modules/SessionForm";
import { useCreateSession } from "@/hooks/data/useSession";
import { getEmptySessionFormValues } from "@/models/session.schema";

export type SessionCreateProps = {
  // Atleta precargado (por ejemplo, desde su historial)
  athleteId?: string;
};

// Nueva sesión (POST /api/v1/sessions)
const SessionCreateContainer = ({ athleteId }: SessionCreateProps) => {
  const createSession = useCreateSession();
  return (
    <SessionForm
      mode="create"
      initialValues={getEmptySessionFormValues(athleteId)}
      backHref="/sessions/history"
      onSave={createSession}
    />
  );
};

export default SessionCreateContainer;
