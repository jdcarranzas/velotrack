"use client";
import { useMemo, useState } from "react";

import { useCoachSession } from "@/context/CoachSession";
import { useSkaters } from "@/hooks/data/useSkaters";
import {
  EMPTY_SKATER_FILTERS,
  filterSkaterRows,
} from "@/models/talent.selectors";

import SkaterFormModal from "./SkaterFormModal";
import SkaterListComponent from "./skaterList.component";

const SkaterListContainer = () => {
  const { rows, isLoading, error, registerSkater } = useSkaters();
  const { catalogs, coachTeams } = useCoachSession();
  const [filters, setFilters] = useState(EMPTY_SKATER_FILTERS);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredRows = useMemo(
    () => filterSkaterRows(rows, filters),
    [rows, filters],
  );

  const activeCategories = catalogs.categories.filter(
    (category) => category.isActive,
  );
  const activeTeams = coachTeams.filter((team) => team.isActive);

  return (
    <>
      <SkaterListComponent
        rows={filteredRows}
        totalCount={rows.length}
        isLoading={isLoading}
        error={error}
        filters={filters}
        categoryOptions={catalogs.categories.map((category) => ({
          value: String(category.id),
          label: category.name,
        }))}
        teamOptions={coachTeams.map((team) => ({
          value: String(team.id),
          label: team.name,
        }))}
        canRegister={activeTeams.length > 0}
        onFiltersChange={setFilters}
        onRegister={() => setIsFormOpen(true)}
      />
      {isFormOpen && (
        <SkaterFormModal
          categories={activeCategories}
          teams={activeTeams}
          venues={catalogs.venues}
          onSubmit={registerSkater}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </>
  );
};

export default SkaterListContainer;
