"use client";

export function TeamSkeleton() {
    return (
        <div className="w-full">
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="relative bg-surface border border-white/10 rounded-xl overflow-hidden h-[420px] opacity-40">
                        {/* Image Placeholder */}
                        <div className="aspect-square bg-gray-900 relative overflow-hidden">
                            <div 
                                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                            />
                        </div>

                        {/* Content Placeholder */}
                        <div className="p-6 border-t border-white/5 space-y-4">
                            {/* Name Skeleton */}
                            <div className="h-6 w-3/4 bg-gray-800 rounded relative overflow-hidden">
                                <div 
                                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                    style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                                />
                            </div>
                            {/* Designation Skeleton */}
                            <div className="h-4 w-1/2 bg-gray-800 rounded relative overflow-hidden">
                                <div 
                                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                    style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                                />
                            </div>
                            {/* Social Icons Skeleton */}
                            <div className="flex gap-3 justify-center pt-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 relative overflow-hidden">
                                    <div 
                                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                        style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                                    />
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-gray-800 relative overflow-hidden">
                                    <div 
                                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                        style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                                    />
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-gray-800 relative overflow-hidden">
                                    <div 
                                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                        style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
