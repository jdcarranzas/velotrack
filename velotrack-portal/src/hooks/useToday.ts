import { useState } from "react";

// Fecha de referencia para edades y "este mes". Se fija al montar el componente
// para que los cálculos no cambien en cada render.
export const useToday = (): Date => {
  const [today] = useState(() => new Date());
  return today;
};
