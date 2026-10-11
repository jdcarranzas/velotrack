import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const SkaterListStyles = css`
  .skaterList {
    padding: ${theme.spacing[6]};
  }

  .skaterList__filters {
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(2, minmax(10rem, 12rem)) auto;
    gap: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[4]};
  }

  @media (max-width: ${theme.mediaQueries.desktop}) {
    .skaterList__filters {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    .skaterList__search {
      grid-column: 1 / -1;
    }
  }
`;

export default SkaterListStyles;
