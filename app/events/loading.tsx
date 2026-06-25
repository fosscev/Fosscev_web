"use client";

import { Navbar } from "@/components/Navbar";

export default function EventsSkeleton() {
    return (
        <div className="relative min-h-screen text-white selection:bg-primary selection:text-black overflow-hidden">
            <div className="relative z-10">
                <Navbar />

                <main className="pt-24 pb-10">
                    {/* Hero Section Skeleton */}
                    <div className="max-w-7xl mx-auto px-4 mb-16">
                        <div className="text-center flex flex-col items-center">
                            {/* Title Skeleton */}
                            <div className="h-16 w-3/4 md:w-1/2 bg-white/5 rounded-lg animate-pulse mb-6 border border-white/10"></div>

                            {/* Description Skeletons */}
                            <div className="h-5 w-full md:w-2/3 bg-white/5 rounded animate-pulse mb-3"></div>
                            <div className="h-5 w-5/6 md:w-1/2 bg-white/5 rounded animate-pulse mb-8"></div>

                            {/* Buttons Skeleton */}
                            <div className="flex justify-center gap-4">
                                <div className="h-12 w-40 bg-white/10 rounded-lg animate-pulse border border-white/5"></div>
                                <div className="h-12 w-40 bg-white/5 rounded-lg animate-pulse border border-white/5"></div>
                            </div>
                        </div>
                    </div>

                    {/* Events Grid Skeleton */}
                    <div className="max-w-7xl mx-auto px-4 mb-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {[1, 2, 3, 4].map((i) => {
                                return (
                                    <div key={i} className="relative">
                                        <div className="bg-surface/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 h-full flex flex-col">
                                            {/* Image Placeholder */}
                                            <div className="h-48 md:h-56 bg-white/5 animate-pulse relative overflow-hidden shrink-0">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[scan_2s_ease-in-out_infinite]"></div>
                                            </div>

                                            {/* Info Section Skeleton */}
                                            <div className="p-4 md:p-6 border-t border-white/5 flex flex-col flex-1 space-y-4">
                                                {/* Title */}
                                                <div>
                                                    <div className="h-7 w-3/4 bg-white/5 rounded animate-pulse mb-2"></div>
                                                    <div className="h-7 w-1/2 bg-white/5 rounded animate-pulse"></div>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-2.5">
                                                    {[1, 2, 3, 4].map((j) => (
                                                        <div key={j} className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded bg-white/10 animate-pulse shrink-0"></div>
                                                            <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse"></div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Description */}
                                                <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
                                                    <div className="h-2.5 w-full bg-white/5 rounded animate-pulse"></div>
                                                    <div className="h-2.5 w-5/6 bg-white/5 rounded animate-pulse"></div>
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
