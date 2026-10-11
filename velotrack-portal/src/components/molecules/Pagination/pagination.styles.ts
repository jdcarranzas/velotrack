import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const PaginationStyles = css`
  .pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[3]};
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
  }

  .pagination__buttons {
    display: flex;
    gap: ${theme.spacing[2]};
  }
`;

export default PaginationStyles;
