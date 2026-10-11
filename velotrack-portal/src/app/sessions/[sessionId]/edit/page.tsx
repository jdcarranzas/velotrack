import { notFound } from "next/navigation";
import { z } from "zod";

import SessionEdit from "@/components/modules/SessionEdit";

export default async function EditSessionPage({
  params,
}: PageProps<"/sessions/[sessionId]/edit">) {
  const { sessionId } = await params;
  if (!z.guid().safeParse(sessionId).success) notFound();
  return <SessionEdit sessionId={sessionId} />;
}
