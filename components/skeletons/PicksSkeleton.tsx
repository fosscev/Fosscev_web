"use client";

export function PicksSkeleton() {
    return (
        <div className="animate-pulse space-y-4 w-full">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 bg-[#0a0a0a]/80 border border-white/[0.06] rounded-xl p-4">
                    {/* Left column: Avatar + Vote buttons */}
                    <div className="flex flex-col items-center gap-3.5 flex-shrink-0 pt-1">
                        <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0"></div>
                        <div className="w-8 h-16 rounded-md bg-white/5 shrink-0"></div>
                    </div>

                    {/* Right column: Content */}
                    <div className="flex-1 min-w-0 py-1">
                        {/* Flair + Tool Name */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-5 w-16 bg-white/10 rounded"></div>
                            <div className="h-4 w-24 bg-white/5 rounded"></div>
                        </div>

                        {/* Title */}
                        <div className="h-6 w-3/4 bg-white/10 rounded mb-2"></div>

                        {/* Description */}
                        <div className="space-y-2 mb-4">
                            <div className="h-4 w-full bg-white/5 rounded"></div>
                            <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-4 rounded-full bg-white/10 shrink-0"></div>
                            <div className="h-3 w-16 bg-white/5 rounded"></div>
                            <div className="h-3 w-3 bg-white/5 rounded-full shrink-0"></div>
                            <div className="h-3 w-12 bg-white/5 rounded"></div>
                            <div className="h-3 w-3 bg-white/5 rounded-full shrink-0"></div>
                            <div className="h-3 w-16 bg-white/5 rounded"></div>
                        </div>

                        {/* Actions row */}
                        <div className="flex gap-4">
                            <div className="h-6 w-20 bg-white/5 rounded-md"></div>
                            <div className="h-6 w-20 bg-white/5 rounded-md"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
