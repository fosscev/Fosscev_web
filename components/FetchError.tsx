"use client";

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface FetchErrorProps {
    message?: string;
    onRetry?: () => void;
}

export function FetchError({ message = "Failed to load content. Please try again.", onRetry }: FetchErrorProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-surface/30 border border-red-500/10 rounded-2xl">
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse"></div>
                <AlertTriangle className="w-12 h-12 text-red-500 relative z-10" />
            </div>
            <h3 className="text-xl font-display font-bold text-gray-200 mb-2">
                Connection Error
            </h3>
            <p className="text-gray-400 font-mono text-sm mb-6 max-w-sm">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all font-semibold text-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] group"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Retry
                </button>
            )}
        </div>
    );
}
