"use client";
import Spinner from "@/components/atoms/Spinner";
import SessionForm from "@/components/modules/SessionForm";
import BackLink from "@/components/molecules/BackLink";
import Card from "@/components/molecules/Card";
import EmptyState from "@/components/molecules/EmptyState";
import { useSession } from "@/hooks/data/useSession";
import { sessionToFormValues } from "@/models/session.schema";

import SessionEditStyles from "./sessionEdit.styles";

export type SessionEditProps = {
  sessionId: string;
};

// Edición completa de una sesión (PUT /api/v1/sessions/{id})
const SessionEditContainer = ({ sessionId }: SessionEditProps) => {
  const { session, isLoading, error, updateSession } = useSession(sessionId);
  const backHref = `/sessions/${sessionId}`;

  if (session) {
    return (
      <SessionForm
        // Se reinicia si llega otra versión de la sesión
        key={session.version}
        mode="edit"
        initialValues={sessionToFormValues(session)}
        version={session.version}
        backHref={backHref}
        onSave={updateSession}
      />
    );
  }

  return (
    <div className="sessionEdit">
      <BackLink href={backHref} label="Volver a la sesión" />
      <Card>
        {isLoading ? (
          <Spinner label="Cargando sesión…" />
        ) : (
          <EmptyState
            tone="error"
            title={
              error?.status === 404
                ? "La sesión no existe"
                : "No se pudo cargar la sesión"
            }
            description={error?.status === 404 ? undefined : error?.message}
          />
        )}
      </Card>

      <style jsx>{SessionEditStyles}</style>
    </div>
  );
};

export default SessionEditContainer;
