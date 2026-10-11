"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SectionTabsLinkStyles, SectionTabsStyles } from "./sectionTabs.styles";

export type SectionTab = {
  href: string;
  label: string;
};

export type SectionTabsProps = {
  tabs: SectionTab[];
  label: string;
};

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

// Pestañas de una sección (Talento, Sesiones). Cada pestaña es una ruta.
const SectionTabsComponent = ({ tabs, label }: SectionTabsProps) => {
  const pathname = usePathname();
  return (
    <nav className="sectionTabs" aria-label={label}>
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`sectionTabs__link ${active ? "sectionTabs__link--active" : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}

      <style jsx global>
        {SectionTabsLinkStyles}
      </style>
      <style jsx>{SectionTabsStyles}</style>
    </nav>
  );
};

export default SectionTabsComponent;
