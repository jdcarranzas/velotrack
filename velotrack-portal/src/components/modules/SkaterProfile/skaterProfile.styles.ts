import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const SkaterProfileStyles = css`
  .skaterProfile {
    padding: ${theme.spacing[6]};
  }

  .skaterProfile__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(14rem, 22rem);
    gap: ${theme.spacing[5]};
    align-items: start;
  }

  .skaterProfile__main {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    min-width: 0;
  }

  .skaterProfile__identity {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
    padding-bottom: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[5]};
    border-bottom: 1px solid ${theme.colors.neutral[200]};
  }

  .skaterProfile__name {
    font-size: ${theme.typography.size.xl};
    font-weight: ${theme.typography.weight.bold};
  }

  .skaterProfile__subtitle {
    margin-top: 0.125rem;
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.sm};
  }

  .skaterProfile__badges {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
    margin-top: ${theme.spacing[2]};
  }

  .skaterProfile__info {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${theme.spacing[4]};
  }

  @media (max-width: ${theme.mediaQueries.desktop}) {
    .skaterProfile__layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .skaterProfile__info {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

export default SkaterProfileStyles;
