"use client";

import { useEffect, useState } from 'react';
import { Users, Hash, Plus, ShieldCheck } from 'lucide-react';
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
        <aside className="space-y-4">
            {/* Submit CTA */}
            <button
                onClick={onSubmitClick}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                    background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(216, 90, 48, 0.2)',
                }}
            >
                <Plus size={16} strokeWidth={2.5} />
                Submit a Pick
            </button>

            {/* Community Stats */}
            <div className="bg-[#0a0a0a]/80 border border-white/[0.06] rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 font-mono">
                    Community
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Users size={13} className="text-[#D85A30]" />
                        </div>
                        <p className="text-lg font-bold text-gray-100 font-mono">{stats.memberCount}</p>
                        <p className="text-xs text-gray-500">Members</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Hash size={13} className="text-[#D85A30]" />
                        </div>
                        <p className="text-lg font-bold text-gray-100 font-mono">{stats.picksCount}</p>
                        <p className="text-xs text-gray-500">Picks</p>
                    </div>
                </div>

                {user && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <p className="text-xs text-gray-500">
                            Signed in as <span className="text-[#D85A30] font-mono">{user.username}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Browse by Flair */}
            <div className="bg-[#0a0a0a]/80 border border-white/[0.06] rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 font-mono">
                    Browse by Flair
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    {/* All filter */}
                    <button
                        onClick={() => onFlairChange(null)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                        style={{
                            backgroundColor: activeFlair === null ? 'rgba(216, 90, 48, 0.15)' : 'rgba(255,255,255,0.04)',
                            color: activeFlair === null ? '#D85A30' : '#6b7280',
                            border: activeFlair === null ? '1px solid rgba(216, 90, 48, 0.3)' : '1px solid transparent',
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
                                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1"
                                style={{
                                    backgroundColor: isActive ? `${color}20` : 'rgba(255,255,255,0.04)',
                                    color: isActive ? color : '#6b7280',
                                    border: isActive ? `1px solid ${color}40` : '1px solid transparent',
                                }}
                            >
                                {f}
                                {count > 0 && (
                                    <span className="text-[10px] opacity-60">{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Community Rules */}
            <div className="bg-[#0a0a0a]/80 border border-white/[0.06] rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 font-mono flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-[#D85A30]" />
                    Community Rules
                </h3>
                <ol className="space-y-2 text-xs text-gray-400 list-decimal list-inside">
                    <li>Only share <span className="text-gray-300">open-source</span> tools and software</li>
                    <li>Include the <span className="text-gray-300">license type</span> in every post</li>
                    <li>Be respectful and constructive in comments</li>
                    <li>No self-promotion or commercial tools</li>
                    <li>Use the <span className="text-gray-300">Question</span> flair for help requests</li>
                    <li>Search before posting — avoid duplicates</li>
                </ol>
            </div>
        </aside>
    );
}
