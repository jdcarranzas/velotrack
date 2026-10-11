import css from "styled-jsx/css";

import { theme } from "@/utils/theme";

const SessionsAgendaStyles = css`
  .sessionsAgenda {
    padding: ${theme.spacing[6]};
  }

  .sessionsAgenda__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[4]};
  }

  .sessionsAgenda__date {
    width: 11rem;
  }

  .sessionsAgenda__scope {
    display: flex;
    gap: ${theme.spacing[2]};
  }

  .sessionsAgenda__footer {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border-top: 1px solid ${theme.colors.neutral[100]};
  }
`;

export default SessionsAgendaStyles;
