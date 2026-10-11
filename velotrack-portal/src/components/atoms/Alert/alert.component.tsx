import AlertStyles from "./alert.styles";

export type AlertProps = {
  children: React.ReactNode;
  tone?: "danger" | "warning" | "info" | "success";
};

const AlertComponent = ({ children, tone = "danger" }: AlertProps) => (
  <div
    className={`alert alert--${tone}`}
    role={tone === "danger" ? "alert" : "status"}
  >
    {children}

    <style jsx>{AlertStyles}</style>
  </div>
);

export default AlertComponent;
