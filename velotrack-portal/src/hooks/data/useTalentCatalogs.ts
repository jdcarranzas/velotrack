import { useMemo } from "react";

import { useCoachSession } from "@/context/CoachSession";
import type {
  CategoryInput,
  TalentCatalogs,
  TeamInput,
  VenueInput,
} from "@/models/talent.model";
import type { ApiError } from "@/services/http/apiError";
import { talentService } from "@/services/modules/talentService";

export type UseTalentCatalogs = {
  catalogs: TalentCatalogs;
  error: ApiError | null;
  isLoading: boolean;
  createVenue: (input: VenueInput) => Promise<void>;
  updateVenue: (id: number, input: VenueInput) => Promise<void>;
  setVenueActive: (id: number, active: boolean) => Promise<void>;
  createTeam: (input: TeamInput) => Promise<void>;
  updateTeam: (id: number, input: TeamInput) => Promise<void>;
  setTeamActive: (id: number, active: boolean) => Promise<void>;
  createCategory: (input: CategoryInput) => Promise<void>;
  updateCategory: (id: number, input: CategoryInput) => Promise<void>;
  setCategoryActive: (id: number, active: boolean) => Promise<void>;
};

// Sedes, equipos y categorías con sus escrituras. Después de cada cambio se
// recargan los catálogos compartidos para que todas las pantallas lo vean.
export const useTalentCatalogs = (): UseTalentCatalogs => {
  const { catalogs, catalogsError, isLoading, reload } = useCoachSession();

  const actions = useMemo(() => {
    const withReload =
      <Args extends unknown[]>(action: (...args: Args) => Promise<unknown>) =>
      async (...args: Args) => {
        await action(...args);
        reload();
      };
    return {
      createVenue: withReload(talentService.createVenue),
      updateVenue: withReload(talentService.updateVenue),
      setVenueActive: withReload(talentService.setVenueActive),
      createTeam: withReload(talentService.createTeam),
      updateTeam: withReload(talentService.updateTeam),
      setTeamActive: withReload(talentService.setTeamActive),
      createCategory: withReload(talentService.createCategory),
      updateCategory: withReload(talentService.updateCategory),
      setCategoryActive: withReload(talentService.setCategoryActive),
    };
  }, [reload]);

  return { catalogs, error: catalogsError, isLoading, ...actions };
};
