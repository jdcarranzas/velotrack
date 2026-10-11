import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const BadgeStyles = css`
  .badge {
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing[1]};
    padding: 0.125rem ${theme.spacing[2]};
    border: 1px solid transparent;
    border-radius: ${theme.radius.full};
    font-size: ${theme.typography.size.xs};
    font-weight: ${theme.typography.weight.semibold};
    line-height: 1.4;
    white-space: nowrap;
  }

  .badge__dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: ${theme.radius.full};
    background: currentColor;
  }

  .badge--neutral {
    background: ${theme.colors.neutral[100]};
    color: ${theme.colors.neutral[500]};
  }

  .badge--info {
    background: ${theme.colors.primary[50]};
    color: ${theme.colors.primary[500]};
  }

  .badge--success {
    background: ${theme.colors.success[50]};
    color: ${theme.colors.success[600]};
  }

  .badge--warning {
    background: ${theme.colors.warning[50]};
    border-color: ${theme.colors.warning[200]};
    color: ${theme.colors.warning[600]};
  }

  .badge--danger {
    background: ${theme.colors.danger[50]};
    color: ${theme.colors.danger[600]};
  }

  .badge--accent {
    background: ${theme.colors.accent[50]};
    color: ${theme.colors.accent[500]};
  }
`;

export default BadgeStyles;
