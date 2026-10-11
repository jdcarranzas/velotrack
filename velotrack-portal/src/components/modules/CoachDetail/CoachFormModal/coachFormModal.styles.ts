import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const CoachFormModalStyles = css`
  .coachFormModal__teams {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    margin-top: ${theme.spacing[5]};
    border: none;
  }

  .coachFormModal__legend {
    margin-bottom: ${theme.spacing[2]};
    font-size: ${theme.typography.size.xs};
    font-weight: ${theme.typography.weight.semibold};
  }

  .coachFormModal__error {
    color: ${theme.colors.danger[600]};
    font-size: ${theme.typography.size.xs};
  }
`;

export default CoachFormModalStyles;
