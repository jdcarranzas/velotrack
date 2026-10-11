import Avatar from "@/components/atoms/Avatar";

import NameCellStyles from "./nameCell.styles";

export type NameCellProps = {
  name: string;
  subtitle?: string;
  // Etiqueta junto al nombre (por ejemplo, "Menor")
  badge?: React.ReactNode;
};

// Avatar con iniciales y nombre, para la primera columna de las tablas
const NameCellComponent = ({ name, subtitle, badge }: NameCellProps) => (
  <div className="nameCell">
    <Avatar name={name} size="sm" />
    <div className="nameCell__text">
      <span className="nameCell__title">
        {name}
        {badge}
      </span>
      {subtitle && <span className="nameCell__subtitle">{subtitle}</span>}
    </div>

    <style jsx>{NameCellStyles}</style>
  </div>
);

export default NameCellComponent;
