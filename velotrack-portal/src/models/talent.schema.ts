import { z } from "zod";

// Validación de los formularios de talentms. Los formularios trabajan con
// strings (lo que dan los inputs) y estos schemas los convierten al *Input del
// modelo. Repiten las reglas de los DTOs (@NotBlank, @Email, @NotNull…) porque
// talentms no valida todos sus endpoints.

const requiredText = (message: string) => z.string().trim().min(1, message);

// "" → undefined para los campos opcionales
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined);

const requiredId = (message: string) =>
  z
    .string()
    .min(1, message)
    .transform(Number)
    .pipe(z.number().int().positive(message));

export const venueFormSchema = z.object({
  name: requiredText("Escribe el nombre de la sede"),
  description: optionalText,
  organizationId: requiredId("Indica la organización"),
});

export type VenueFormValues = z.input<typeof venueFormSchema>;

export const teamFormSchema = z.object({
  name: requiredText("Escribe el nombre del equipo"),
  description: optionalText,
  venueId: requiredId("Elige la sede"),
});

export type TeamFormValues = z.input<typeof teamFormSchema>;

export const categoryFormSchema = z.object({
  name: requiredText("Escribe el nombre de la categoría"),
  description: optionalText,
});

export type CategoryFormValues = z.input<typeof categoryFormSchema>;

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => !value || z.email().safeParse(value).success, {
    message: "Escribe un correo válido",
  })
  .transform((value) => value || undefined);

export const skaterFormSchema = z.object({
  name: requiredText("Escribe el nombre"),
  idNumber: requiredText("Escribe el documento"),
  dateOfBirth: z.iso
    .date("Elige la fecha de nacimiento")
    .refine((value) => value <= new Date().toISOString().slice(0, 10), {
      message: "La fecha no puede ser futura",
    }),
  categoryId: requiredId("Elige la categoría"),
  teamId: requiredId("Elige el equipo"),
  venueId: requiredId("El equipo no tiene sede"),
  telephone: optionalText,
  email: optionalEmail,
});

export type SkaterFormValues = z.input<typeof skaterFormSchema>;

export const coachFormSchema = z.object({
  name: requiredText("Escribe el nombre"),
  email: z.string().trim().pipe(z.email("Escribe un correo válido")),
  password: z.string().min(8, "Usa al menos 8 caracteres"),
  telephone: optionalText,
  teamIds: z
    .array(z.number().int().positive())
    .min(1, "Asigna al menos un equipo"),
});

export type CoachFormValues = z.input<typeof coachFormSchema>;
