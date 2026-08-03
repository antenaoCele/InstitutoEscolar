import Button from "./Button";
import {
  PreviousPaginationButton,
  NextPaginationButton,
} from "./ActionButtons";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <PreviousPaginationButton
        title="Página anterior"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />

      {pages.map((page) => (
        <Button
          key={page}
          size="sm"
          variant={page === currentPage ? "primary" : "outline"}
          onClick={() => onPageChange(page)}
          className="w-10 h-10 rounded-lg"
        >
          {page}
        </Button>
      ))}

      <NextPaginationButton
        title="Página siguiente"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  );
}
