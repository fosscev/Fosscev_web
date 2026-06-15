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
    { key: 'hot', label: 'Hot', icon: <Flame size={13} /> },
    { key: 'top', label: 'Top', icon: <TrendingUp size={13} /> },
    { key: 'new', label: 'New', icon: <Clock size={13} /> },
    { key: 'questions', label: 'Questions', icon: <HelpCircle size={13} /> },
    { key: 'foryou', label: 'For You', icon: <Sparkles size={13} />, requiresAuth: true },
];

export function SortTabs({ activeSort, onSortChange, isLoggedIn }: SortTabsProps) {
    return (
        <div
            className="flex items-center gap-1 rounded-xl p-1.5 mb-4 overflow-x-auto no-scrollbar"
            style={{
                background: 'rgba(10,10,10,0.8)',
                border: '1px solid rgba(0,230,118,0.08)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {TABS.map(tab => {
                if (tab.requiresAuth && !isLoggedIn) return null;
                const isActive = activeSort === tab.key;

                return (
                    <button
                        key={tab.key}
                        onClick={() => onSortChange(tab.key)}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 font-mono"
                        style={{ color: isActive ? '#00e676' : '#525252' }}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="sort-pill"
                                className="absolute inset-0 rounded-lg"
                                style={{
                                    background: 'rgba(0, 230, 118, 0.08)',
                                    border: '1px solid rgba(0, 230, 118, 0.2)',
                                    boxShadow: '0 0 12px rgba(0,230,118,0.05)',
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {tab.icon}
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
