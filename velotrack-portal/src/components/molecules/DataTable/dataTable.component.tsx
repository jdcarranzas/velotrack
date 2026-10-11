import DataTableStyles from "./dataTable.styles";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  // Tiempos, velocidades, fechas e ids en monoespaciada
  mono?: boolean;
  muted?: boolean;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  emptyMessage?: string;
  footer?: React.ReactNode;
  // Sin fondo en la cabecera ni padding lateral (tablas dentro de una tarjeta)
  plain?: boolean;
  caption?: string;
};

const DataTableComponent = <T,>({
  columns,
  rows,
  getRowKey,
  emptyMessage = "No hay datos para mostrar.",
  footer,
  plain = false,
  caption,
}: DataTableProps<T>) => (
  <div className={`dataTable ${plain ? "dataTable--plain" : ""}`}>
    <table className="dataTable__table">
      {caption && <caption className="visually-hidden">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={`dataTable__head dataTable__head--${column.align ?? "left"}`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className="dataTable__empty" colSpan={columns.length}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={getRowKey(row)} className="dataTable__row">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={[
                    "dataTable__cell",
                    `dataTable__cell--${column.align ?? "left"}`,
                    column.mono ? "dataTable__cell--mono" : "",
                    column.muted ? "dataTable__cell--muted" : "",
                  ].join(" ")}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
    {footer && <div className="dataTable__footer">{footer}</div>}

    <style jsx>{DataTableStyles}</style>
  </div>
);

export default DataTableComponent;
