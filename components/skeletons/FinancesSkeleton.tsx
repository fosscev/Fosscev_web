"use client";

export function FinancesSkeleton() {
    return (
        <div className="animate-pulse space-y-6 w-full">
            {[1, 2].map((i) => (
                <div key={i} className="bg-surface/40 border border-white/5 rounded-2xl p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                        <div>
                            <div className="h-8 w-64 bg-white/5 rounded-md mb-3"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-white/10 shrink-0"></div>
                                <div className="h-4 w-32 bg-white/5 rounded"></div>
                            </div>
                        </div>
                        <div className="h-10 w-36 bg-white/5 rounded-full shrink-0"></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="bg-black/30 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-4 h-4 rounded bg-white/10 shrink-0"></div>
                                    <div className="h-4 w-24 bg-white/5 rounded"></div>
                                </div>
                                <div className="h-8 w-32 bg-white/5 rounded"></div>
                            </div>
                        ))}
                    </div>

                    {/* Breakdown Tables */}
                    <div className="mt-8 border-t border-white/10 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map((tableIndex) => (
                            <div key={`table-${tableIndex}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-4 h-4 rounded bg-white/10 shrink-0"></div>
                                    <div className="h-6 w-40 bg-white/5 rounded"></div>
                                </div>
                                <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                    <div className="h-10 bg-black/40 border-b border-white/5"></div>
                                    <div className="divide-y divide-white/5">
                                        {[1, 2, 3].map((row) => (
                                            <div key={`row-${row}`} className="h-12 flex items-center justify-between px-4">
                                                <div className="h-4 w-1/3 bg-white/5 rounded"></div>
                                                <div className="h-4 w-1/4 bg-white/5 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
