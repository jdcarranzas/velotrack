import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const FormGridStyles = css`
  .formGrid {
    display: grid;
    grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
    gap: ${theme.spacing[4]};
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .formGrid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;

export default FormGridStyles;
