import CardStyles from "./card.styles";

export type CardProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  // false para tablas que van de borde a borde
  padded?: boolean;
};

const CardComponent = ({
  children,
  title,
  description,
  actions,
  padded = true,
}: CardProps) => (
  <section className={`card ${padded ? "card--padded" : ""}`}>
    {(title || actions) && (
      <header className="card__header">
        <div>
          {title && <h2 className="card__title">{title}</h2>}
          {description && <p className="card__description">{description}</p>}
        </div>
        {actions && <div className="card__actions">{actions}</div>}
      </header>
    )}
    {children}

    <style jsx>{CardStyles}</style>
  </section>
);

export default CardComponent;
