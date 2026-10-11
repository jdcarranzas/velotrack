import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const SessionStatsStyles = css`
  .sessionStats {
    display: grid;
    grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
    gap: ${theme.spacing[4]};
  }

  @media (max-width: ${theme.mediaQueries.desktop}) {
    .sessionStats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

export default SessionStatsStyles;
