import { LayoutDashboard, Timer, Users } from "lucide-react";
import Link from "next/link";

import { SidebarLinkStyles, SidebarStyles } from "./sidebar.styles";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/talent", label: "Talento", Icon: Users },
  { href: "/sessions", label: "Sesiones", Icon: Timer },
] as const;

export type SidebarProps = {
  pathname: string;
};

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const SidebarComponent = ({ pathname }: SidebarProps) => (
  <nav className="sidebar" aria-label="Navegación principal">
    <ul className="sidebar__list">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`sidebar__link ${active ? "sidebar__link--active" : ""}`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
              {active && <span className="sidebar__dot" aria-hidden="true" />}
            </Link>
          </li>
        );
      })}
    </ul>

    <style jsx global>
      {SidebarLinkStyles}
    </style>
    <style jsx>{SidebarStyles}</style>
  </nav>
);

export default SidebarComponent;
