"use client";

import { motion } from 'framer-motion';
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-1 mt-8"
        >
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{
                    color: '#525252',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(10,10,10,0.8)',
                }}
                onMouseEnter={e => {
                    if (currentPage !== 1) {
                        (e.currentTarget as HTMLElement).style.color = '#00e676';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,230,118,0.2)';
                    }
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '#525252';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
                }}
            >
                <ChevronLeft size={14} />
            </button>

            {pages.map((page, i) =>
                page === '...' ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-700 text-sm font-mono">…</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className="min-w-[32px] h-8 rounded-lg text-xs font-mono font-medium transition-all duration-150"
                        style={{
                            backgroundColor: currentPage === page ? 'rgba(0,230,118,0.1)' : 'rgba(10,10,10,0.8)',
                            color: currentPage === page ? '#00e676' : '#525252',
                            border: currentPage === page
                                ? '1px solid rgba(0,230,118,0.25)'
                                : '1px solid rgba(255,255,255,0.05)',
                            boxShadow: currentPage === page ? '0 0 10px rgba(0,230,118,0.08)' : 'none',
                        }}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
                style={{
                    color: '#525252',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(10,10,10,0.8)',
                }}
                onMouseEnter={e => {
                    if (currentPage !== totalPages) {
                        (e.currentTarget as HTMLElement).style.color = '#00e676';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,230,118,0.2)';
                    }
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '#525252';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
                }}
            >
                <ChevronRight size={14} />
            </button>
        </motion.div>
    );
}
