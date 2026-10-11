"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { useCoachSession } from "@/context/CoachSession";
import { useCoach, useRegisterCoach } from "@/hooks/data/useCoach";

import CoachDetailComponent from "./coachDetail.component";
import CoachFormModal from "./CoachFormModal";
import CoachTeamsModal from "./CoachTeamsModal";

export type CoachDetailContainerProps = {
  coachId: number;
};

const CoachDetailContainer = ({ coachId }: CoachDetailContainerProps) => {
  const router = useRouter();
  const { coachId: currentCoachId, catalogs } = useCoachSession();
  const { detail, error, isLoading, assignTeams } = useCoach(coachId);
  const registerCoach = useRegisterCoach();
  const [lookupId, setLookupId] = useState(String(coachId));
  const [modal, setModal] = useState<"teams" | "register" | null>(null);

  const activeTeams = catalogs.teams.filter((team) => team.isActive);
  const closeModal = () => setModal(null);

  return (
    <>
      <CoachDetailComponent
        detail={detail}
        catalogs={catalogs}
        isLoading={isLoading}
        error={error}
        isCurrentCoach={coachId === currentCoachId}
        lookupId={lookupId}
        onLookupIdChange={setLookupId}
        onLookup={() => {
          const id = Number(lookupId);
          if (Number.isInteger(id) && id > 0) {
            router.push(`/talent/coaches/${id}`);
          }
        }}
        onEditTeams={() => setModal("teams")}
        onRegister={() => setModal("register")}
      />

      {modal === "teams" && detail && (
        <CoachTeamsModal
          coachName={detail.coach.name}
          teams={activeTeams}
          venues={catalogs.venues}
          selectedTeamIds={detail.access.teamIds}
          onSubmit={assignTeams}
          onClose={closeModal}
        />
      )}

      {modal === "register" && (
        <CoachFormModal
          teams={activeTeams}
          venues={catalogs.venues}
          onSubmit={registerCoach}
          onCreated={(coach) => {
            closeModal();
            router.push(`/talent/coaches/${coach.id}`);
          }}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default CoachDetailContainer;
