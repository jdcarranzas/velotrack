import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const FormFieldStyles = css`
  .formField {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[1]};
    min-width: 0;
  }

  .formField__label {
    font-size: ${theme.typography.size.xs};
    font-weight: ${theme.typography.weight.semibold};
    color: ${theme.colors.neutral[900]};
  }

  .formField__optional {
    margin-left: ${theme.spacing[1]};
    font-weight: ${theme.typography.weight.regular};
    color: ${theme.colors.neutral[500]};
  }

  .formField__hint {
    font-size: ${theme.typography.size.xs};
    color: ${theme.colors.neutral[500]};
  }

  .formField__error {
    font-size: ${theme.typography.size.xs};
    color: ${theme.colors.danger[600]};
  }
`;

export default FormFieldStyles;
