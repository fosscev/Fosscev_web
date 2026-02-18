"use client";

export default function RootLoading() {
    return (
        <div className="relative min-h-screen bg-background text-white selection:bg-primary selection:text-black overflow-hidden">
            {/* Background */}
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
                {/* Navbar Skeleton */}
                <div className="h-16 border-b border-white/10 backdrop-blur-sm flex items-center px-6">
                    <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
                    <div className="ml-auto flex gap-4">
                        <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                    </div>
                </div>

                {/* Hero Skeleton */}
                <div className="flex flex-col items-center justify-center pt-32 pb-20 px-4">
                    <div className="h-12 w-80 bg-white/5 rounded-lg animate-pulse mb-6" />
                    <div className="h-6 w-64 bg-white/5 rounded animate-pulse mb-4" />
                    <div className="h-4 w-96 bg-white/5 rounded animate-pulse mb-12" />

                    {/* Content Skeleton Grid */}
                    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-surface border border-white/10 rounded-xl overflow-hidden"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="h-48 bg-white/5 animate-pulse" />
                                <div className="p-6 space-y-3">
                                    <div className="h-5 w-3/4 bg-white/5 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
                                    <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                                    <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
