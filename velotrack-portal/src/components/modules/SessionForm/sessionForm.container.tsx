"use client";
import { useRouter } from "next/navigation";

import { useSkaters } from "@/hooks/data/useSkaters";
import { useForm } from "@/hooks/useForm";
import { useSubmit } from "@/hooks/useSubmit";
import type { SessionInput, TrainingSession } from "@/models/session.model";
import {
  EMPTY_INTERVAL,
  EMPTY_LAP,
  sessionFormSchema,
  type SessionFormValues,
} from "@/models/session.schema";
import { toSkaterOptions } from "@/models/talent.selectors";
import { apiToFieldErrors } from "@/utils/helpers/forms";

import SessionFormComponent from "./sessionForm.component";

export type SessionFormContainerProps = {
  mode: "create" | "edit";
  initialValues: SessionFormValues;
  // Versión leída (solo al editar): la API la exige para evitar pisar cambios
  version?: number;
  backHref: string;
  onSave: (input: SessionInput) => Promise<TrainingSession>;
};

// Formulario de sesión. Al guardar lleva al detalle de la sesión.
const SessionFormContainer = ({
  mode,
  initialValues,
  version,
  backHref,
  onSave,
}: SessionFormContainerProps) => {
  const router = useRouter();
  const { values, errors, setValue, setErrors, validate } = useForm(
    sessionFormSchema,
    initialValues,
  );
  const { submit, isSubmitting, error } = useSubmit(onSave);
  const skaters = useSkaters();

  // Al editar, el patinador puede no estar en los equipos del entrenador:
  // se agrega su opción para que el select (deshabilitado) lo muestre.
  const athleteOptions = toSkaterOptions(skaters.rows);
  if (
    values.athleteId &&
    !athleteOptions.some((option) => option.value === values.athleteId)
  ) {
    athleteOptions.push({
      value: values.athleteId,
      label: `Patinador ${values.athleteId}`,
    });
  }

  const updateList = <Key extends "laps" | "intervals">(
    key: Key,
    update: (list: SessionFormValues[Key]) => SessionFormValues[Key],
  ) => setValue(key, update(values[key]));

  const handleSubmit = async () => {
    const input = validate();
    if (!input) return;
    const result = await submit({ ...input, version });
    if (result.ok) {
      router.push(`/sessions/${result.data.id}`);
      return;
    }
    // captura nombra los campos con la ruta del DTO ("technical.maxSpeedKmh")
    setErrors(
      apiToFieldErrors(
        result.error.fieldErrors.map((fieldError) => ({
          ...fieldError,
          field: fieldError.field.replace(/^(technical|physical)\./, ""),
        })),
      ),
    );
  };

  return (
    <SessionFormComponent
      mode={mode}
      values={values}
      errors={errors}
      athleteOptions={athleteOptions}
      isLoadingAthletes={skaters.isLoading}
      submitError={error}
      isSubmitting={isSubmitting}
      backHref={backHref}
      onChange={(field, value) =>
        setValue(field, value as SessionFormValues[typeof field])
      }
      onLapChange={(index, field, value) =>
        updateList("laps", (laps) =>
          laps.map((lap, i) =>
            i === index ? { ...lap, [field]: value } : lap,
          ),
        )
      }
      onAddLap={() => updateList("laps", (laps) => [...laps, EMPTY_LAP])}
      onRemoveLap={(index) =>
        updateList("laps", (laps) => laps.filter((_, i) => i !== index))
      }
      onIntervalChange={(index, field, value) =>
        updateList("intervals", (intervals) =>
          intervals.map((interval, i) =>
            i === index ? { ...interval, [field]: value } : interval,
          ),
        )
      }
      onAddInterval={() =>
        updateList("intervals", (intervals) => [...intervals, EMPTY_INTERVAL])
      }
      onRemoveInterval={(index) =>
        updateList("intervals", (intervals) =>
          intervals.filter((_, i) => i !== index),
        )
      }
      onSubmit={handleSubmit}
    />
  );
};

export default SessionFormContainer;
