import type { Metadata } from "next";
import { Inter } from "next/font/google";

import AppShell from "@/components/modules/AppShell";
import { CoachSessionProvider } from "@/context/CoachSession";
import { ThemeProvider } from "@/utils/theme";

import StyledJsxRegistry from "./registry";

// Fuente provisional: el código de Figma no la define. Se confirma en la fase 2.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeloTrack",
  description:
    "Analítica de desempeño para entrenadores de patinaje de carreras",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <StyledJsxRegistry>
          <ThemeProvider>
            <CoachSessionProvider>
              <AppShell>{children}</AppShell>
            </CoachSessionProvider>
          </ThemeProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
