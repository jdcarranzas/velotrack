import SectionTabs from "@/components/molecules/SectionTabs";

const SESSIONS_TABS = [
  // { href: "/sessions/agenda", label: "Agenda" },
  { href: "/sessions/history", label: "Historial por atleta" },
  { href: "/sessions/new", label: "Nueva sesión" },
];

export default function SessionsLayout({ children }: LayoutProps<"/sessions">) {
  return (
    <>
      <SectionTabs tabs={SESSIONS_TABS} label="Secciones de Sesiones" />
      {children}
    </>
  );
}
