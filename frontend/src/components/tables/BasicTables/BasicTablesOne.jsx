import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

const tableData = [
  {
    id: 1,
    user: {
      name: "Lindsey Curtis",
      role: "Web Designer",
    },
    projectName: "Agency Website",
    budget: "3.9K",
    status: "Active",
  },
  {
    id: 2,
    user: {
      name: "Kaiya George",
      role: "Project Manager",
    },
    projectName: "Technology",
    budget: "24.9K",
    status: "Pending",
  },
  {
    id: 3,
    user: {
      name: "Zain Geidt",
      role: "Content Writing",
    },
    projectName: "Blog Writing",
    budget: "12.7K",
    status: "Active",
  },
  {
    id: 4,
    user: {
      name: "Abram Schleifer",
      role: "Digital Marketer",
    },
    projectName: "Social Media",
    budget: "2.8K",
    status: "Cancel",
  },
  {
    id: 5,
    user: {
      name: "Carla George",
      role: "Front-end Developer",
    },
    projectName: "Website",
    budget: "4.5K",
    status: "Active",
  },
];

export default function BasicTableOne() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            {/* Header */}
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Project Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-gray-500 text-start text-theme-xs"
                >
                  Budget
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody className="divide-y divide-gray-100">
              {tableData.map((order) => (
                <TableRow key={order.id}>
                  {/* User */}
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm">
                        {order.user.name}
                      </span>
                      <span className="block text-gray-500 text-theme-xs">
                        {order.user.role}
                      </span>
                    </div>
                  </TableCell>

                  {/* Project */}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                    {order.projectName}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-3 text-theme-sm">
                    <Badge
                      size="sm"
                      color={
                        order.status === "Active"
                          ? "success"
                          : order.status === "Pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>

                  {/* Budget */}
                  <TableCell className="px-4 py-3 text-theme-sm">
                    {order.budget}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
