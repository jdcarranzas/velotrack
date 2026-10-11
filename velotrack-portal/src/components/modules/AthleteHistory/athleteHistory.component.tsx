import { Plus, Search } from "lucide-react";

import Button from "@/components/atoms/Button";
import Select, { type SelectOption } from "@/components/atoms/Select";
import Spinner from "@/components/atoms/Spinner";
import TextInput from "@/components/atoms/TextInput";
import Card from "@/components/molecules/Card";
import EmptyState from "@/components/molecules/EmptyState";
import FormField from "@/components/molecules/FormField";
import PageHeader from "@/components/molecules/PageHeader";
import Pagination from "@/components/molecules/Pagination";
import SessionStats from "@/components/molecules/SessionStats";
import SessionTable from "@/components/molecules/SessionTable";
import type { TrainingSession } from "@/models/session.model";
import type { AthleteStats } from "@/models/session.selectors";
import type { ApiError } from "@/services/http/apiError";

import AthleteHistoryStyles from "./athleteHistory.styles";

export type HistoryDraft = {
  athleteId: string;
  from: string;
  to: string;
};

export type AthleteHistoryProps = {
  draft: HistoryDraft;
  draftError: string | null;
  // Patinador consultado (el de la URL)
  athleteId: number | null;
  skaterOptions: SelectOption[];
  isLoadingSkaters: boolean;
  sessions: TrainingSession[];
  stats: AthleteStats;
  today: Date;
  isLoading: boolean;
  error: ApiError | null;
  offset: number;
  limit: number;
  onDraftChange: (draft: HistoryDraft) => void;
  onSearch: () => void;
  onOffsetChange: (offset: number) => void;
};

const AthleteHistoryComponent = ({
  draft,
  draftError,
  athleteId,
  skaterOptions,
  isLoadingSkaters,
  sessions,
  stats,
  today,
  isLoading,
  error,
  offset,
  limit,
  onDraftChange,
  onSearch,
  onOffsetChange,
}: AthleteHistoryProps) => (
  <div className="athleteHistory">
    <PageHeader
      title="Historial por atleta"
      description="Sesiones de captura de un atleta con sus métricas y observaciones."
      actions={
        athleteId !== null && (
          <Button
            icon={<Plus size={16} />}
            href={`/sessions/new?athleteId=${athleteId}`}
          >
            Nueva sesión para este atleta
          </Button>
        )
      }
    />

    <Card>
      <form
        className="athleteHistory__search"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <FormField
          label="Patinador"
          htmlFor="history-athleteId"
          error={draftError ?? undefined}
        >
          <Select
            id="history-athleteId"
            value={draft.athleteId}
            invalid={!!draftError}
            disabled={isLoadingSkaters}
            placeholder={
              isLoadingSkaters ? "Cargando patinadores…" : "Elige un patinador"
            }
            options={skaterOptions}
            onChange={(event) =>
              onDraftChange({ ...draft, athleteId: event.target.value })
            }
          />
        </FormField>
        <FormField label="Desde" htmlFor="history-from">
          <TextInput
            id="history-from"
            type="date"
            value={draft.from}
            onChange={(event) =>
              onDraftChange({ ...draft, from: event.target.value })
            }
          />
        </FormField>
        <FormField label="Hasta" htmlFor="history-to">
          <TextInput
            id="history-to"
            type="date"
            value={draft.to}
            min={draft.from}
            onChange={(event) =>
              onDraftChange({ ...draft, to: event.target.value })
            }
          />
        </FormField>
        <Button type="submit" icon={<Search size={16} />}>
          Buscar
        </Button>
      </form>
    </Card>

    {athleteId === null ? (
      <Card>
        <EmptyState
          title="Elige un patinador"
          description="Se muestran los patinadores de tus equipos."
        />
      </Card>
    ) : isLoading ? (
      <Card>
        <Spinner label="Cargando historial…" />
      </Card>
    ) : error ? (
      <Card>
        <EmptyState
          tone="error"
          title="No se pudo cargar el historial"
          description={error.message}
        />
      </Card>
    ) : (
      <>
        <SessionStats stats={stats} today={today} layout="row" />
        <Card padded={false}>
          <SessionTable
            sessions={sessions}
            emptyMessage="Este atleta no tiene sesiones en estas fechas."
          />
          <div className="athleteHistory__footer">
            <Pagination
              offset={offset}
              limit={limit}
              pageCount={sessions.length}
              itemLabel="sesiones"
              onChange={onOffsetChange}
            />
          </div>
        </Card>
      </>
    )}

    <style jsx>{AthleteHistoryStyles}</style>
  </div>
);

export default AthleteHistoryComponent;
