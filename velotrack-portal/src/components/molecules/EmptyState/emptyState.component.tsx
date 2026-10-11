import { AlertCircle, Inbox } from "lucide-react";

import EmptyStateStyles from "./emptyState.styles";

export type EmptyStateProps = {
  title: string;
  description?: string;
  // "error" cuando falló la carga
  tone?: "empty" | "error";
  action?: React.ReactNode;
};

const EmptyStateComponent = ({
  title,
  description,
  tone = "empty",
  action,
}: EmptyStateProps) => (
  <div
    className={`emptyState emptyState--${tone}`}
    role={tone === "error" ? "alert" : undefined}
  >
    <span className="emptyState__icon" aria-hidden="true">
      {tone === "error" ? <AlertCircle size={20} /> : <Inbox size={20} />}
    </span>
    <p className="emptyState__title">{title}</p>
    {description && <p className="emptyState__description">{description}</p>}
    {action && <div className="emptyState__action">{action}</div>}

    <style jsx>{EmptyStateStyles}</style>
  </div>
);

export default EmptyStateComponent;
