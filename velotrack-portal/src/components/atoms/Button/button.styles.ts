import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

// Global con clases BEM: el botón también se pinta como <Link> y styled-jsx no
// pasa su clase con scope a otros componentes.
const ButtonStyles = css.global`
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[2]};
    border: 1px solid transparent;
    border-radius: ${theme.radius.md};
    font-weight: ${theme.typography.weight.semibold};
    line-height: 1.25;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  .button:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }

  .button:disabled,
  .button[aria-disabled="true"] {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .button--md {
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    font-size: ${theme.typography.size.sm};
  }

  .button--sm {
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    font-size: ${theme.typography.size.xs};
  }

  .button--primary {
    background: ${theme.colors.primary[500]};
    color: ${theme.colors.neutral[0]};
  }

  .button--primary:not(:disabled):hover {
    background: ${theme.colors.primary[600]};
  }

  .button--outline {
    background: ${theme.colors.neutral[0]};
    border-color: ${theme.colors.primary[500]};
    color: ${theme.colors.primary[500]};
  }

  .button--outline:not(:disabled):hover {
    background: ${theme.colors.primary[50]};
  }

  .button--secondary {
    background: ${theme.colors.neutral[0]};
    border-color: ${theme.colors.neutral[200]};
    color: ${theme.colors.neutral[900]};
  }

  .button--secondary:not(:disabled):hover {
    background: ${theme.colors.neutral[50]};
  }

  .button--secondary.button--active {
    background: ${theme.colors.primary[50]};
    border-color: ${theme.colors.primary[200]};
    color: ${theme.colors.primary[500]};
  }

  .button--ghost {
    background: transparent;
    color: ${theme.colors.primary[500]};
  }

  .button--ghost:not(:disabled):hover {
    background: ${theme.colors.primary[50]};
  }

  .button--danger {
    background: ${theme.colors.neutral[0]};
    border-color: ${theme.colors.danger[600]};
    color: ${theme.colors.danger[600]};
  }

  .button--danger:not(:disabled):hover {
    background: ${theme.colors.danger[50]};
  }

  .button--fullWidth {
    width: 100%;
  }
`;

export default ButtonStyles;
