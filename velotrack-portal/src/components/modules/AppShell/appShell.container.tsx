"use client";
import { usePathname } from "next/navigation";

import { useCoachSession } from "@/context/CoachSession";

import AppShellStyles from "./appShell.styles";
import Header from "./Header";
import Sidebar from "./Sidebar";

export type AppShellProps = {
  children: React.ReactNode;
};

const AppShellContainer = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const { coachId, coach, coachError, coachTeams, coachVenues } =
    useCoachSession();

  const coachWarning = coachError
    ? coachError.status === 404
      ? `No existe el entrenador ${coachId} (NEXT_PUBLIC_COACH_ID)`
      : coachError.message
    : null;

  return (
    <div className="appShell">
      <Header
        coachName={coach?.name ?? null}
        coachWarning={coachWarning}
        teamNames={coachTeams.map((team) => team.name)}
        venueNames={coachVenues.map((venue) => venue.name)}
      />
      <div className="appShell__body">
        <Sidebar pathname={pathname} />
        <main className="appShell__main">{children}</main>
      </div>

      <style jsx>{AppShellStyles}</style>
    </div>
  );
};

export default AppShellContainer;
