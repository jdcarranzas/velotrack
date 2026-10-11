import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const CoachDetailStyles = css`
  .coachDetail {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[6]};
  }

  .coachDetail__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing[2]};
  }

  .coachDetail__lookup {
    display: flex;
    gap: ${theme.spacing[2]};
    width: 12rem;
  }

  .coachDetail__identity {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing[4]};
    padding-bottom: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[5]};
    border-bottom: 1px solid ${theme.colors.neutral[200]};
  }

  .coachDetail__name {
    font-size: ${theme.typography.size.xl};
    font-weight: ${theme.typography.weight.bold};
  }

  .coachDetail__badges {
    display: flex;
    gap: ${theme.spacing[2]};
    margin-top: ${theme.spacing[2]};
  }

  .coachDetail__info {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${theme.spacing[4]};
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .coachDetail__info {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;

export default CoachDetailStyles;
