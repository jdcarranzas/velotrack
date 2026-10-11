import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const CardStyles = css`
  .card {
    min-width: 0;
    background: ${theme.colors.neutral[0]};
    border: 1px solid ${theme.colors.neutral[200]};
    border-radius: ${theme.radius.lg};
  }

  .card--padded {
    padding: ${theme.spacing[5]};
  }

  .card__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[4]};
  }

  .card__title {
    font-size: ${theme.typography.size.base};
    font-weight: ${theme.typography.weight.semibold};
  }

  .card__description {
    margin-top: ${theme.spacing[1]};
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
  }

  .card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  }
`;

export default CardStyles;
