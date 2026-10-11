import SpinnerStyles from "./spinner.styles";

export type SpinnerProps = {
  label?: string;
};

const SpinnerComponent = ({ label = "Cargando…" }: SpinnerProps) => (
  <div className="spinner" role="status">
    <span className="spinner__circle" aria-hidden="true" />
    <span>{label}</span>

    <style jsx>{SpinnerStyles}</style>
  </div>
);

export default SpinnerComponent;
