import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

export const SectionTabsStyles = css`
  .sectionTabs {
    display: flex;
    gap: ${theme.spacing[2]};
    padding: 0 ${theme.spacing[6]};
    overflow-x: auto;
    border-bottom: 1px solid ${theme.colors.neutral[200]};
  }
`;

// Global con clases BEM porque la clase va en <Link>
export const SectionTabsLinkStyles = css.global`
  .sectionTabs__link {
    display: inline-block;
    padding: ${theme.spacing[3]} ${theme.spacing[3]};
    margin-bottom: -1px;
    border-bottom: 2px solid transparent;
    color: ${theme.colors.neutral[900]};
    font-size: ${theme.typography.size.sm};
    font-weight: ${theme.typography.weight.medium};
    white-space: nowrap;
  }

  .sectionTabs__link:hover {
    color: ${theme.colors.primary[500]};
  }

  .sectionTabs__link--active {
    border-bottom-color: ${theme.colors.primary[500]};
    color: ${theme.colors.primary[500]};
  }
`;
