import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

// Alto de la cabecera del AppShell (ver header.styles.ts)
const HEADER_HEIGHT = "3.5rem";

const CoachDashboardStyles = css`
  .coachDashboard {
    display: flex;
    padding: ${theme.spacing[4]};
    /* Ocupa todo el alto visible bajo la cabecera */
    height: calc(100vh - ${HEADER_HEIGHT});
    min-height: 32rem;
  }

  .coachDashboard__frame {
    flex: 1;
    width: 100%;
    height: 100%;
    background: ${theme.colors.neutral[0]};
    border: 1px solid ${theme.colors.neutral[200]};
    border-radius: ${theme.radius.lg};
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .coachDashboard {
      height: auto;
      padding: ${theme.spacing[2]};
    }

    .coachDashboard__frame {
      height: 80vh;
    }
  }
`;

export default CoachDashboardStyles;
