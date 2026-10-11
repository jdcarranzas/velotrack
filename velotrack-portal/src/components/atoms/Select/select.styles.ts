import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const SelectStyles = css`
  .select {
    width: 100%;
    min-width: 10rem;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    background: ${theme.colors.neutral[0]};
    border: 1px solid ${theme.colors.neutral[200]};
    border-radius: ${theme.radius.md};
    font-size: ${theme.typography.size.sm};
    line-height: 1.4;
    cursor: pointer;
  }

  .select:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[50]};
  }

  .select:disabled {
    background: ${theme.colors.neutral[50]};
    color: ${theme.colors.neutral[500]};
    cursor: not-allowed;
  }

  .select--invalid {
    border-color: ${theme.colors.danger[600]};
  }
`;

export default SelectStyles;
