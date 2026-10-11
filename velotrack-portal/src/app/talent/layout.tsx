import SectionTabs from "@/components/molecules/SectionTabs";

const TALENT_TABS = [
  { href: "/talent/skaters", label: "Patinadores" },
  { href: "/talent/teams", label: "Equipos y Sedes" },
  { href: "/talent/categories", label: "Categorías" },
  { href: "/talent/coaches", label: "Entrenadores" },
];

export default function TalentLayout({ children }: LayoutProps<"/talent">) {
  return (
    <>
      <SectionTabs tabs={TALENT_TABS} label="Secciones de Talento" />
      {children}
    </>
  );
}
