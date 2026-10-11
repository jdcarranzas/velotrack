import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

export const HeaderStyles = css`
  .header {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
    height: 3.5rem;
    padding: 0 ${theme.spacing[4]};
    background: ${theme.colors.neutral[0]};
    border-bottom: 1px solid ${theme.colors.neutral[200]};
  }

  .header__divider {
    width: 1px;
    height: 1.25rem;
    background: ${theme.colors.neutral[200]};
  }

  .header__scope {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[1]};
    min-width: 0;
    overflow: hidden;
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .header__scopeDot {
    flex-shrink: 0;
    width: 0.375rem;
    height: 0.375rem;
    border-radius: ${theme.radius.full};
    background: ${theme.colors.primary[500]};
  }

  .header__scopeValue {
    color: ${theme.colors.neutral[900]};
    font-weight: ${theme.typography.weight.semibold};
  }

  .header__profile {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    margin-left: auto;
    text-align: right;
  }

  .header__name {
    font-size: ${theme.typography.size.xs};
    font-weight: ${theme.typography.weight.bold};
  }

  .header__role {
    color: ${theme.colors.neutral[500]};
    font-size: ${theme.typography.size.xs};
  }

  .header__warning {
    color: ${theme.colors.danger[600]};
    font-size: ${theme.typography.size.xs};
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .header__divider,
    .header__scope,
    .header__profileText {
      display: none;
    }
  }
`;

// Global con clases BEM porque la marca es un <Link>
export const HeaderBrandStyles = css.global`
  .header__brand {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: ${theme.spacing[2]};
    font-size: ${theme.typography.size.base};
    font-weight: ${theme.typography.weight.bold};
  }

  .header__logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: ${theme.radius.md};
    background: ${theme.colors.primary[500]};
    color: ${theme.colors.neutral[0]};
    font-size: ${theme.typography.size.xs};
  }
`;
