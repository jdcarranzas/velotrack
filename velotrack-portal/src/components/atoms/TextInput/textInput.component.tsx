import TextInputStyles from "./textInput.styles";

export type TextInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  invalid?: boolean;
  // Cifras y UUID en monoespaciada
  mono?: boolean;
};

const TextInputComponent = ({
  invalid = false,
  mono = false,
  type = "text",
  ...props
}: TextInputProps) => (
  <>
    <input
      {...props}
      type={type}
      aria-invalid={invalid || undefined}
      className={`textInput ${invalid ? "textInput--invalid" : ""} ${mono ? "textInput--mono" : ""}`}
    />

    <style jsx>{TextInputStyles}</style>
  </>
);

export default TextInputComponent;
