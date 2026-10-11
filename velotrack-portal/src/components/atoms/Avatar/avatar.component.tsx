import { getInitials } from "@/utils/helpers/format";

import AvatarStyles from "./avatar.styles";

export type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const AvatarComponent = ({ name, size = "md" }: AvatarProps) => (
  <span className={`avatar avatar--${size}`} aria-hidden="true">
    {getInitials(name)}

    <style jsx>{AvatarStyles}</style>
  </span>
);

export default AvatarComponent;
