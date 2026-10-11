import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const PageHeaderStyles = css`
  .pageHeader {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[5]};
  }

  .pageHeader__title {
    font-size: ${theme.typography.size.lg};
    font-weight: ${theme.typography.weight.bold};
  }

  .pageHeader__description {
    margin-top: ${theme.spacing[1]};
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.sm};
  }

  .pageHeader__actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  }
`;

export default PageHeaderStyles;
