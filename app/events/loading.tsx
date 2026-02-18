"use client";

import { Navbar } from "@/components/Navbar";

export default function EventsSkeleton() {
    return (
        <div className="relative min-h-screen bg-background text-white selection:bg-primary selection:text-black overflow-hidden">
            {/* Background (Same as page.tsx) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 hacker-grid opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at center, rgba(0, 230, 118, 0.15) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 20px 20px'
                }}></div>
            </div>

            <div className="relative z-10">
                <Navbar />

                <main className="pt-24 pb-10">
                    {/* Hero Section Skeleton */}
                    <div className="max-w-7xl mx-auto px-4 mb-16">
                        <div className="text-center flex flex-col items-center">
                            {/* Title Skeleton */}
                            <div className="h-16 w-3/4 md:w-1/2 bg-gray-800/50 rounded-lg animate-pulse mb-6 border border-white/5"></div>

                            {/* Description Skeletons */}
                            <div className="h-4 w-full md:w-2/3 bg-gray-800/50 rounded animate-pulse mb-3 border border-white/5"></div>
                            <div className="h-4 w-5/6 md:w-1/2 bg-gray-800/50 rounded animate-pulse mb-8 border border-white/5"></div>

                            {/* Buttons Skeleton */}
                            <div className="flex justify-center gap-4">
                                <div className="h-12 w-40 bg-gray-800/50 rounded-lg animate-pulse border border-white/5"></div>
                                <div className="h-12 w-40 bg-gray-800/50 rounded-lg animate-pulse border border-white/5"></div>
                            </div>
                        </div>
                    </div>

                    {/* Events Grid Skeleton */}
                    <div className="max-w-7xl mx-auto px-4 mb-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {[1, 2, 3, 4].map((i) => {
                                // Mimic rotation for consistency
                                const rotations = ['md:-rotate-2', 'md:rotate-1', 'md:-rotate-1', 'md:rotate-2'];
                                const rotation = rotations[i % rotations.length];

                                return (
                                    <div
                                        key={i}
                                        className={`relative ${rotation} transition-all duration-300`}
                                        style={{ transformOrigin: 'top center' }}
                                    >
                                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-2xl overflow-hidden border border-white/10">
                                            {/* Pin Skeleton */}
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                                <div className="relative w-6 h-6 rounded-full bg-gray-800 border-2 border-white/10"></div>
                                            </div>

                                            {/* Image Placeholder */}
                                            <div className="h-48 md:h-56 bg-gray-800/50 animate-pulse relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-scan"></div>
                                            </div>

                                            {/* Info Section Skeleton */}
                                            <div className="p-3 md:p-4 pb-4 md:pb-6 border-t border-white/5 space-y-3">
                                                {/* Title */}
                                                <div className="h-6 w-3/4 bg-gray-800/50 rounded animate-pulse"></div>
                                                <div className="h-6 w-1/2 bg-gray-800/50 rounded animate-pulse mb-4"></div>

                                                {/* Details */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-gray-800/50 animate-pulse"></div>
                                                        <div className="h-3 w-1/3 bg-gray-800/50 rounded animate-pulse"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-gray-800/50 animate-pulse"></div>
                                                        <div className="h-3 w-1/4 bg-gray-800/50 rounded animate-pulse"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-gray-800/50 animate-pulse"></div>
                                                        <div className="h-3 w-1/2 bg-gray-800/50 rounded animate-pulse"></div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                                                    <div className="h-2 w-full bg-gray-800/50 rounded animate-pulse"></div>
                                                    <div className="h-2 w-5/6 bg-gray-800/50 rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export { EventsSkeleton };
