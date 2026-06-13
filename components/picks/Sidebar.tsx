"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Hash, Plus, ShieldCheck, Terminal } from 'lucide-react';
import { FLAIRS, FLAIR_COLORS, type Flair } from '@/lib/picks-db';
import { usePicksAuth } from './PicksAuthProvider';

interface SidebarProps {
    activeFlair: Flair | null;
    onFlairChange: (flair: Flair | null) => void;
    onSubmitClick: () => void;
}

export function Sidebar({ activeFlair, onFlairChange, onSubmitClick }: SidebarProps) {
    const { user } = usePicksAuth();
    const [stats, setStats] = useState({ memberCount: 0, picksCount: 0, flairCounts: {} as Record<string, number> });

    useEffect(() => {
        fetch('/api/picks/stats')
            .then(res => res.json())
            .then(setStats)
            .catch(() => { });
    }, []);

    return (
        <aside className="space-y-3">
            {/* Submit CTA */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSubmitClick}
                className="w-full py-2.5 rounded-xl text-sm font-semibold font-mono transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group"
                style={{
                    background: 'linear-gradient(135deg, rgba(0,230,118,0.15) 0%, rgba(0,168,84,0.1) 100%)',
                    color: '#00e676',
                    border: '1px solid rgba(0,230,118,0.25)',
                    boxShadow: '0 0 20px rgba(0,230,118,0.08)',
                }}
            >
                {/* Subtle shimmer */}
                <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,230,118,0.05) 0%, rgba(0,230,118,0.12) 50%, rgba(0,230,118,0.05) 100%)',
                    }}
                />
                <Plus size={15} strokeWidth={2.5} className="relative z-10" />
                <span className="relative z-10">Submit a Pick</span>
            </motion.button>

            {/* Community Stats */}
            <div
                className="rounded-xl p-4"
                style={{
                    background: 'rgba(10,10,10,0.8)',
                    border: '1px solid rgba(0,230,118,0.08)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 font-mono flex items-center gap-1.5">
                    <Terminal size={10} className="text-[#00e676]/60" />
                    Community
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="text-center py-2.5 rounded-lg"
                        style={{ background: 'rgba(0,230,118,0.04)', border: '1px solid rgba(0,230,118,0.06)' }}
                    >
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Users size={11} className="text-[#00e676]/60" />
                        </div>
                        <p className="text-base font-bold text-gray-100 font-mono">{stats.memberCount}</p>
                        <p className="text-[10px] text-gray-600 font-mono">members</p>
                    </div>
                    <div
                        className="text-center py-2.5 rounded-lg"
                        style={{ background: 'rgba(0,230,118,0.04)', border: '1px solid rgba(0,230,118,0.06)' }}
                    >
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Hash size={11} className="text-[#00e676]/60" />
                        </div>
                        <p className="text-base font-bold text-gray-100 font-mono">{stats.picksCount}</p>
                        <p className="text-[10px] text-gray-600 font-mono">picks</p>
                    </div>
                </div>

                {user && (
                    <div
                        className="mt-3 pt-3 flex items-center gap-2"
                        style={{ borderTop: '1px solid rgba(0,230,118,0.06)' }}
                    >
                        <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: '#00e676', boxShadow: '0 0 6px #00e676' }}
                        />
                        <p className="text-[11px] text-gray-500 font-mono">
                            <span className="text-[#00e676]/80">{user.username}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Browse by Flair */}
            <div
                className="rounded-xl p-4"
                style={{
                    background: 'rgba(10,10,10,0.8)',
                    border: '1px solid rgba(0,230,118,0.08)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 font-mono">
                    Browse by Flair
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    {/* All filter */}
                    <button
                        onClick={() => onFlairChange(null)}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150"
                        style={{
                            backgroundColor: activeFlair === null ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.03)',
                            color: activeFlair === null ? '#00e676' : '#525252',
                            border: activeFlair === null ? '1px solid rgba(0,230,118,0.2)' : '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        All
                    </button>
                    {FLAIRS.map(f => {
                        const color = FLAIR_COLORS[f];
                        const isActive = activeFlair === f;
                        const count = stats.flairCounts[f] || 0;

                        return (
                            <button
                                key={f}
                                onClick={() => onFlairChange(isActive ? null : f)}
                                className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center gap-1"
                                style={{
                                    backgroundColor: isActive ? `${color}14` : 'rgba(255,255,255,0.03)',
                                    color: isActive ? color : '#525252',
                                    border: isActive ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                {f}
                                {count > 0 && (
                                    <span className="text-[9px] opacity-50">{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Community Rules */}
            <div
                className="rounded-xl p-4"
                style={{
                    background: 'rgba(10,10,10,0.8)',
                    border: '1px solid rgba(0,230,118,0.08)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 font-mono flex items-center gap-1.5">
                    <ShieldCheck size={10} className="text-[#00e676]/60" />
                    Rules
                </h3>
                <ol className="space-y-2">
                    {[
                        <>Only share <span className="text-gray-300">open-source</span> tools</>,
                        <>Include the <span className="text-gray-300">license type</span> in every post</>,
                        <>Be respectful in comments</>,
                        <>No self-promotion or commercial tools</>,
                        <>Use <span className="text-gray-300">Question</span> flair for help</>,
                        <>Search before posting — no duplicates</>,
                    ].map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-gray-500 font-mono">
                            <span
                                className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold mt-0.5"
                                style={{
                                    background: 'rgba(0,230,118,0.06)',
                                    color: '#00e676',
                                    border: '1px solid rgba(0,230,118,0.1)',
                                }}
                            >
                                {i + 1}
                            </span>
                            <span className="leading-relaxed">{rule}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </aside>
    );
}
