import Link from "next/link";

import ButtonStyles from "./button.styles";

export type ButtonVariant =
  "primary" | "outline" | "secondary" | "ghost" | "danger";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  // Si tiene href se pinta como enlace con aspecto de botón
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  // Botón de alternar (filtros): se marca con aria-pressed
  isActive?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

const ButtonComponent = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  href,
  type = "button",
  disabled = false,
  isActive,
  fullWidth = false,
  onClick,
  ariaLabel,
}: ButtonProps) => {
  const className = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    isActive ? "button--active" : "",
    fullWidth ? "button--fullWidth" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {href && !disabled ? (
        <Link href={href} className={className} aria-label={ariaLabel}>
          {icon}
          {children}
        </Link>
      ) : (
        <button
          type={type}
          className={className}
          disabled={disabled}
          onClick={onClick}
          aria-pressed={isActive}
          aria-label={ariaLabel}
        >
          {icon}
          {children}
        </button>
      )}
      <style jsx global>
        {ButtonStyles}
      </style>
    </>
  );
};

export default ButtonComponent;
