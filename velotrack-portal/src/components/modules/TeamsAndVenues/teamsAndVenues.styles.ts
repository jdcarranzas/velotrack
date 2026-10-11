import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const TeamsAndVenuesStyles = css`
  .teamsAndVenues {
    padding: ${theme.spacing[6]};
  }

  .teamsAndVenues__alert {
    margin-bottom: ${theme.spacing[4]};
  }

  .teamsAndVenues__list {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  }

  .teamsAndVenues__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing[4]};
  }
`;

export default TeamsAndVenuesStyles;
