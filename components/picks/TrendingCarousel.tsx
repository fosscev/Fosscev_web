export function TrendingCarousel() {
    const trendingItems = [
        { id: 1, title: "OpenAI & SpaceX Lead The IPO Boom" },
        { id: 2, title: "Apple's Next Play: iOS 27 Leaks & Advanced Siri Subscriptions" },
        { id: 3, title: "UK Proposes Social Media Ban For Under-16s" },
        { id: 4, title: "Tech Giants Warn Against \"Frontier AI Monopolies\"" },
        { id: 5, title: "Microsoft Considers Xbox Spin-Of" }
    ];

    return (
        <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-white">Trending Today</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {trendingItems.map((item) => (
                    <div 
                        key={item.id} 
                        className="snap-start flex-shrink-0 w-48 h-48 border border-white/30 rounded-2xl p-4 flex flex-col justify-end bg-gradient-to-t from-black/40 to-transparent hover:border-[#00e676] transition-colors cursor-pointer"
                    >
                        <h3 className="text-sm font-bold text-white line-clamp-3 leading-snug">
                            {item.title}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
