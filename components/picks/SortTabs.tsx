"use client";

import { motion } from 'framer-motion';
import { Star, Circle, Edit3 } from 'lucide-react';
import type { SortMode } from '@/lib/picks-db';

interface SortTabsProps {
    activeSort: SortMode;
    onSortChange: (sort: SortMode) => void;
    isLoggedIn: boolean;
    onSubmitClick: () => void;
}

const TABS: { key: SortMode; label: string; icon: React.ReactNode }[] = [
    { 
        key: 'hot', 
        label: 'Most Popular', 
        icon: <div className="w-5 h-5 rounded-full border border-[#00e676] flex items-center justify-center bg-transparent"><Star size={10} className="text-[#00e676] fill-[#00e676]" /></div> 
    },
    { 
        key: 'top', 
        label: 'Highest Votes', 
        icon: <div className="w-5 h-5 rounded-full bg-[#1f9349] flex items-center justify-center"></div> 
    },
    { 
        key: 'new', 
        label: 'Latest Thread', 
        icon: <div className="w-5 h-5 rounded-full bg-[#1f9349] flex items-center justify-center"></div> 
    },
];

export function SortTabs({ activeSort, onSortChange, onSubmitClick }: SortTabsProps) {
    return (
        <div className="flex items-center justify-between mb-8 w-full">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                {TABS.map(tab => {
                    const isActive = activeSort === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onSortChange(tab.key)}
                            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
                                isActive ? 'border-white text-white' : 'border-white/20 text-gray-400 hover:text-white'
                            }`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {tab.icon}
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            
            <button 
                onClick={onSubmitClick}
                className="flex items-center gap-2 bg-[#1f9349] hover:bg-[#1a7f3f] text-white px-5 py-2 rounded-full font-bold transition-colors shadow-lg"
            >
                <Edit3 size={18} />
                Write New Thread
            </button>
        </div>
    );
}
