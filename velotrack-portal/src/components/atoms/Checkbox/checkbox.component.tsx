import CheckboxStyles from "./checkbox.styles";

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  // Texto secundario a la derecha de la etiqueta
  hint?: string;
  disabled?: boolean;
};

const CheckboxComponent = ({
  label,
  checked,
  onChange,
  hint,
  disabled = false,
}: CheckboxProps) => (
  <label className="checkbox">
    <input
      type="checkbox"
      className="checkbox__input"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span>{label}</span>
    {hint && <span className="checkbox__hint">{hint}</span>}

    <style jsx>{CheckboxStyles}</style>
  </label>
);

export default CheckboxComponent;
