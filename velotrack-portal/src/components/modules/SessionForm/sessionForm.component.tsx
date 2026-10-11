import { Plus, Trash2 } from "lucide-react";

import Button from "@/components/atoms/Button";
import Select, { type SelectOption } from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import TextInput from "@/components/atoms/TextInput";
import BackLink from "@/components/molecules/BackLink";
import Card from "@/components/molecules/Card";
import FormActions from "@/components/molecules/FormActions";
import FormError from "@/components/molecules/FormError";
import FormField from "@/components/molecules/FormField";
import FormGrid from "@/components/molecules/FormGrid";
import PageHeader from "@/components/molecules/PageHeader";
import { SESSION_STATUSES } from "@/models/session.model";
import type {
  SessionFormValues,
  SessionIntervalFormValues,
  SessionLapFormValues,
} from "@/models/session.schema";
import type { ApiError } from "@/services/http/apiError";
import { SESSION_STATUS_LABELS } from "@/utils/constants/sessions";
import type { FieldErrors } from "@/utils/helpers/forms";

import SessionFormStyles from "./sessionForm.styles";

type TextField = Exclude<keyof SessionFormValues, "laps" | "intervals">;

export type SessionFormProps = {
  mode: "create" | "edit";
  values: SessionFormValues;
  errors: FieldErrors;
  // Patinadores de los equipos del entrenador
  athleteOptions: SelectOption[];
  isLoadingAthletes: boolean;
  submitError: ApiError | null;
  isSubmitting: boolean;
  backHref: string;
  onChange: (field: TextField, value: string) => void;
  onLapChange: (
    index: number,
    field: keyof SessionLapFormValues,
    value: string,
  ) => void;
  onAddLap: () => void;
  onRemoveLap: (index: number) => void;
  onIntervalChange: (
    index: number,
    field: keyof SessionIntervalFormValues,
    value: string,
  ) => void;
  onAddInterval: () => void;
  onRemoveInterval: (index: number) => void;
  onSubmit: () => void;
};

const STATUS_OPTIONS = SESSION_STATUSES.map((status) => ({
  value: status,
  label: SESSION_STATUS_LABELS[status],
}));

const STATUS_HINTS: Record<string, string> = {
  PROGRAMADA:
    "Sesión futura: aparece en la agenda. Las métricas son opcionales.",
  BORRADOR: "Guardado parcial: las métricas son opcionales.",
  COMPLETADA:
    "Exige velocidad de salida, número de vueltas y el tiempo de cada vuelta.",
};

