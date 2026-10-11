import SessionCreate from "@/components/modules/SessionCreate";

export default async function NewSessionPage({
  searchParams,
}: PageProps<"/sessions/new">) {
  const { athleteId } = await searchParams;
  return (
    <SessionCreate
      athleteId={typeof athleteId === "string" ? athleteId : undefined}
    />
  );
}
