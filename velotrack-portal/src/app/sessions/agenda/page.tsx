import SessionsAgenda from "@/components/modules/SessionsAgenda";
import ClientOnly from "@/components/molecules/ClientOnly";

export default function AgendaPage() {
  // Las fechas por defecto dependen del "hoy" del navegador
  return (
    <ClientOnly>
      <SessionsAgenda />
    </ClientOnly>
  );
}
