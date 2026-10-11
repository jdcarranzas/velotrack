import BadgeStyles from "./badge.styles";

export type BadgeTone =
  "neutral" | "info" | "success" | "warning" | "danger" | "accent";

export type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  // Punto a la izquierda, como en los estados ("● Activo")
  withDot?: boolean;
};

const BadgeComponent = ({
  children,
  tone = "neutral",
  withDot = false,
}: BadgeProps) => (
  <span className={`badge badge--${tone}`}>
    {withDot && <span className="badge__dot" aria-hidden="true" />}
    {children}

    <style jsx>{BadgeStyles}</style>
  </span>
);

export default BadgeComponent;
