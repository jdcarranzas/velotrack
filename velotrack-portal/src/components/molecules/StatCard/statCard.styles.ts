import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const StatCardStyles = css`
  .statCard {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[1]};
    min-width: 0;
    padding: ${theme.spacing[4]};
    background: ${theme.colors.neutral[0]};
    border: 1px solid ${theme.colors.neutral[200]};
    border-radius: ${theme.radius.lg};
  }

  .statCard__label {
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
    font-weight: ${theme.typography.weight.medium};
  }

  .statCard__value {
    font-family: ${theme.typography.familyMono};
    font-size: ${theme.typography.size["3xl"]};
    font-weight: ${theme.typography.weight.bold};
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
  }

  .statCard__unit {
    margin-left: ${theme.spacing[1]};
    font-size: ${theme.typography.size.sm};
    font-weight: ${theme.typography.weight.medium};
  }

  .statCard__caption {
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
  }

  .statCard--primary .statCard__value {
    color: ${theme.colors.primary[500]};
  }

  .statCard--success .statCard__value {
    color: ${theme.colors.success[600]};
  }

  .statCard--accent .statCard__value {
    color: ${theme.colors.accent[500]};
  }

  .statCard--warning .statCard__value {
    color: ${theme.colors.warning[600]};
  }

  .statCard--neutral .statCard__value {
    color: ${theme.colors.neutral[900]};
  }

  .statCard__value--empty {
    color: ${theme.colors.neutral[300]} !important;
  }
`;

export default StatCardStyles;
