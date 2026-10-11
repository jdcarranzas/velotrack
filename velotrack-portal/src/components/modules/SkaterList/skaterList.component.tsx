import { ArrowRight, Plus } from "lucide-react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Select, { type SelectOption } from "@/components/atoms/Select";
import Spinner from "@/components/atoms/Spinner";
import TextInput from "@/components/atoms/TextInput";
import Card from "@/components/molecules/Card";
import DataTable, {
  type DataTableColumn,
} from "@/components/molecules/DataTable";
import EmptyState from "@/components/molecules/EmptyState";
import NameCell from "@/components/molecules/NameCell";
import PageHeader from "@/components/molecules/PageHeader";
import type { SkaterFilters, SkaterRow } from "@/models/talent.selectors";
import type { ApiError } from "@/services/http/apiError";
import { formatDate } from "@/utils/helpers/date";

import SkaterListStyles from "./skaterList.styles";

export type SkaterListProps = {
  rows: SkaterRow[];
  totalCount: number;
  isLoading: boolean;
  error: ApiError | null;
  filters: SkaterFilters;
  categoryOptions: SelectOption[];
  teamOptions: SelectOption[];
  canRegister: boolean;
  onFiltersChange: (filters: SkaterFilters) => void;
  onRegister: () => void;
};

const COLUMNS: DataTableColumn<SkaterRow>[] = [
  {
    key: "name",
    header: "Nombre",
    render: (row) => (
      <NameCell
        name={row.skater.name}
        badge={row.isMinor && <Badge tone="warning">Menor</Badge>}
      />
    ),
  },
  {
    key: "idNumber",
    header: "Documento",
    mono: true,
    muted: true,
    render: (row) => row.skater.idNumber,
  },
  {
    key: "age",
    header: "Edad",
    align: "center",
    render: (row) => row.age,
  },
  {
    key: "category",
    header: "Categoría",
    muted: true,
    render: (row) => row.categoryName,
  },
  { key: "team", header: "Equipo", render: (row) => row.teamName },
  {
    key: "venue",
    header: "Sede",
    muted: true,
    render: (row) => row.venueName,
  },
  {
    key: "createdAt",
    header: "Registrado",
    mono: true,
    muted: true,
    render: (row) => formatDate(row.skater.createdAt),
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: (row) => (
      <Button
        variant="ghost"
        size="sm"
        href={`/talent/skaters/${row.skater.id}`}
      >
        Ver perfil
        <ArrowRight size={12} aria-hidden="true" />
      </Button>
    ),
  },
];

const SkaterListComponent = ({
  rows,
  totalCount,
  isLoading,
  error,
  filters,
  categoryOptions,
  teamOptions,
  canRegister,
  onFiltersChange,
  onRegister,
}: SkaterListProps) => {
  const setFilter = <Key extends keyof SkaterFilters>(
    key: Key,
    value: SkaterFilters[Key],
  ) => onFiltersChange({ ...filters, [key]: value });

  return (
    <div className="skaterList">
      <PageHeader
        title="Patinadores"
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={onRegister}
            disabled={!canRegister}
          >
            Registrar patinador
          </Button>
        }
      />

      <div className="skaterList__filters">
        <div className="skaterList__search">
          <TextInput
            type="search"
            aria-label="Buscar por nombre o documento"
            placeholder="Buscar por nombre o documento…"
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
          />
        </div>
        <Select
          aria-label="Categoría"
          placeholder="Todas las categorías"
          options={categoryOptions}
          value={filters.categoryId === null ? "" : String(filters.categoryId)}
          onChange={(event) =>
            setFilter(
              "categoryId",
              event.target.value ? Number(event.target.value) : null,
            )
          }
        />
        <Select
          aria-label="Equipo"
          placeholder="Todos los equipos"
          options={teamOptions}
          value={filters.teamId === null ? "" : String(filters.teamId)}
          onChange={(event) =>
            setFilter(
              "teamId",
              event.target.value ? Number(event.target.value) : null,
            )
          }
        />
        <Button
          variant="secondary"
          isActive={filters.onlyMinors}
          onClick={() => setFilter("onlyMinors", !filters.onlyMinors)}
        >
          Solo menores
        </Button>
      </div>

      <Card padded={false}>
        {isLoading ? (
          <Spinner label="Cargando patinadores…" />
        ) : error ? (
          <EmptyState
            tone="error"
            title="No se pudieron cargar los patinadores"
            description={error.message}
          />
        ) : (
          <DataTable
            columns={COLUMNS}
            rows={rows}
            getRowKey={(row) => row.skater.id}
            caption="Patinadores"
            emptyMessage={
              totalCount === 0
                ? "Tus equipos todavía no tienen patinadores."
                : "Ningún patinador coincide con los filtros."
            }
            footer={`${rows.length} de ${totalCount} atletas`}
          />
        )}
      </Card>

      <style jsx>{SkaterListStyles}</style>
    </div>
  );
};

export default SkaterListComponent;
