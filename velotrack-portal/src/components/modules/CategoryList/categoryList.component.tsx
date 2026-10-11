import { Plus } from "lucide-react";

import Alert from "@/components/atoms/Alert";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Checkbox from "@/components/atoms/Checkbox";
import Spinner from "@/components/atoms/Spinner";
import Card from "@/components/molecules/Card";
import DataTable from "@/components/molecules/DataTable";
import EmptyState from "@/components/molecules/EmptyState";
import PageHeader from "@/components/molecules/PageHeader";
import type { Category } from "@/models/talent.model";
import type { ApiError } from "@/services/http/apiError";

import CategoryListStyles from "./categoryList.styles";

export type CategoryListProps = {
  categories: Category[];
  isLoading: boolean;
  error: ApiError | null;
  actionError: string | null;
  includeInactive: boolean;
  pendingId: number | null;
  onIncludeInactiveChange: (value: boolean) => void;
  onCreate: () => void;
  onEdit: (category: Category) => void;
  onToggle: (category: Category) => void;
};

const CategoryListComponent = ({
  categories,
  isLoading,
  error,
  actionError,
  includeInactive,
  pendingId,
  onIncludeInactiveChange,
  onCreate,
  onEdit,
  onToggle,
}: CategoryListProps) => (
  <div className="categoryList">
    <PageHeader
      title="Categorías"
      description="Las categorías activas se ofrecen al registrar patinadores."
      actions={
        <div className="categoryList__toolbar">
          <Checkbox
            label="Mostrar inactivas"
            checked={includeInactive}
            onChange={onIncludeInactiveChange}
          />
          <Button icon={<Plus size={16} />} onClick={onCreate}>
            Nueva categoría
          </Button>
        </div>
      }
    />

    {actionError && (
      <div className="categoryList__alert">
        <Alert>{actionError}</Alert>
      </div>
    )}

    <Card padded={false}>
      {isLoading ? (
        <Spinner label="Cargando categorías…" />
      ) : error ? (
        <EmptyState
          tone="error"
          title="No se pudieron cargar las categorías"
          description={error.message}
        />
      ) : (
        <DataTable
          rows={categories}
          getRowKey={(category) => category.id}
          caption="Categorías"
          emptyMessage="Todavía no hay categorías."
          footer={`${categories.length} categorías`}
          columns={[
            {
              key: "name",
              header: "Nombre",
              render: (category) => category.name,
            },
            {
              key: "description",
              header: "Descripción",
              muted: true,
              render: (category) => category.description || "—",
            },
            {
              key: "status",
              header: "Estado",
              render: (category) =>
                category.isActive ? (
                  <Badge tone="success" withDot>
                    Activa
                  </Badge>
                ) : (
                  <Badge withDot>Inactiva</Badge>
                ),
            },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (category) => (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pendingId === category.id}
                    onClick={() => onToggle(category)}
                  >
                    {category.isActive ? "Desactivar" : "Activar"}
                  </Button>
                </>
              ),
            },
          ]}
        />
      )}
    </Card>

    <style jsx>{CategoryListStyles}</style>
  </div>
);

export default CategoryListComponent;
