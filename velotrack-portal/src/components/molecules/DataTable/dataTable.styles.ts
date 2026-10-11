import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const DataTableStyles = css`
  .dataTable {
    overflow-x: auto;
  }

  .dataTable__table {
    width: 100%;
    border-collapse: collapse;
    font-size: ${theme.typography.size.sm};
  }

  .dataTable__head {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    background: ${theme.colors.neutral[50]};
    border-bottom: 1px solid ${theme.colors.neutral[200]};
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
    font-weight: ${theme.typography.weight.semibold};
    letter-spacing: 0.04em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .dataTable--plain .dataTable__head {
    padding: ${theme.spacing[2]} 0;
    background: none;
    letter-spacing: 0;
    text-transform: none;
  }

  .dataTable__cell {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border-bottom: 1px solid ${theme.colors.neutral[100]};
    vertical-align: middle;
  }

  .dataTable--plain .dataTable__cell {
    padding: ${theme.spacing[3]} 0;
  }

  .dataTable--plain .dataTable__cell + .dataTable__cell,
  .dataTable--plain .dataTable__head + .dataTable__head {
    padding-left: ${theme.spacing[4]};
  }

  .dataTable__row:hover .dataTable__cell {
    background: ${theme.colors.neutral[50]};
  }

  .dataTable--plain .dataTable__row:hover .dataTable__cell {
    background: none;
  }

  .dataTable__cell--right,
  .dataTable__head--right {
    text-align: right;
  }

  .dataTable__cell--center,
  .dataTable__head--center {
    text-align: center;
  }

  .dataTable__cell--mono {
    font-family: ${theme.typography.familyMono};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .dataTable__cell--muted {
    color: ${theme.colors.neutral[500]};
  }

  .dataTable__empty {
    padding: ${theme.spacing[8]} ${theme.spacing[4]};
    color: ${theme.colors.neutral[500]};
    text-align: center;
  }

  .dataTable__footer {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
  }
`;

export default DataTableStyles;
