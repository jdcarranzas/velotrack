import { z } from "zod";

// Único lugar que lee process.env (salvo GATEWAY_URL en next.config). Las
// variables NEXT_PUBLIC_* se tienen que leer una por una (no con
// process.env[nombre]) para que Next las incluya en el bundle del navegador.
export const envSchema = z.object({
  // Entrenador que usa el portal mientras no haya login. Es un id de talentms.
  NEXT_PUBLIC_COACH_ID: z.coerce.number().int().positive().default(1),
});

export type Env = z.infer<typeof envSchema>;

export const parseEnv = (raw: Record<string, string | undefined>): Env => {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Variables de entorno inválidas: ${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
};

export const env = parseEnv({
  NEXT_PUBLIC_COACH_ID: process.env.NEXT_PUBLIC_COACH_ID,
});
