"use client";

import { Plus } from 'lucide-react';

interface SidebarProps {
    onSubmitClick: () => void;
    activeFlair?: any;
    onFlairChange?: any;
}

export function Sidebar({ onSubmitClick }: SidebarProps) {
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
                Write a Pick
            </button>
        </aside>
    );
}
