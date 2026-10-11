import StatCardStyles from "./statCard.styles";

export type StatCardTone =
  "primary" | "success" | "accent" | "warning" | "neutral";

export type StatCardProps = {
  label: string;
  // null muestra "—" (todavía no hay datos)
  value: string | number | null;
  unit?: string;
  caption?: string;
  tone?: StatCardTone;
};

const StatCardComponent = ({
  label,
  value,
  unit,
  caption,
  tone = "primary",
}: StatCardProps) => (
  <div className={`statCard statCard--${tone}`}>
    <span className="statCard__label">{label}</span>
    <span
      className={`statCard__value ${value === null ? "statCard__value--empty" : ""}`}
    >
      {value ?? "—"}
      {value !== null && unit && <span className="statCard__unit">{unit}</span>}
    </span>
    {caption && <span className="statCard__caption">{caption}</span>}

    <style jsx>{StatCardStyles}</style>
  </div>
);

export default StatCardComponent;
