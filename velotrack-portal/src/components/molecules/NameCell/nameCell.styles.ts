import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const NameCellStyles = css`
  .nameCell {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    min-width: 12rem;
  }

  .nameCell__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .nameCell__title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing[2]};
    font-weight: ${theme.typography.weight.semibold};
  }

  .nameCell__subtitle {
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
  }
`;

export default NameCellStyles;
