import TextareaStyles from "./textarea.styles";

export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  invalid?: boolean;
};

const TextareaComponent = ({ invalid = false, ...props }: TextareaProps) => (
  <>
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={`textarea ${invalid ? "textarea--invalid" : ""}`}
    />

    <style jsx>{TextareaStyles}</style>
  </>
);

export default TextareaComponent;
