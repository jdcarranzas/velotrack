import { notFound } from "next/navigation";

import SkaterProfile from "@/components/modules/SkaterProfile";

export default async function SkaterProfilePage({
  params,
}: PageProps<"/talent/skaters/[skaterId]">) {
  const skaterId = Number((await params).skaterId);
  if (!Number.isInteger(skaterId) || skaterId <= 0) notFound();
  return <SkaterProfile skaterId={skaterId} />;
}
