import FormGridStyles from "./formGrid.styles";

export type FormGridProps = {
  children: React.ReactNode;
  // Columnas en escritorio; en móvil siempre una
  columns?: 1 | 2 | 3 | 4;
};

const FormGridComponent = ({ children, columns = 2 }: FormGridProps) => (
  <div
    className="formGrid"
    style={{ "--columns": columns } as React.CSSProperties}
  >
    {children}

    <style jsx>{FormGridStyles}</style>
  </div>
);

export default FormGridComponent;
