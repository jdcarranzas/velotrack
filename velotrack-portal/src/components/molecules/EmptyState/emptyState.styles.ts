import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const EmptyStateStyles = css`
  .emptyState {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[8]} ${theme.spacing[4]};
    text-align: center;
  }

  .emptyState__icon {
    display: inline-flex;
    padding: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[1]};
    border-radius: ${theme.radius.full};
    background: ${theme.colors.neutral[100]};
    color: ${theme.colors.neutral[500]};
  }

  .emptyState--error .emptyState__icon {
    background: ${theme.colors.danger[50]};
    color: ${theme.colors.danger[600]};
  }

  .emptyState__title {
    font-size: ${theme.typography.size.base};
    font-weight: ${theme.typography.weight.semibold};
  }

  .emptyState__description {
    max-width: 28rem;
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.sm};
    line-height: 1.5;
  }

  .emptyState__action {
    margin-top: ${theme.spacing[2]};
  }
`;

export default EmptyStateStyles;