const SessionFormComponent = ({
  mode,
  values,
  errors,
  athleteOptions,
  isLoadingAthletes,
  submitError,
  isSubmitting,
  backHref,
  onChange,
  onLapChange,
  onAddLap,
  onRemoveLap,
  onIntervalChange,
  onAddInterval,
  onRemoveInterval,
  onSubmit,
}: SessionFormProps) => (
  <div className="sessionForm">
    <div>
      <BackLink
        href={backHref}
        label={mode === "edit" ? "Volver a la sesión" : "Volver a la agenda"}
      />
      <PageHeader
        title={mode === "edit" ? "Editar sesión" : "Nueva sesión"}
        description={
          mode === "edit"
            ? "Guardar reemplaza todo el contenido de la sesión. El atleta no se puede cambiar."
            : "Registra una sesión completada, un borrador o una sesión programada."
        }
      />
    </div>

    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Card title="Datos de la sesión">
        <FormGrid columns={3}>
          <FormField
            label="Patinador"
            htmlFor="session-athleteId"
            error={errors.athleteId}
            hint={mode === "edit" ? "No se puede cambiar" : undefined}
          >
            <Select
              id="session-athleteId"
              value={values.athleteId}
              invalid={!!errors.athleteId}
              disabled={mode === "edit" || isLoadingAthletes}
              placeholder={
                isLoadingAthletes
                  ? "Cargando patinadores…"
                  : "Elige un patinador"
              }
              options={athleteOptions}
              onChange={(event) => onChange("athleteId", event.target.value)}
            />
          </FormField>
          <FormField
            label="Fecha y hora"
            htmlFor="session-date"
            error={errors.sessionDate}
          >
            <TextInput
              id="session-date"
              type="datetime-local"
              value={values.sessionDate}
              invalid={!!errors.sessionDate}
              onChange={(event) => onChange("sessionDate", event.target.value)}
            />
          </FormField>
          <FormField
            label="Estado"
            htmlFor="session-status"
            error={errors.status}
            hint={STATUS_HINTS[values.status]}
          >
            <Select
              id="session-status"
              value={values.status}
              options={STATUS_OPTIONS}
              onChange={(event) => onChange("status", event.target.value)}
            />
          </FormField>
        </FormGrid>
      </Card>

      <div className="sessionForm__gap" aria-hidden="true" />

      <Card
        title="Métricas técnicas"
        description="Velocidades en km/h (0-150)."
      >
        <FormGrid columns={4}>
          <FormField
            label="Velocidad de salida"
            htmlFor="session-startSpeed"
            error={errors.startSpeedKmh}
            optional={values.status !== "COMPLETADA"}
          >
            <TextInput
              id="session-startSpeed"
              inputMode="decimal"
              mono
              value={values.startSpeedKmh}
              invalid={!!errors.startSpeedKmh}
              onChange={(event) =>
                onChange("startSpeedKmh", event.target.value)
              }
            />
          </FormField>
          <FormField
            label="Velocidad máxima"
            htmlFor="session-maxSpeed"
            error={errors.maxSpeedKmh}
            optional
          >
            <TextInput
              id="session-maxSpeed"
              inputMode="decimal"
              mono
              value={values.maxSpeedKmh}
              invalid={!!errors.maxSpeedKmh}
              onChange={(event) => onChange("maxSpeedKmh", event.target.value)}
            />
          </FormField>
          <FormField
            label="Velocidad media"
            htmlFor="session-averageSpeed"
            error={errors.averageSpeedKmh}
            optional
          >
            <TextInput
              id="session-averageSpeed"
              inputMode="decimal"
              mono
              value={values.averageSpeedKmh}
              invalid={!!errors.averageSpeedKmh}
              onChange={(event) =>
                onChange("averageSpeedKmh", event.target.value)
              }
            />
          </FormField>
          <FormField
            label="Vueltas completadas"
            htmlFor="session-completedLaps"
            error={errors.completedLaps}
            optional={values.status !== "COMPLETADA"}
          >
            <TextInput
              id="session-completedLaps"
              inputMode="numeric"
              mono
              value={values.completedLaps}
              invalid={!!errors.completedLaps}
              onChange={(event) =>
                onChange("completedLaps", event.target.value)
              }
            />
          </FormField>
        </FormGrid>

        <h3 className="sessionForm__sectionTitle">Tiempos por vuelta</h3>
        <div className="sessionForm__rows">
          {values.laps.length === 0 && (
            <p className="sessionForm__empty">Sin vueltas registradas.</p>
          )}
          {values.laps.map((lap, index) => (
            <div key={index} className="sessionForm__row">
              <span className="sessionForm__index">#{index + 1}</span>
              <FormField
                label="Tiempo (s)"
                htmlFor={`lap-${index}-time`}
                error={errors[`laps.${index}.time`]}
              >
                <TextInput
                  id={`lap-${index}-time`}
                  inputMode="decimal"
                  mono
                  placeholder="16.21"
                  value={lap.time}
                  invalid={!!errors[`laps.${index}.time`]}
                  onChange={(event) =>
                    onLapChange(index, "time", event.target.value)
                  }
                />
              </FormField>
              <FormField
                label="Parciales (s)"
                htmlFor={`lap-${index}-splits`}
                error={errors[`laps.${index}.splits`]}
                hint="Separados por espacio. Su suma no puede superar la vuelta."
                optional
              >
                <TextInput
                  id={`lap-${index}-splits`}
                  mono
                  placeholder="8.1 8.11"
                  value={lap.splits}
                  invalid={!!errors[`laps.${index}.splits`]}
                  onChange={(event) =>
                    onLapChange(index, "splits", event.target.value)
                  }
                />
              </FormField>
              <Button
                variant="ghost"
                ariaLabel={`Quitar vuelta ${index + 1}`}
                icon={<Trash2 size={14} />}
                onClick={() => onRemoveLap(index)}
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>
        {errors.laps && (
          <p className="sessionForm__listError" role="alert">
            {errors.laps}
          </p>
        )}
        <div className="sessionForm__add">
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={12} />}
            onClick={onAddLap}
          >
            Agregar vuelta
          </Button>
        </div>

        <h3 className="sessionForm__sectionTitle">Intervalos</h3>
        <div className="sessionForm__rows">
          {values.intervals.length === 0 && (
            <p className="sessionForm__empty">Sin intervalos registrados.</p>
          )}
          {values.intervals.map((interval, index) => (
            <div
              key={index}
              className="sessionForm__row sessionForm__row--interval"
            >
              <span className="sessionForm__index">#{index + 1}</span>
              <FormField
                label="Desde (s)"
                htmlFor={`interval-${index}-from`}
                error={errors[`intervals.${index}.fromSecond`]}
              >
                <TextInput
                  id={`interval-${index}-from`}
                  inputMode="numeric"
                  mono
                  value={interval.fromSecond}
                  onChange={(event) =>
                    onIntervalChange(index, "fromSecond", event.target.value)
                  }
                />
              </FormField>
              <FormField
                label="Hasta (s)"
                htmlFor={`interval-${index}-to`}
                error={errors[`intervals.${index}.toSecond`]}
              >
                <TextInput
                  id={`interval-${index}-to`}
                  inputMode="numeric"
                  mono
                  value={interval.toSecond}
                  onChange={(event) =>
                    onIntervalChange(index, "toSecond", event.target.value)
                  }
                />
              </FormField>
              <FormField
                label="Vueltas"
                htmlFor={`interval-${index}-laps`}
                error={
                  errors[`intervals.${index}.completedLaps`] ??
                  errors[`intervals.${index}`]
                }
              >
                <TextInput
                  id={`interval-${index}-laps`}
                  inputMode="numeric"
                  mono
                  value={interval.completedLaps}
                  onChange={(event) =>
                    onIntervalChange(index, "completedLaps", event.target.value)
                  }
                />
              </FormField>
              <Button
                variant="ghost"
                ariaLabel={`Quitar intervalo ${index + 1}`}
                icon={<Trash2 size={14} />}
                onClick={() => onRemoveInterval(index)}
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>
        {errors.intervals && (
          <p className="sessionForm__listError" role="alert">
            {errors.intervals}
          </p>
        )}
        <div className="sessionForm__add">
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={12} />}
            onClick={onAddInterval}
          >
            Agregar intervalo
          </Button>
        </div>
      </Card>

      <div className="sessionForm__gap" aria-hidden="true" />

      <Card title="Indicadores físicos y observaciones">
        <FormGrid>
          <FormField
            label="Resistencia (0-10)"
            htmlFor="session-resistance"
            error={errors.resistanceScore}
            optional
          >
            <TextInput
              id="session-resistance"
              inputMode="decimal"
              mono
              value={values.resistanceScore}
              invalid={!!errors.resistanceScore}
              onChange={(event) =>
                onChange("resistanceScore", event.target.value)
              }
            />
          </FormField>
          <FormField
            label="Recuperación (segundos, 0-3600)"
            htmlFor="session-recovery"
            error={errors.recoverySeconds}
            optional
          >
            <TextInput
              id="session-recovery"
              inputMode="numeric"
              mono
              value={values.recoverySeconds}
              invalid={!!errors.recoverySeconds}
              onChange={(event) =>
                onChange("recoverySeconds", event.target.value)
              }
            />
          </FormField>
        </FormGrid>
        <div
          className="sessionForm__gap sessionForm__gap--sm"
          aria-hidden="true"
        />
        <FormField
          label="Observaciones"
          htmlFor="session-observations"
          error={errors.observations}
          hint={`${values.observations.length}/2000`}
          optional
        >
          <Textarea
            id="session-observations"
            value={values.observations}
            maxLength={2000}
            invalid={!!errors.observations}
            onChange={(event) => onChange("observations", event.target.value)}
          />
        </FormField>
      </Card>

      <FormError
        error={submitError}
        conflictMessage="Otra persona guardó esta sesión mientras la editabas. Recarga la página para ver la versión actual."
      />

      <FormActions>
        <Button variant="secondary" href={backHref} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando…"
            : mode === "edit"
              ? "Guardar cambios"
              : "Crear sesión"}
        </Button>
      </FormActions>
    </form>

    <style jsx>{SessionFormStyles}</style>
  </div>
);

export default SessionFormComponent;
