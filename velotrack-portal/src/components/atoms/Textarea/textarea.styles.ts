import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const TextareaStyles = css`
  .textarea {
    width: 100%;
    min-height: 6rem;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    background: ${theme.colors.neutral[0]};
    border: 1px solid ${theme.colors.neutral[200]};
    border-radius: ${theme.radius.md};
    font-size: ${theme.typography.size.sm};
    line-height: 1.5;
    resize: vertical;
  }

  .textarea:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[50]};
  }

  .textarea--invalid {
    border-color: ${theme.colors.danger[600]};
  }
`;

export default TextareaStyles;
