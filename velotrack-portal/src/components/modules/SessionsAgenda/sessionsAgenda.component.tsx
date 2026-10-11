import { Plus } from "lucide-react";

import Button from "@/components/atoms/Button";
import Spinner from "@/components/atoms/Spinner";
import TextInput from "@/components/atoms/TextInput";
import Card from "@/components/molecules/Card";
import EmptyState from "@/components/molecules/EmptyState";
import FormField from "@/components/molecules/FormField";
import PageHeader from "@/components/molecules/PageHeader";
import Pagination from "@/components/molecules/Pagination";
import SessionTable from "@/components/molecules/SessionTable";
import type { TrainingSession } from "@/models/session.model";
import type { ApiError } from "@/services/http/apiError";

import SessionsAgendaStyles from "./sessionsAgenda.styles";

export type SessionsAgendaProps = {
  sessions: TrainingSession[];
  athleteNames: Map<number, string>;
  isLoading: boolean;
  error: ApiError | null;
  fromDate: string;
  toDate: string;
  team: boolean;
  offset: number;
  limit: number;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onTeamChange: (team: boolean) => void;
  onOffsetChange: (offset: number) => void;
};

const SessionsAgendaComponent = ({
  sessions,
  athleteNames,
  isLoading,
  error,
  fromDate,
  toDate,
  team,
  offset,
  limit,
  onFromDateChange,
  onToDateChange,
  onTeamChange,
  onOffsetChange,
}: SessionsAgendaProps) => (
  <div className="sessionsAgenda">
    <PageHeader
      title="Agenda"
      description="Sesiones programadas. Para registrar una, créala con estado Programada y fecha futura."
      actions={
        <Button icon={<Plus size={16} />} href="/sessions/new">
          Nueva sesión
        </Button>
      }
    />

    <div className="sessionsAgenda__filters">
      <div className="sessionsAgenda__date">
        <FormField label="Desde" htmlFor="agenda-from">
          <TextInput
            id="agenda-from"
            type="date"
            value={fromDate}
            onChange={(event) => onFromDateChange(event.target.value)}
          />
        </FormField>
      </div>
      <div className="sessionsAgenda__date">
        <FormField label="Hasta" htmlFor="agenda-to">
          <TextInput
            id="agenda-to"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(event) => onToDateChange(event.target.value)}
          />
        </FormField>
      </div>
      <div className="sessionsAgenda__scope" role="group" aria-label="Alcance">
        <Button
          variant="secondary"
          isActive={!team}
          onClick={() => onTeamChange(false)}
        >
          Mis sesiones
        </Button>
        <Button
          variant="secondary"
          isActive={team}
          onClick={() => onTeamChange(true)}
        >
          Mi equipo
        </Button>
      </div>
    </div>

    <Card padded={false}>
      {isLoading ? (
        <Spinner label="Cargando agenda…" />
      ) : error ? (
        <EmptyState
          tone="error"
          title="No se pudo cargar la agenda"
          description={error.message}
        />
      ) : (
        <>
          <SessionTable
            sessions={sessions}
            showAthlete
            athleteNames={athleteNames}
            emptyMessage="No hay sesiones programadas en estas fechas."
          />
          <div className="sessionsAgenda__footer">
            <Pagination
              offset={offset}
              limit={limit}
              pageCount={sessions.length}
              itemLabel="sesiones"
              onChange={onOffsetChange}
            />
          </div>
        </>
      )}
    </Card>

    <style jsx>{SessionsAgendaStyles}</style>
  </div>
);

export default SessionsAgendaComponent;
