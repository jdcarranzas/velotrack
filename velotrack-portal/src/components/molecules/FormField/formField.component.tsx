import FormFieldStyles from "./formField.styles";

export type FormFieldProps = {
  label: string;
  // id del control para asociar la etiqueta
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  optional?: boolean;
};

const FormFieldComponent = ({
  label,
  htmlFor,
  children,
  error,
  hint,
  optional = false,
}: FormFieldProps) => (
  <div className="formField">
    <label className="formField__label" htmlFor={htmlFor}>
      {label}
      {optional && <span className="formField__optional">(opcional)</span>}
    </label>
    {children}
    {error ? (
      <span className="formField__error" role="alert">
        {error}
      </span>
    ) : (
      hint && <span className="formField__hint">{hint}</span>
    )}

    <style jsx>{FormFieldStyles}</style>
  </div>
);

export default FormFieldComponent;
