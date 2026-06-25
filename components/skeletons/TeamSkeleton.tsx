"use client";

export function TeamSkeleton() {
    return (
        <div className="animate-pulse w-full">
            {/* Faculty Advisors Header Skeleton */}
            <div className="mb-12 text-center max-w-4xl mx-auto px-4 mt-12">
                <div className="h-16 w-3/4 md:w-1/2 mx-auto bg-white/5 rounded-lg mb-4 border border-white/10"></div>
                <div className="h-4 w-1/3 mx-auto bg-white/5 rounded mb-4"></div>
                <div className="h-4 w-1/2 mx-auto bg-white/5 rounded"></div>
            </div>

            {/* Faculty Grid Skeleton */}
            <div className="flex justify-center gap-8 flex-wrap mb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {[...Array(2)].map((_, i) => (
                    <div key={`faculty-${i}`} className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.33%-21px)] max-w-[320px]">
                        <div className="relative bg-surface/40 border border-white/5 rounded-xl overflow-hidden h-[380px]">
                            {/* Image Placeholder */}
                            <div className="aspect-square bg-white/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[scan_2s_ease-in-out_infinite]"></div>
                            </div>

                            {/* Content Placeholder */}
                            <div className="p-6 border-t border-white/5 space-y-4 bg-surface/90">
                                <div className="h-6 w-3/4 bg-white/5 rounded"></div>
                                <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                                <div className="h-px w-full bg-white/5 mb-4 mt-4"></div>
                                <div className="flex gap-3 justify-center">
                                    <div className="w-9 h-9 rounded-lg bg-white/5"></div>
                                    <div className="w-9 h-9 rounded-lg bg-white/5"></div>
                                    <div className="w-9 h-9 rounded-lg bg-white/5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Core Team Header Skeleton */}
            <div className="mb-16 text-center max-w-4xl mx-auto px-4">
                <div className="h-20 w-3/4 md:w-1/2 mx-auto bg-white/5 rounded-lg mb-6 border border-white/10"></div>
                <div className="h-6 w-1/3 mx-auto bg-white/5 rounded mb-6"></div>
                <div className="h-4 w-1/2 mx-auto bg-white/5 rounded"></div>
            </div>

            {/* Core Team Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {[...Array(8)].map((_, i) => (
                    <div key={`core-${i}`} className="relative bg-surface/40 border border-white/5 rounded-xl overflow-hidden h-[380px]">
                        {/* Image Placeholder */}
                        <div className="aspect-square bg-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>

                        {/* Content Placeholder */}
                        <div className="p-6 border-t border-white/5 space-y-4 bg-surface/90">
                            <div className="h-6 w-3/4 bg-white/5 rounded"></div>
                            <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                            <div className="h-px w-full bg-white/5 mb-4 mt-4"></div>
                            <div className="flex gap-3 justify-center">
                                <div className="w-9 h-9 rounded-lg bg-white/5"></div>
                                <div className="w-9 h-9 rounded-lg bg-white/5"></div>
                                <div className="w-9 h-9 rounded-lg bg-white/5"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
