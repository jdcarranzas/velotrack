import { notFound } from "next/navigation";
import { z } from "zod";

import SessionDetail from "@/components/modules/SessionDetail";

export default async function SessionDetailPage({
  params,
}: PageProps<"/sessions/[sessionId]">) {
  const { sessionId } = await params;
  if (!z.guid().safeParse(sessionId).success) notFound();
  return <SessionDetail sessionId={sessionId} />;
}
