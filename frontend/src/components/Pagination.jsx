import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-12 gap-2">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-btn p-2 rounded-lg"
      >
        <ChevronLeft size={20} />
      </button>
      
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-lg text-sm transition-all ${
            currentPage === i + 1 ? 'pagination-btn-active' : 'pagination-btn'
          }`}
        >
          {i + 1}
        </button>
      ))}
      
      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-btn p-2 rounded-lg"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}