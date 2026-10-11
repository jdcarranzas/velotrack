import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const AppShellStyles = css`
  .appShell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .appShell__body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .appShell__main {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: ${theme.mediaQueries.tablet}) {
    .appShell__body {
      flex-direction: column;
    }
  }
`;

export default AppShellStyles;
