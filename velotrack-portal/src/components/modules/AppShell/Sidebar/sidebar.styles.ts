import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

export const SidebarStyles = css`
  .sidebar {
    flex-shrink: 0;
    width: 12rem;
    padding: ${theme.spacing[3]};
    background: ${theme.colors.neutral[0]};
    border-right: 1px solid ${theme.colors.neutral[200]};
  }

  .sidebar__list {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[1]};
    list-style: none;
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .sidebar {
      width: 100%;
      padding: ${theme.spacing[2]};
      border-right: none;
      border-bottom: 1px solid ${theme.colors.neutral[200]};
    }

    .sidebar__list {
      flex-direction: row;
    }
  }
`;

// Global con clases BEM porque la clase va en <Link>
export const SidebarLinkStyles = css.global`
  .sidebar__link {
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border-radius: ${theme.radius.md};
    color: ${theme.colors.neutral[900]};
    font-size: ${theme.typography.size.sm};
    font-weight: ${theme.typography.weight.medium};
  }

  .sidebar__link:hover {
    background: ${theme.colors.neutral[50]};
  }

  .sidebar__link--active,
  .sidebar__link--active:hover {
    background: ${theme.colors.primary[50]};
    color: ${theme.colors.primary[500]};
  }

  .sidebar__dot {
    width: 0.375rem;
    height: 0.375rem;
    margin-left: auto;
    border-radius: ${theme.radius.full};
    background: ${theme.colors.primary[500]};
  }
`;
