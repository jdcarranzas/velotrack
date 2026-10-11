import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const FormActionsStyles = css`
  .formActions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: ${theme.spacing[2]};
    margin-top: ${theme.spacing[6]};
  }
`;

export default FormActionsStyles;
