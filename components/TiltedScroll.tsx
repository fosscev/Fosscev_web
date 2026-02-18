"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface GalleryItem {
    id: string;
    title: string;
    event: string;
    image: string;
}

const Row = ({ items, speed = 20, reverse = false, offset = 0, className = "" }: { items: GalleryItem[], speed?: number, reverse?: boolean, offset?: number, className?: string }) => {
    // Create a rotated array based on offset to show different images in each row
    // Ensure we handle cases where offset > items.length
    const effectiveOffset = items.length > 0 ? offset % items.length : 0;
    const rotatedImages = items.length > 0
        ? [...items.slice(effectiveOffset), ...items.slice(0, effectiveOffset)]
        : [];

    if (rotatedImages.length === 0) return null;

    return (
        <div className={`w-full overflow-hidden ${className}`}>
            <div className={`flex gap-6 min-w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`} style={{ animationDuration: `${speed}s` }}>
                {rotatedImages.concat(rotatedImages).concat(rotatedImages).map((item, i) => (
                    <div key={i} className="w-[300px] h-[200px] bg-surface border border-white/10 rounded-xl overflow-hidden relative group transition-all duration-300 hover:border-primary flex-shrink-0 hover:scale-105">
                        {/* Image */}
                        <div className="absolute inset-0">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-all duration-500"
                                sizes="300px"
                                onError={(e) => {
                                    // Fallback to gradient if image doesn't exist
                                    const target = e.target as HTMLElement;
                                    target.style.display = 'none';
                                }}
                            />
                            {/* Fallback gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20 opacity-50 group-hover:opacity-30 transition-opacity"></div>
                        </div>

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                <h3 className="text-lg font-display font-bold text-white uppercase mb-2">{item.title}</h3>
                                <p className="text-primary font-mono text-sm">{item.event}</p>
                            </div>
                        </div>

                        {/* Glowing border on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.4)]"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Hardcoded list of specific highlight photos from the original design
// These should be in the 'event-photos' bucket if setup script ran
const highlightPhotos = [
    { id: '1', title: "SIT & GIT", event: "FOSS CEV 2025", image: "Sit&git_1.jpeg" },
    { id: '2', title: "HackDay 2026", event: "FOSS CEV 2026", image: "Hackday_1.jpeg" },
    { id: '3', title: "HackDay 2026", event: "FOSS CEV 2026", image: "hackday_2.jpeg" },
    { id: '4', title: "HackDay 2026", event: "FOSS CEV 2026", image: "hackday_3.jpeg" },
    { id: '5', title: "Linux Installation", event: "FOSS CEV 2025", image: "Linuxinstall.jpeg" },
    { id: '6', title: "SIT & GIT", event: "FOSS CEV 2025", image: "Sit&git_2.jpeg" },
    // hackday-cev-2026.jpg is a poster but was in original gallery, keeping it if desired or omitting
];

export function TiltedScroll() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Construct public URLs for the highlight photos
        const loadHighlightPhotos = () => {
            const formattedItems = highlightPhotos.map(photo => {
                const { data } = supabase.storage
                    .from('event-photos')
                    .getPublicUrl(photo.image);

                return {
                    id: photo.id,
                    title: photo.title,
                    event: photo.event,
                    image: data.publicUrl
                };
            });
            setItems(formattedItems);
            setIsLoading(false);
        };

        loadHighlightPhotos();
    }, []);

    if (isLoading) {
        return (
            <section className="relative overflow-hidden py-20 flex flex-col justify-center items-center min-h-screen">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

                <div className="w-full max-w-none opacity-20">
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[300px] h-[200px] bg-gray-800/50 border border-white/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[300px] h-[200px] bg-gray-800/50 border border-white/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[300px] h-[200px] bg-gray-800/50 border border-white/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
                </div>

                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                    <div className="h-24 w-3/4 max-w-2xl bg-gray-800/50 rounded-lg animate-pulse border border-white/5"></div>
                </div>
            </section>
        );
    }
    if (items.length === 0) return null;

    return (
        <section className="relative overflow-hidden py-20 flex flex-col justify-center items-center min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

            <div className="w-full max-w-none">
                <Row items={items} speed={30} offset={0} className="mb-8" />
                <Row items={items} speed={35} offset={2} reverse className="mb-8" />
                <Row items={items} speed={40} offset={4} className="mb-8" />
            </div>

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                <h2 className="text-6xl md:text-9xl font-display font-black text-white mix-blend-overlay uppercase tracking-tighter text-center">
                    Community<br />Highlights
                </h2>
            </div>
        </section>
    );
}

