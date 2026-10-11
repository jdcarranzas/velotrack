import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const SessionFormStyles = css`
  .sessionForm {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[6]};
  }

  .sessionForm__gap {
    height: ${theme.spacing[5]};
  }

  .sessionForm__gap--sm {
    height: ${theme.spacing[4]};
  }

  .sessionForm__sectionTitle {
    margin: ${theme.spacing[6]} 0 ${theme.spacing[3]};
    font-size: ${theme.typography.size.sm};
    font-weight: ${theme.typography.weight.semibold};
  }

  .sessionForm__rows {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  }

  .sessionForm__row {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr) minmax(0, 2fr) auto;
    gap: ${theme.spacing[3]};
    align-items: start;
  }

  .sessionForm__row--interval {
    grid-template-columns: 2.5rem repeat(3, minmax(0, 1fr)) auto;
  }

  .sessionForm__index {
    padding-top: ${theme.spacing[2]};
    color: ${theme.colors.neutral[500]};
    font-family: ${theme.typography.familyMono};
    font-size: ${theme.typography.size.sm};
  }

  .sessionForm__rowError,
  .sessionForm__listError {
    color: ${theme.colors.danger[600]};
    font-size: ${theme.typography.size.xs};
  }

  .sessionForm__listError {
    margin-top: ${theme.spacing[2]};
  }

  .sessionForm__empty {
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.sm};
  }

  .sessionForm__add {
    margin-top: ${theme.spacing[3]};
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .sessionForm__row,
    .sessionForm__row--interval {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;

export default SessionFormStyles;
