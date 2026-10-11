import InfoFieldStyles from "./infoField.styles";

export type InfoFieldProps = {
  label: string;
  // null o "" muestra "Sin registrar"
  value: React.ReactNode;
  mono?: boolean;
};

const InfoFieldComponent = ({ label, value, mono = false }: InfoFieldProps) => {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className="infoField">
      <span className="infoField__label">{label}</span>
      <span
        className={[
          "infoField__value",
          mono ? "infoField__value--mono" : "",
          isEmpty ? "infoField__value--empty" : "",
        ].join(" ")}
      >
        {isEmpty ? "Sin registrar" : value}
      </span>

      <style jsx>{InfoFieldStyles}</style>
    </div>
  );
};

export default InfoFieldComponent;
