import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const InfoFieldStyles = css`
  .infoField {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .infoField__label {
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
  }

  .infoField__value {
    font-size: ${theme.typography.size.sm};
    font-weight: ${theme.typography.weight.semibold};
    overflow-wrap: anywhere;
  }

  .infoField__value--mono {
    font-family: ${theme.typography.familyMono};
    font-weight: ${theme.typography.weight.medium};
  }

  .infoField__value--empty {
    color: ${theme.colors.neutral[500]};
    font-weight: ${theme.typography.weight.regular};
  }
`;

export default InfoFieldStyles;
