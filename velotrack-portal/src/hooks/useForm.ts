import { useCallback, useState } from "react";

import type { z } from "zod";

import { type FieldErrors, zodToFieldErrors } from "@/utils/helpers/forms";

export type UseForm<Values, Output> = {
  values: Values;
  errors: FieldErrors;
  setValue: <Key extends keyof Values>(key: Key, value: Values[Key]) => void;
  setValues: (update: (values: Values) => Values) => void;
  setErrors: (errors: FieldErrors) => void;
  // Valida con el schema; devuelve el resultado o null y deja los errores
  validate: () => Output | null;
};

// Estado de un formulario con validación zod. Al cambiar un campo se borra su
// error para no dejar mensajes viejos.
export const useForm = <Values extends Record<string, unknown>, Output>(
  schema: z.ZodType<Output, Values>,
  initialValues: Values,
): UseForm<Values, Output> => {
  const [values, setValuesState] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  const setValue = useCallback(
    <Key extends keyof Values>(key: Key, value: Values[Key]) => {
      setValuesState((current) => ({ ...current, [key]: value }));
      setErrors((current) => {
        if (!(String(key) in current)) return current;
        const next = { ...current };
        delete next[String(key)];
        return next;
      });
    },
    [],
  );

  const setValues = useCallback(
    (update: (values: Values) => Values) => setValuesState(update),
    [],
  );

  const validate = useCallback(() => {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    setErrors(zodToFieldErrors(result.error));
    return null;
  }, [schema, values]);

  return { values, errors, setValue, setValues, setErrors, validate };
};
