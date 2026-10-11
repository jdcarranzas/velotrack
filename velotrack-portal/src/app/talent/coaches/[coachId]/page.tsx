import { notFound } from "next/navigation";

import CoachDetail from "@/components/modules/CoachDetail";

export default async function CoachDetailPage({
  params,
}: PageProps<"/talent/coaches/[coachId]">) {
  const coachId = Number((await params).coachId);
  if (!Number.isInteger(coachId) || coachId <= 0) notFound();
  return <CoachDetail coachId={coachId} />;
}
