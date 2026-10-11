// Funcionalidades que existen en el código pero se activan solo cuando se
// aprueban o cuando la demo las necesita. Cambiar el valor para activarlas.
export const FEATURES = {
  // Selector "Ver como" del ProfileMenu para cambiar de usuario simulado.
  // Activo por defecto porque el portal es una demo.
  roleSwitcher: true,
  // Muestra en el perfil del patinador sus estadísticas y sesiones de captura
  // (GET /api/v1/athletes/{id del patinador}/sessions).
  captureLink: true,
} as const;
