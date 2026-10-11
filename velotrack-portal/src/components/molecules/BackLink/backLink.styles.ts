import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

// Global con clases BEM porque la clase va en <Link>
const BackLinkStyles = css.global`
  .backLink {
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[4]};
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.sm};
  }

  .backLink:hover {
    color: ${theme.colors.primary[500]};
  }
`;

export default BackLinkStyles;
