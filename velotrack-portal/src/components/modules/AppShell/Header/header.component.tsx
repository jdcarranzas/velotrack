import Link from "next/link";

import Avatar from "@/components/atoms/Avatar";

import { HeaderBrandStyles, HeaderStyles } from "./header.styles";

export type HeaderProps = {
  coachName: string | null;
  // Mensaje si no se pudo cargar el entrenador de NEXT_PUBLIC_COACH_ID
  coachWarning: string | null;
  teamNames: string[];
  venueNames: string[];
};

const HeaderComponent = ({
  coachName,
  coachWarning,
  teamNames,
  venueNames,
}: HeaderProps) => (
  <header className="header">
    <Link href="/dashboard" className="header__brand">
      <span className="header__logo">VT</span>
      VeloTrack
    </Link>

    {teamNames.length > 0 && (
      <>
        <span className="header__divider" aria-hidden="true" />
        <p className="header__scope">
          <span className="header__scopeDot" aria-hidden="true" />
          Viendo:
          <span className="header__scopeValue">{teamNames.join(", ")}</span>
          {venueNames.length > 0 && (
            <>
              ·
              <span className="header__scopeValue">
                {venueNames.join(", ")}
              </span>
            </>
          )}
        </p>
      </>
    )}

    <div className="header__profile">
      {coachWarning ? (
        <span className="header__warning">{coachWarning}</span>
      ) : (
        coachName && (
          <>
            <div className="header__profileText">
              <p className="header__name">{coachName}</p>
              <p className="header__role">
                Entrenador
                {venueNames.length > 0 && ` · ${venueNames.join(", ")}`}
              </p>
            </div>
            <Avatar name={coachName} />
          </>
        )
      )}
    </div>

    <style jsx global>
      {HeaderBrandStyles}
    </style>
    <style jsx>{HeaderStyles}</style>
  </header>
);

export default HeaderComponent;
