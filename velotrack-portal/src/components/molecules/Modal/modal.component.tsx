import { useEffect, useId, useRef } from "react";

import { X } from "lucide-react";

import ModalStyles from "./modal.styles";

export type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
};

// Se monta solo cuando está abierto: el padre decide si lo pinta. Cierra con
// Escape o con un clic fuera del panel.
const ModalComponent = ({
  title,
  description,
  onClose,
  children,
  wide = false,
}: ModalProps) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    panelRef.current
      ?.querySelector<HTMLElement>("input, select, textarea, button")
      ?.focus();
  }, []);

  return (
    <div
      className="modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`modal__panel ${wide ? "modal__panel--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal__header">
          <div>
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {description && <p className="modal__description">{description}</p>}
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>

      <style jsx>{ModalStyles}</style>
    </div>
  );
};

export default ModalComponent;
