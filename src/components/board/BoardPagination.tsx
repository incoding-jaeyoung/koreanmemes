"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BoardPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function BoardPagination({
  currentPage,
  totalPages,
  onPageChange,
}: BoardPaginationProps) {
  const { t } = useLanguage();
  const safeTotalPages = Math.max(1, totalPages);

  // 최대 5개 페이지 버튼, 현재 페이지 중심
  const pageNumbers = Array.from({ length: Math.min(5, safeTotalPages) }, (_, i) => {
    if (safeTotalPages <= 5) return i + 1;
    const start = Math.max(1, Math.min(currentPage - 2, safeTotalPages - 4));
    return start + i;
  });

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label={t('pagination.prev')}
        className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 mx-1">
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            aria-current={currentPage === pageNum ? "page" : undefined}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              currentPage === pageNum
                ? "bg-brand-yellow text-black scale-110"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
        disabled={currentPage === safeTotalPages}
        aria-label={t('pagination.next')}
        className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
