"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { getGalleryPhotos } from "@/app/actions/gallery";
import { useSiteContent } from "@/lib/useSiteContent";

interface GalleryItem {
    id: string;
    title: string;
    event: string;
    image: string;
}

const GalleryCard = ({ item }: { item: GalleryItem }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="w-[320px] h-[220px] rounded-lg overflow-hidden relative group flex-shrink-0 isolate bg-surface/80 border border-white/5">
            {/* Shimmer Placeholder */}
            {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-900 overflow-hidden">
                    <div 
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                    />
                </div>
            )}
            
            <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="320px"
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                    imageLoaded ? 'opacity-80 group-hover:opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-display font-light text-white tracking-tight mb-1">{item.title}</h3>
                    <p className="text-white/60 font-mono text-xs tracking-wider uppercase">{item.event}</p>
                </div>
            </div>
        </div>
    );
};

const Row = ({ items, speed = 20, reverse = false, offset = 0, className = "" }: { items: GalleryItem[], speed?: number, reverse?: boolean, offset?: number, className?: string }) => {
    const effectiveOffset = items.length > 0 ? offset % items.length : 0;
    const rotatedImages = items.length > 0
        ? [...items.slice(effectiveOffset), ...items.slice(0, effectiveOffset)]
        : [];

    if (rotatedImages.length === 0) return null;

    // Only duplicate once for seamless -50% loop
    const displayItems = rotatedImages.concat(rotatedImages);

    return (
        <div className={`w-full overflow-hidden ${className}`}>
            <div
                className={`flex gap-6 min-w-max will-change-transform ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
                style={{ animationDuration: `${speed}s` }}
            >
                {displayItems.map((item, i) => (
                    <GalleryCard key={i} item={item} />
                ))}
            </div>
        </div>
    );
};

const TiltedScrollSkeleton = () => {
    return (
        <div className="w-full max-w-none space-y-8 opacity-40">
            {/* Row 1 */}
            <div className="flex gap-6 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-[320px] h-[220px] bg-gray-900 border border-white/5 rounded-lg shrink-0 overflow-hidden relative">
                        <div 
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                        />
                    </div>
                ))}
            </div>
            {/* Row 2 */}
            <div className="flex gap-6 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-[320px] h-[220px] bg-gray-900 border border-white/5 rounded-lg shrink-0 overflow-hidden relative">
                        <div 
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                        />
                    </div>
                ))}
            </div>
            {/* Row 3 */}
            <div className="flex gap-6 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-[320px] h-[220px] bg-gray-900 border border-white/5 rounded-lg shrink-0 overflow-hidden relative">
                        <div 
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export function TiltedScroll() {
    const [row1Items, setRow1Items] = useState<GalleryItem[]>([]);
    const [row2Items, setRow2Items] = useState<GalleryItem[]>([]);
    const [row3Items, setRow3Items] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const { content: siteContent } = useSiteContent();
    const sectionContent = siteContent.gallery || { title: "Community\nGallery" };

    useEffect(() => {
        let retries = 3;
        let active = true;

        const fetchDatabaseGallery = async () => {
            try {
                const result = await getGalleryPhotos();
                if (!active) return;
                const formattedItems = Array.isArray(result) ? result : [];

                if (formattedItems.length > 0) {
                    const chunkSize = Math.max(1, Math.floor(formattedItems.length / 3));

                    if (formattedItems.length >= 3) {
                        setRow1Items(formattedItems.slice(0, chunkSize));
                        setRow2Items(formattedItems.slice(chunkSize, chunkSize * 2));
                        setRow3Items(formattedItems.slice(chunkSize * 2));
                    } else {
                        setRow1Items(formattedItems);
                        setRow2Items([...formattedItems].reverse());
                        setRow3Items(formattedItems);
                    }
                    setError(null);
                    setIsLoading(false);
                } else {
                    throw new Error("No gallery items found");
                }
            } catch (err) {
                console.error("Error loading gallery photos:", err);
                if (retries > 0) {
                    retries--;
                    setTimeout(() => {
                        if (active) fetchDatabaseGallery();
                    }, 2000);
                } else {
                    if (active) {
                        setError("Failed to load gallery photos");
                        setIsLoading(false);
                    }
                }
            }
        };

        fetchDatabaseGallery();

        return () => {
            active = false;
        };
    }, []);

    return (
        <section ref={sectionRef} className="relative overflow-hidden py-20 flex flex-col justify-center items-center min-h-screen" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 100vh' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

            {isLoading ? (
                <TiltedScrollSkeleton />
            ) : error ? (
                <div className="text-center py-10 z-20">
                    <p className="text-red-500 font-mono">{error}</p>
                </div>
            ) : (
                <>
                    <div className="w-full max-w-none space-y-8">
                        <Row items={row1Items} speed={30} offset={0} />
                        <Row items={row2Items} speed={35} offset={0} reverse />
                        <Row items={row3Items} speed={40} offset={0} />
                    </div>

                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                        <h2 className="text-5xl md:text-8xl font-display font-light text-white opacity-20 tracking-tight text-center pointer-events-none whitespace-pre-line">
                            {sectionContent.title}
                        </h2>
                    </div>
                </>
            )}
        </section>
    );
}
