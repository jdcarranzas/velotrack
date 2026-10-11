import type { SkaterRow } from "@/models/talent.selectors";
import type { ApiError } from "@/services/http/apiError";

import { useSkaters } from "./useSkaters";

export type UseSkater = {
  row: SkaterRow | null;
  error: ApiError | null;
  isLoading: boolean;
};

// Un patinador del entrenador. talentms no tiene GET /skaters/{id}: se busca
// entre los patinadores de sus equipos.
export const useSkater = (skaterId: number): UseSkater => {
  const { rows, error, isLoading } = useSkaters();
  return {
    row: rows.find((row) => row.skater.id === skaterId) ?? null,
    error,
    isLoading,
  };
};
