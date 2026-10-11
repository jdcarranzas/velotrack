// "16.21s" a partir de milisegundos
export const formatLapMs = (ms: number): string => `${(ms / 1000).toFixed(2)}s`;

// "49.8" (la unidad la pone la UI)
export const formatSpeedKmh = (kmh: number): string => kmh.toFixed(1);

// Iniciales para el avatar: "Santiago Ríos Vargas" → "SR"
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

// "33333333-3333-…" → "33333333" para mostrar UUID largos
export const shortId = (id: string): string => id.split("-")[0];
