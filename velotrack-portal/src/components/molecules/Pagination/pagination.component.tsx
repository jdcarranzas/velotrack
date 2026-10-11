import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "@/components/atoms/Button";

import PaginationStyles from "./pagination.styles";

export type PaginationProps = {
  offset: number;
  limit: number;
  // Elementos de la página actual. Si es menor que limit, no hay más páginas.
  pageCount: number;
  onChange: (offset: number) => void;
  itemLabel?: string;
};

// Paginación por limit/offset (captura no devuelve el total).
const PaginationComponent = ({
  offset,
  limit,
  pageCount,
  onChange,
  itemLabel = "resultados",
}: PaginationProps) => (
  <div className="pagination">
    <span>
      {pageCount === 0
        ? `0 ${itemLabel}`
        : `${offset + 1}–${offset + pageCount} ${itemLabel}`}
    </span>
    <div className="pagination__buttons">
      <Button
        variant="secondary"
        size="sm"
        icon={<ChevronLeft size={14} />}
        disabled={offset === 0}
        onClick={() => onChange(Math.max(0, offset - limit))}
      >
        Anterior
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={pageCount < limit}
        onClick={() => onChange(offset + limit)}
      >
        Siguiente
        <ChevronRight size={14} />
      </Button>
    </div>

    <style jsx>{PaginationStyles}</style>
  </div>
);

export default PaginationComponent;
