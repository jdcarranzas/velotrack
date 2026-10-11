import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const CheckboxStyles = css`
  .checkbox {
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    font-size: ${theme.typography.size.sm};
    cursor: pointer;
  }

  .checkbox__input {
    width: 1rem;
    height: 1rem;
    accent-color: ${theme.colors.primary[500]};
    cursor: pointer;
  }

  .checkbox__hint {
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
  }
`;

export default CheckboxStyles;
