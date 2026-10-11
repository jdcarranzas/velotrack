// Tokens de diseño sacados del código exportado de Figma. Provisionales hasta
// la fase 2 (sistema de diseño), donde se revisan contra el archivo de Figma.
// Los componentes usan solo estos tokens, nunca valores hex sueltos.

const colors = {
  // Azul de la marca: acciones principales, enlaces y selección
  primary: {
    50: "#EBF1FF", // fondo de elementos seleccionados
    200: "#BFD3FF", // bordes de elementos seleccionados
    500: "#0057FF",
    600: "#003DBF", // hover
  },

  neutral: {
    0: "#FFFFFF",
    50: "#F5F7FA", // fondo de cabeceras de tabla y filas en hover
    100: "#F0F2F5", // líneas de cuadrícula de las gráficas
    200: "#E2E6ED", // bordes
    300: "#D1D5DB", // bordes de controles sin seleccionar
    500: "#6B7585", // texto secundario
    900: "#0D1117", // texto principal y fondo del cronómetro
  },

  success: {
    50: "#F0FDF4",
    600: "#16A34A", // "Guardado", "Activo", mejora
    700: "#15803D", // hover
  },

  // Pendiente, menores de edad y avisos
  warning: {
    50: "#FFFBEB",
    200: "#FDE68A",
    600: "#D97706",
  },

  // Errores, valores fuera de rango y acciones destructivas
  danger: {
    50: "#FEF2F2",
    600: "#DC2626",
    700: "#B91C1C", // hover
  },

  accent: {
    50: "#F5F3FF",
    500: "#7C3AED", // violeta del degradado de los avatares
  },

  // Fondo detrás de los modales
  overlay: "rgb(13 17 23 / 0.5)",

  // Series de las gráficas (un color por atleta), en este orden
  chart: {
    1: "#0057FF",
    2: "#7C3AED",
    3: "#059669",
    4: "#F59E0B",
    5: "#EF4444",
  },
} as const;

const typography = {
  // La fuente se carga con next/font en el layout y llega como variable CSS.
  family: "var(--font-sans), system-ui, -apple-system, sans-serif",
  // Tiempos y velocidades (el diseño los muestra en monoespaciada)
  familyMono:
    'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  size: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "7xl": "4.5rem", // 72px, reloj del cronómetro
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

// Escala de 4px
const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
} as const;

const radius = {
  md: "0.5rem", // controles y botones
  lg: "0.75rem", // tarjetas
  xl: "1rem", // modales y el cronómetro
  full: "9999px", // chips y avatares
} as const;

const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  lg: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

const mediaQueries = {
  tablet: "768px",
  desktop: "1024px",
  wide: "1280px",
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  mediaQueries,
} as const;
