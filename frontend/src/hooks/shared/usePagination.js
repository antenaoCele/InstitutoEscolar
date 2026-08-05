import { useEffect, useState } from "react";

export function usePagination({
  data = [],
  itemsPerPage = 10,
  dependencies = [],
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  return {
    currentPage,
    totalPages,
    currentData,
    setCurrentPage,
  };
}
