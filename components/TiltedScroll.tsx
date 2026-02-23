"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getGalleryPhotos } from "@/app/actions/gallery";

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
                    <div key={i} className="w-[320px] h-[220px] bg-white/[0.02] rounded-lg overflow-hidden relative group transition-all duration-700 flex-shrink-0 hover:scale-[1.02]">
                        {/* Image */}
                        <div className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="320px"
                                onError={(e) => {
                                    const target = e.target as HTMLElement;
                                    target.style.display = 'none';
                                }}
                            />
                        </div>

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
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

    useEffect(() => {
        const fetchDatabaseGallery = async () => {
            try {
                // Fetch photos via server action to natively bypass public Anon RLS listing restrictions 
                const formattedItems = await getGalleryPhotos();

                if (formattedItems && formattedItems.length > 0) {
                    // Distribute distinctly. Ensure no two rows share the same slice index.
                    const chunkSize = Math.max(1, Math.floor(formattedItems.length / 3));

                    // Slice distinct elements to rows
                    if (formattedItems.length >= 3) {
                        setRow1Items(formattedItems.slice(0, chunkSize));
                        setRow2Items(formattedItems.slice(chunkSize, chunkSize * 2));
                        setRow3Items(formattedItems.slice(chunkSize * 2));
                    } else {
                        // Fallback fallback if very few images
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
    }, []);

    if (isLoading) {
        return (
            <section className="relative overflow-hidden py-20 flex flex-col justify-center items-center min-h-screen">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

                <div className="w-full max-w-none opacity-20">
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[300px] h-[200px] bg-gray-800/50 border border-primary/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[300px] h-[200px] bg-gray-800/50 border border-primary/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
                    <div className="flex gap-6 mb-8 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[300px] h-[200px] bg-gray-800/50 border border-primary/10 rounded-xl shrink-0 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden py-20 flex flex-col justify-center items-center min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-none space-y-8"
            >
                <Row items={row1Items} speed={30} offset={0} />
                <Row items={row2Items} speed={35} offset={0} reverse />
                <Row items={row3Items} speed={40} offset={0} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
            >
                <h2 className="text-5xl md:text-8xl font-display font-light text-white opacity-20 mix-blend-overlay tracking-tight text-center pointer-events-none">
                    Community<br />Gallery
                </h2>
            </motion.div>
        </section>
    );
}

