import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const SpinnerStyles = css`
  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[8]};
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.sm};
  }

  .spinner__circle {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid ${theme.colors.neutral[200]};
    border-top-color: ${theme.colors.primary[500]};
    border-radius: ${theme.radius.full};
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default SpinnerStyles;
