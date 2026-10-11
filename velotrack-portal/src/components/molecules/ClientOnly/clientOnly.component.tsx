"use client";
import { useSyncExternalStore } from "react";

import Spinner from "@/components/atoms/Spinner";

export type ClientOnlyProps = {
  children: React.ReactNode;
};

const subscribe = () => () => {};

// Pinta su contenido solo en el navegador. Sirve para vistas que dependen de
// "hoy" o de la zona horaria del usuario: el servidor (en UTC, o al construir)
// calcularía otras fechas y React avisaría de un error de hidratación.
const ClientOnlyComponent = ({ children }: ClientOnlyProps) => {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return isClient ? children : <Spinner />;
};

export default ClientOnlyComponent;
