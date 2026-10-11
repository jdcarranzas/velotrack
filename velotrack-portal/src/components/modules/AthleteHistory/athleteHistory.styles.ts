import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const AthleteHistoryStyles = css`
  .athleteHistory {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[6]};
  }

  .athleteHistory__search {
    display: grid;
    grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr)) auto;
    gap: ${theme.spacing[3]};
    align-items: end;
  }

  .athleteHistory__footer {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border-top: 1px solid ${theme.colors.neutral[100]};
  }

  @media (max-width: ${theme.mediaQueries.desktop}) {
    .athleteHistory__search {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
  }
`;

export default AthleteHistoryStyles;
