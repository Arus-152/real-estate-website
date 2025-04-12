"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination({ currentPage, totalPages, onPageChange }) {
  // Function to generate page numbers with ellipsis for many pages
  const getPageNumbers = () => {
    const pageNumbers = []

    if (totalPages <= 7) {
      // If 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include first page
      pageNumbers.push(1)

      if (currentPage > 3) {
        // Add ellipsis if current page is away from the start
        pageNumbers.push("...")
      }

      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (currentPage < totalPages - 2) {
        // Add ellipsis if current page is away from the end
        pageNumbers.push("...")
      }

      // Always include last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="flex items-center justify-center mt-10 space-x-2">
      <button
        className="px-3 py-2 border rounded-full bg-white text-black font-medium disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="sr-only">Previous</span>
      </button>

      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`w-10 h-10 rounded-full ${
              currentPage === page ? "bg-[#0041d9] text-white" : "bg-white text-black"
            } flex items-center justify-center font-medium`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}

      <button
        className="px-3 py-2 border rounded-full bg-white text-black font-medium disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-5 h-5" />
        <span className="sr-only">Next</span>
      </button>
    </div>
  )
}
