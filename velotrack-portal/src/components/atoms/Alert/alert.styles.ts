import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const AlertStyles = css`
  .alert {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border: 1px solid transparent;
    border-radius: ${theme.radius.md};
    font-size: ${theme.typography.size.sm};
    line-height: 1.5;
  }

  .alert--danger {
    background: ${theme.colors.danger[50]};
    color: ${theme.colors.danger[700]};
  }

  .alert--warning {
    background: ${theme.colors.warning[50]};
    border-color: ${theme.colors.warning[200]};
    color: ${theme.colors.warning[600]};
  }

  .alert--info {
    background: ${theme.colors.primary[50]};
    color: ${theme.colors.primary[600]};
  }

  .alert--success {
    background: ${theme.colors.success[50]};
    color: ${theme.colors.success[700]};
  }
`;

export default AlertStyles;
