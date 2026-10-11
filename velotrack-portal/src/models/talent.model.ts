// Modelos de talentms. Tienen la misma forma que los DTOs que devuelve la
// gateway (`/api/venues`, `/api/teams`, `/api/categories`, `/api/skaters`,
// `/api/coaches`). Los ids son enteros.

export type Venue = {
  id: number;
  name: string;
  description: string | null;
  organizationId: number;
  isActive: boolean;
};

export type VenueInput = {
  name: string;
  description?: string;
  organizationId: number;
};

export type Team = {
  id: number;
  name: string;
  description: string | null;
  venueId: number;
  isActive: boolean;
};

export type TeamInput = {
  name: string;
  description?: string;
  venueId: number;
};

export type Category = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
};

export type CategoryInput = {
  name: string;
  description?: string;
};

export type Skater = {
  id: number;
  name: string;
  // Documento de identidad
  idNumber: string;
  // Fecha sin hora: "2009-03-14"
  dateOfBirth: string;
  categoryId: number;
  teamId: number;
  venueId: number;
  telephone: string | null;
  email: string | null;
  createdAt: string;
};

export type SkaterInput = {
  name: string;
  idNumber: string;
  dateOfBirth: string;
  categoryId: number;
  teamId: number;
  venueId: number;
  telephone?: string;
  email?: string;
};

export type Coach = {
  id: number;
  name: string;
  email: string;
  telephone: string | null;
  // "active" u otro estado que defina talentms
  status: string;
  teamIds: number[];
};

export type CoachInput = {
  name: string;
  email: string;
  password: string;
  telephone?: string;
  teamIds: number[];
};

export type CoachAccess = {
  coachId: number;
  teamIds: number[];
  venueIds: number[];
};

export type AccessAction = "ASSIGNED" | "REMOVED";

export type AccessAuditEntry = {
  id: number;
  coachId: number | null;
  teamId: number | null;
  venueId: number | null;
  actionType: AccessAction | string;
  performedById: number | null;
  changedAt: string;
};

// Catálogos que se cruzan con los ids de los patinadores y entrenadores.
export type TalentCatalogs = {
  categories: Category[];
  teams: Team[];
  venues: Venue[];
};
