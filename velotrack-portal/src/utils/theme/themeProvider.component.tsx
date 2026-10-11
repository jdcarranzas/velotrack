"use client";
import ThemeStyles from "./theme.styles";

type ThemeProviderProps = {
  children: React.ReactNode;
};

// Aplica los estilos globales del tema. Los componentes importan `theme` y
// lo interpolan en sus propios estilos.
const ThemeProvider = ({ children }: ThemeProviderProps) => (
  <>
    {children}

    <style jsx global>
      {ThemeStyles}
    </style>
  </>
);

export type { ThemeProviderProps };
export default ThemeProvider;
