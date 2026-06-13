"use client";

import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock, HelpCircle, Sparkles } from 'lucide-react';
import type { SortMode } from '@/lib/picks-db';

interface SortTabsProps {
    activeSort: SortMode;
    onSortChange: (sort: SortMode) => void;
    isLoggedIn: boolean;
}

const TABS: { key: SortMode; label: string; icon: React.ReactNode; requiresAuth?: boolean }[] = [
    { key: 'hot', label: 'Hot', icon: <Flame size={14} /> },
    { key: 'top', label: 'Top', icon: <TrendingUp size={14} /> },
    { key: 'new', label: 'New', icon: <Clock size={14} /> },
    { key: 'questions', label: 'Questions', icon: <HelpCircle size={14} /> },
    { key: 'foryou', label: 'For You', icon: <Sparkles size={14} />, requiresAuth: true },
];

export function SortTabs({ activeSort, onSortChange, isLoggedIn }: SortTabsProps) {
    return (
        <div className="flex items-center gap-1 bg-[#0a0a0a]/60 border border-white/[0.06] rounded-xl p-1.5 mb-4 overflow-x-auto no-scrollbar">
            {TABS.map(tab => {
                if (tab.requiresAuth && !isLoggedIn) return null;
                const isActive = activeSort === tab.key;

                return (
                    <button
                        key={tab.key}
                        onClick={() => onSortChange(tab.key)}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150"
                        style={{
                            color: isActive ? '#fff' : '#6b7280',
                        }}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="sort-pill"
                                className="absolute inset-0 rounded-lg"
                                style={{
                                    background: 'rgba(216, 90, 48, 0.12)',
                                    border: '1px solid rgba(216, 90, 48, 0.25)',
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5"
                            style={{ color: isActive ? '#D85A30' : undefined }}
                        >
                            {tab.icon}
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
