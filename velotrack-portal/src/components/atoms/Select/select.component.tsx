import SelectStyles from "./select.styles";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "className" | "children"
> & {
  options: SelectOption[];
  // Primera opción con valor vacío ("Todas las categorías", "Elige…")
  placeholder?: string;
  invalid?: boolean;
};

const SelectComponent = ({
  options,
  placeholder,
  invalid = false,
  ...props
}: SelectProps) => (
  <>
    <select
      {...props}
      aria-invalid={invalid || undefined}
      className={`select ${invalid ? "select--invalid" : ""}`}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>

    <style jsx>{SelectStyles}</style>
  </>
);

export default SelectComponent;
