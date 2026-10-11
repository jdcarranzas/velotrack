import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const CategoryListStyles = css`
  .categoryList {
    padding: ${theme.spacing[6]};
  }

  .categoryList__alert {
    margin-bottom: ${theme.spacing[4]};
  }

  .categoryList__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing[4]};
  }
`;

export default CategoryListStyles;
