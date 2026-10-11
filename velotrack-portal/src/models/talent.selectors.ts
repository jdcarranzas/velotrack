import { getAge } from "@/utils/helpers/date";
import { normalizeForSearch } from "@/utils/helpers/text";

import type { Skater, TalentCatalogs, Team, Venue } from "./talent.model";

export const ADULT_AGE = 18;

export type SkaterRow = {
  skater: Skater;
  age: number;
  isMinor: boolean;
  categoryName: string;
  teamName: string;
  venueName: string;
};

export type SkaterFilters = {
  search: string;
  categoryId: number | null;
  teamId: number | null;
  onlyMinors: boolean;
};

export const EMPTY_SKATER_FILTERS: SkaterFilters = {
  search: "",
  categoryId: null,
  teamId: null,
  onlyMinors: false,
};

const UNKNOWN = "—";

const byId = <T extends { id: number }>(items: T[]) =>
  new Map(items.map((item) => [item.id, item]));

export const findName = <T extends { id: number; name: string }>(
  items: T[],
  id: number | null | undefined,
): string => items.find((item) => item.id === id)?.name ?? UNKNOWN;

// Cruza cada patinador con los nombres de su categoría, equipo y sede.
export const buildSkaterRows = (
  skaters: Skater[],
  { categories, teams, venues }: TalentCatalogs,
  today: Date,
): SkaterRow[] => {
  const categoriesById = byId(categories);
  const teamsById = byId(teams);
  const venuesById = byId(venues);

  return skaters
    .map((skater) => {
      const age = getAge(skater.dateOfBirth, today);
      return {
        skater,
        age,
        isMinor: age < ADULT_AGE,
        categoryName: categoriesById.get(skater.categoryId)?.name ?? UNKNOWN,
        teamName: teamsById.get(skater.teamId)?.name ?? UNKNOWN,
        venueName: venuesById.get(skater.venueId)?.name ?? UNKNOWN,
      };
    })
    .sort((a, b) => a.skater.name.localeCompare(b.skater.name, "es"));
};

export const filterSkaterRows = (
  rows: SkaterRow[],
  { search, categoryId, teamId, onlyMinors }: SkaterFilters,
): SkaterRow[] => {
  const query = normalizeForSearch(search);
  return rows.filter(
    (row) =>
      (!query ||
        normalizeForSearch(row.skater.name).includes(query) ||
        normalizeForSearch(row.skater.idNumber).includes(query)) &&
      (categoryId === null || row.skater.categoryId === categoryId) &&
      (teamId === null || row.skater.teamId === teamId) &&
      (!onlyMinors || row.isMinor),
  );
};

export type VenueWithTeams = {
  venue: Venue;
  teams: Team[];
};

// Sedes con sus equipos. Con includeInactive=false oculta las sedes y equipos
// desactivados.
export const groupTeamsByVenue = (
  venues: Venue[],
  teams: Team[],
  includeInactive: boolean,
): VenueWithTeams[] =>
  venues
    .filter((venue) => includeInactive || venue.isActive)
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((venue) => ({
      venue,
      teams: teams
        .filter(
          (team) =>
            team.venueId === venue.id && (includeInactive || team.isActive),
        )
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    }));

// Equipos y sedes a los que tiene acceso un entrenador, en orden.
export const getCoachScope = (
  teamIds: number[],
  { teams, venues }: Pick<TalentCatalogs, "teams" | "venues">,
): { teams: Team[]; venues: Venue[] } => {
  const coachTeams = teams.filter((team) => teamIds.includes(team.id));
  const venueIds = new Set(coachTeams.map((team) => team.venueId));
  return {
    teams: coachTeams,
    venues: venues.filter((venue) => venueIds.has(venue.id)),
  };
};

export const countByCategory = (
  rows: SkaterRow[],
): { name: string; count: number }[] =>
  Object.entries(
    rows.reduce<Record<string, number>>((counts, row) => {
      counts[row.categoryName] = (counts[row.categoryName] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

// Opciones del select de patinador: "Ana Demo · DEMO-001", valor = id
export const toSkaterOptions = (
  rows: SkaterRow[],
): { value: string; label: string }[] =>
  rows.map(({ skater }) => ({
    value: String(skater.id),
    label: `${skater.name} · ${skater.idNumber}`,
  }));

export const getSkaterNames = (rows: SkaterRow[]): Map<number, string> =>
  new Map(rows.map(({ skater }) => [skater.id, skater.name]));
