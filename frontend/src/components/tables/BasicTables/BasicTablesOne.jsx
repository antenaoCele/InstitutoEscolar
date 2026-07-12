import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

export default function BasicTable({ title, columns, data }) {
  return (
    <div
      className="
        overflow-hidden rounded-xl border
        border-gray-200 bg-white
        dark:bg-black dark:border-neutral-800
      "
    >
      {/* Encabezado */}
      {title && (
        <div
          className="
            px-5 py-4 border-b
            border-gray-100 bg-white
            dark:bg-black dark:border-neutral-800
          "
        >
          <h2
            className="
              text-lg font-semibold
              text-gray-800
              dark:text-white
            "
          >
            {title}
          </h2>
        </div>
      )}

      {/* Tabla */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <Table className="bg-white dark:bg-black">
            {/* Encabezado */}
            <TableHeader
              className="
                border-b border-gray-100
                bg-white
                dark:bg-black dark:border-neutral-800
              "
            >
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className="
                      px-5 py-3 text-start text-theme-xs
                      text-gray-500 bg-white
                      dark:bg-black dark:text-neutral-400
                    "
                  >
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Cuerpo */}
            <TableBody
              className="
                divide-y divide-gray-100
                bg-white
                dark:bg-black dark:divide-neutral-900
              "
            >
              {data.length > 0 ? (
                data.map((row, i) => (
                  <TableRow
                    key={i}
                    className="
                      group
                    "
                  >
                    {columns.map((col, j) => (
                      <TableCell
                        key={j}
                        className="
                          px-5
                          h-24
                          align-middle
                          text-theme-sm
                          text-gray-700
                          transition-colors
                          duration-150
                          group-hover:bg-cyan-50
                          dark:text-neutral-200
                          dark:group-hover:bg-neutral-900
                        "
                      >
                        {col.render ? col.render(row) : row[col.accessor]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="
                      px-5 py-6 text-center
                      text-gray-500 bg-white
                      dark:bg-black dark:text-neutral-500
                    "
                  >
                    No hay datos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
