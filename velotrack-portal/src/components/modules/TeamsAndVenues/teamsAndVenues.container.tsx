"use client";
import { useMemo, useState } from "react";

import { useTalentCatalogs } from "@/hooks/data/useTalentCatalogs";
import { toApiError } from "@/hooks/useAsyncData";
import type { Team, Venue } from "@/models/talent.model";
import { groupTeamsByVenue } from "@/models/talent.selectors";

import TeamFormModal from "./TeamFormModal";
import TeamsAndVenuesComponent from "./teamsAndVenues.component";
import VenueFormModal from "./VenueFormModal";

type VenueModal = { venue: Venue | null };
type TeamModal = { team: Team | null; venueId: number | null };

const TeamsAndVenuesContainer = () => {
  const {
    catalogs,
    isLoading,
    error,
    createVenue,
    updateVenue,
    setVenueActive,
    createTeam,
    updateTeam,
    setTeamActive,
  } = useTalentCatalogs();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [venueModal, setVenueModal] = useState<VenueModal | null>(null);
  const [teamModal, setTeamModal] = useState<TeamModal | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const groups = useMemo(
    () => groupTeamsByVenue(catalogs.venues, catalogs.teams, includeInactive),
    [catalogs.venues, catalogs.teams, includeInactive],
  );

  // PATCH .../status. Desactivar no borra: el recurso se puede reactivar.
  const toggle = async (key: string, action: () => Promise<void>) => {
    setPendingKey(key);
    setActionError(null);
    try {
      await action();
    } catch (caught) {
      setActionError(toApiError(caught).message);
    } finally {
      setPendingKey(null);
    }
  };

  const venueBeingEdited = venueModal?.venue ?? null;
  const teamBeingEdited = teamModal?.team ?? null;

  return (
    <>
      <TeamsAndVenuesComponent
        groups={groups}
        isLoading={isLoading}
        error={error}
        actionError={actionError}
        includeInactive={includeInactive}
        pendingKey={pendingKey}
        onIncludeInactiveChange={setIncludeInactive}
        onCreateVenue={() => setVenueModal({ venue: null })}
        onEditVenue={(venue) => setVenueModal({ venue })}
        onToggleVenue={(venue) =>
          toggle(`venue-${venue.id}`, () =>
            setVenueActive(venue.id, !venue.isActive),
          )
        }
        onCreateTeam={(venue) =>
          setTeamModal({ team: null, venueId: venue.id })
        }
        onEditTeam={(team) => setTeamModal({ team, venueId: team.venueId })}
        onToggleTeam={(team) =>
          toggle(`team-${team.id}`, () =>
            setTeamActive(team.id, !team.isActive),
          )
        }
      />

      {venueModal && (
        <VenueFormModal
          venue={venueBeingEdited}
          defaultOrganizationId={catalogs.venues[0]?.organizationId ?? null}
          onSubmit={(input) =>
            venueBeingEdited
              ? updateVenue(venueBeingEdited.id, input)
              : createVenue(input)
          }
          onClose={() => setVenueModal(null)}
        />
      )}

      {teamModal && (
        <TeamFormModal
          team={teamBeingEdited}
          defaultVenueId={teamModal.venueId}
          venues={catalogs.venues.filter(
            (venue) => venue.isActive || venue.id === teamModal.venueId,
          )}
          onSubmit={(input) =>
            teamBeingEdited
              ? updateTeam(teamBeingEdited.id, input)
              : createTeam(input)
          }
          onClose={() => setTeamModal(null)}
        />
      )}
    </>
  );
};

export default TeamsAndVenuesContainer;
