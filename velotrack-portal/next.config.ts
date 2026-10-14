import type { NextConfig } from "next";

// URL de la gateway. Es la única variable que se lee fuera de env.ts porque
// next.config se evalúa al arrancar o construir, antes que el código de la app.
// En el build de producción hay que definirla antes de `next build`.
const GATEWAY_URL = (
  process.env.GATEWAY_URL ??
  "https://velotrack-gateway-732809824488.us-east1.run.app"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Servidor autocontenido para la imagen de Docker (Cloud Run)
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  // El navegador llama a /gateway/* en el mismo origen del portal y Next
  // reenvía la petición a la gateway desde el servidor. Así no hay CORS ni en
  // local ni desplegado.
  async rewrites() {
    return [
      {
        source: "/gateway/:path*",
        destination: `${GATEWAY_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
