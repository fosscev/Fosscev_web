"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={16} />
            </button>

            {pages.map((page, i) =>
                page === '...' ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-600 text-sm">…</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className="min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all duration-150"
                        style={{
                            backgroundColor: currentPage === page ? 'rgba(216, 90, 48, 0.15)' : 'transparent',
                            color: currentPage === page ? '#D85A30' : '#6b7280',
                            border: currentPage === page ? '1px solid rgba(216, 90, 48, 0.3)' : '1px solid transparent',
                        }}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
