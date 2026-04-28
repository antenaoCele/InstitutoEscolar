import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

export default function BasicTable({ title, columns, data }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      
      {/* Header */}
      {title && (
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {title}
          </h2>
        </div>
      )}

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">

          <Table>
            {/* Header */}
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                  >
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody className="divide-y divide-gray-100">
              {data.length > 0 ? (
                data.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col, j) => (
                      <TableCell
                        key={j}
                        className="px-5 py-4 text-theme-sm text-gray-700"
                      >
                        {col.render
                          ? col.render(row)
                          : row[col.accessor]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="px-5 py-4 text-center"
                    colSpan={columns.length}
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