import { redirect } from "next/navigation";

import { env } from "@/utils/constants/env";

// Sin listado de entrenadores en talentms: se abre el entrenador actual.
export default function CoachesPage() {
  redirect(`/talent/coaches/${env.NEXT_PUBLIC_COACH_ID}`);
}
