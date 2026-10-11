import css from "styled-jsx/css";

import { theme } from "./theme.constants";

const ThemeStyles = css.global`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    font-family: ${theme.typography.family};
    color: ${theme.colors.neutral[900]};
    background: ${theme.colors.neutral[50]};
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }

  /* Cifras de ancho fijo para tiempos y velocidades (no "bailan" al cambiar) */
  .tabular {
    font-variant-numeric: tabular-nums;
  }

  /* Texto solo para lectores de pantalla */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;

export default ThemeStyles;
