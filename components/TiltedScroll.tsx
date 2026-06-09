"use client";

import { useEffect, useState, useRef } from "react";
import { getGalleryPhotos } from "@/app/actions/gallery";
import { useSiteContent } from "@/lib/useSiteContent";

interface GalleryItem {
    id: string;
    title: string;
    event: string;
    image: string;
}

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
                    <div key={i} className="w-[320px] h-[220px] rounded-lg overflow-hidden relative group flex-shrink-0 isolate">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-xl font-display font-light text-white tracking-tight mb-1">{item.title}</h3>
                                <p className="text-white/60 font-mono text-xs tracking-wider uppercase">{item.event}</p>
                            </div>
                        </div>
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
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const { content: siteContent } = useSiteContent();
    const sectionContent = siteContent.gallery || { title: "Community\nGallery" };

    // Only render heavy content when section is near viewport
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Start loading 200px before visible
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const fetchDatabaseGallery = async () => {
            try {
                const result = await getGalleryPhotos();
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
                }
            } catch (error) {
                console.error("Error loading gallery photos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDatabaseGallery();
    }, [isVisible]);

    return (
        <section ref={sectionRef} className="relative overflow-hidden py-20 flex flex-col justify-center items-center min-h-screen" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 100vh' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

            {!isVisible || isLoading ? (
                <div className="w-full max-w-none opacity-20">
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[320px] h-[220px] bg-gray-800/50 border border-primary/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[320px] h-[220px] bg-gray-800/50 border border-primary/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[320px] h-[220px] bg-gray-800/50 border border-primary/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
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
