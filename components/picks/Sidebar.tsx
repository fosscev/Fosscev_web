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

            {/* Guidelines Box */}
            <div className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-bold font-display mb-3">Guidelines</h3>
                <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4 marker:text-primary/70">
                    <li>Share real experiences with open source tools.</li>
                    <li>Choose the correct category for your post.</li>
                    <li>Keep content relevant and respectful.</li>
                    <li>No spam, hate speech, or misleading information.</li>
                    <li>Respect privacy and avoid sharing sensitive data.</li>
                    <li>Flag content that violates these guidelines.</li>
                    <li>Flagged posts may be reviewed by administrators.</li>
                </ul>
            </div>
        </aside>
    );
}
