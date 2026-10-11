import FormActionsStyles from "./formActions.styles";

export type FormActionsProps = {
  children: React.ReactNode;
};

// Botones al pie de un formulario, alineados a la derecha
const FormActionsComponent = ({ children }: FormActionsProps) => (
  <div className="formActions">
    {children}

    <style jsx>{FormActionsStyles}</style>
  </div>
);

export default FormActionsComponent;
