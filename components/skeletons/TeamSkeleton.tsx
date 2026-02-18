"use client";

import { motion } from "framer-motion";

export function TeamSkeleton() {
    return (
        <div className="animate-pulse w-full">
            {/* Header Skeleton */}
            <div className="mb-16 text-center max-w-4xl mx-auto px-4">
                <div className="h-20 w-3/4 mx-auto bg-gray-800/50 rounded-lg mb-6 border border-white/5"></div>
                <div className="h-6 w-1/3 mx-auto bg-gray-800/50 rounded mb-6 border border-white/5"></div>
                <div className="h-4 w-1/2 mx-auto bg-gray-800/50 rounded border border-white/5"></div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="relative bg-surface border border-white/10 rounded-xl overflow-hidden h-[400px]">
                        {/* Image Placeholder */}
                        <div className="aspect-square bg-gray-800/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-scan"></div>
                        </div>

                        {/* Content Placeholder */}
                        <div className="p-6 border-t border-white/5 space-y-4">
                            <div className="h-6 w-3/4 bg-gray-800/50 rounded"></div>
                            <div className="h-4 w-1/2 bg-gray-800/50 rounded"></div>
                            <div className="flex gap-3 justify-center pt-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-800/50"></div>
                                <div className="w-8 h-8 rounded-lg bg-gray-800/50"></div>
                                <div className="w-8 h-8 rounded-lg bg-gray-800/50"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
