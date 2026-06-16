"use client";

import { useEffect, useState } from 'react';
import { FLAIRS, FLAIR_COLORS, type Flair } from '@/lib/picks-db';

interface SidebarProps {
    activeFlair: Flair | null;
    onFlairChange: (flair: Flair | null) => void;
    onSubmitClick: () => void;
}

export function Sidebar({ activeFlair, onFlairChange, onSubmitClick }: SidebarProps) {
    const [stats, setStats] = useState({ flairCounts: {} as Record<string, number> });

    useEffect(() => {
        fetch('/api/picks/stats')
            .then(res => res.json())
            .then(setStats)
            .catch(() => { });
    }, []);

    return (
        <aside className="w-full">
            <div className="border border-white/20 rounded-2xl p-6 bg-transparent">
                <h3 className="text-sm font-bold text-white mb-6">
                    Top Trending Topics
                </h3>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onFlairChange(null)}
                        className={`w-full py-2 px-4 rounded-full border text-left text-sm transition-all duration-150 ${
                            activeFlair === null 
                                ? 'border-[#00e676] text-[#00e676] bg-[#00e676]/10' 
                                : 'border-white/20 text-gray-400 hover:border-white/50 hover:text-white bg-transparent'
                        }`}
                    >
                        All Topics
                    </button>
                    {FLAIRS.slice(0, 5).map(f => {
                        const isActive = activeFlair === f;
                        return (
                            <button
                                key={f}
                                onClick={() => onFlairChange(isActive ? null : f)}
                                className={`w-full py-2 px-4 rounded-full border text-left text-sm transition-all duration-150 ${
                                    isActive 
                                        ? 'border-[#00e676] text-[#00e676] bg-[#00e676]/10' 
                                        : 'border-white/20 text-gray-400 hover:border-white/50 hover:text-white bg-transparent'
                                }`}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
