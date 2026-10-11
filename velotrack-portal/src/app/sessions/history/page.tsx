import AthleteHistory from "@/components/modules/AthleteHistory";
import ClientOnly from "@/components/molecules/ClientOnly";

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function HistoryPage({
  searchParams,
}: PageProps<"/sessions/history">) {
  const params = await searchParams;
  const athleteId = first(params.athleteId);
  const from = first(params.from);
  const to = first(params.to);
  // Las fechas por defecto dependen del "hoy" del navegador
  return (
    <ClientOnly>
      <AthleteHistory
        // Una consulta nueva reinicia la paginación y el formulario
        key={`${athleteId}|${from}|${to}`}
        athleteId={athleteId}
        from={from}
        to={to}
      />
    </ClientOnly>
  );
}
