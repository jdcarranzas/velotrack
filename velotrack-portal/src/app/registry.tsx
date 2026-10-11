"use client";
import { useState } from "react";

import { useServerInsertedHTML } from "next/navigation";
import { createStyleRegistry, StyleRegistry } from "styled-jsx";

// Recoge los estilos de styled-jsx durante el render en el servidor y los
// inserta en el HTML. Sin esto el primer pintado llega sin CSS hasta que el
// JS los inyecta en el cliente.
export default function StyledJsxRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
