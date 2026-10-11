import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const AvatarStyles = css`
  .avatar {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.radius.full};
    background: linear-gradient(
      135deg,
      ${theme.colors.primary[500]},
      ${theme.colors.accent[500]}
    );
    color: ${theme.colors.neutral[0]};
    font-weight: ${theme.typography.weight.bold};
    letter-spacing: 0.02em;
  }

  .avatar--sm {
    width: 2rem;
    height: 2rem;
    font-size: ${theme.typography.size.xs};
  }

  .avatar--md {
    width: 2.25rem;
    height: 2.25rem;
    font-size: ${theme.typography.size.sm};
  }

  .avatar--lg {
    width: 4rem;
    height: 4rem;
    font-size: ${theme.typography.size.xl};
  }
`;

export default AvatarStyles;
