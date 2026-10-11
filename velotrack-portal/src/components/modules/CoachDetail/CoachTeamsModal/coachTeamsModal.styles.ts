import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const CoachTeamsModalStyles = css`
  .coachTeamsModal__list {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    border: none;
  }

  .coachTeamsModal__empty {
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.sm};
  }
`;

export default CoachTeamsModalStyles;
