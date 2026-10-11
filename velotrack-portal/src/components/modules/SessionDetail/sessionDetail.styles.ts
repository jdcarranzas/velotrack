import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const SessionDetailStyles = css`
  .sessionDetail {
    padding: ${theme.spacing[6]};
  }

  .sessionDetail__content {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  }

  .sessionDetail__title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing[3]};
    font-size: ${theme.typography.size.xl};
    font-weight: ${theme.typography.weight.bold};
  }

  .sessionDetail__info {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${theme.spacing[4]};
    margin-top: ${theme.spacing[5]};
  }

  .sessionDetail__stats {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: ${theme.spacing[4]};
  }

  .sessionDetail__columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.spacing[5]};
    align-items: start;
  }

  @media (max-width: ${theme.mediaQueries.desktop}) {
    .sessionDetail__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .sessionDetail__columns {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .sessionDetail__info {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;

export default SessionDetailStyles;
