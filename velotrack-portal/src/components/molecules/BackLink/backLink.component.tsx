import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import BackLinkStyles from "./backLink.styles";

export type BackLinkProps = {
  href: string;
  label: string;
};

const BackLinkComponent = ({ href, label }: BackLinkProps) => (
  <>
    <Link href={href} className="backLink">
      <ArrowLeft size={14} aria-hidden="true" />
      {label}
    </Link>
    <style jsx global>
      {BackLinkStyles}
    </style>
  </>
);

export default BackLinkComponent;
