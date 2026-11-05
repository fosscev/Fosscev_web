"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import { getComputedEventStatus } from "@/lib/event-utils";
import { getSupabaseImageUrl } from "@/lib/image-utils";

export function Tracks() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { content: siteContent } = useSiteContent();
    const sectionContent = siteContent.activities || { title: "Activities" };

    useEffect(() => {
        const loadPhotos = async () => {
            let data: any[] = [];
            try {
                const response = await fetch('/api/data/events');
                const payload = response.ok ? await response.json() : null;
                data = [...(payload?.upcoming || []), ...(payload?.past || [])];
            } catch (error) {
                console.error('Failed to load event cards:', error);
            }

            const classNames = [
                "md:col-span-2 md:row-span-2",
                "md:col-span-2 md:row-span-1",
                "md:col-span-1 md:row-span-1",
                "md:col-span-1 md:row-span-1"
            ];

            if (data.length > 0) {
                const formattedItems = data.slice(0, 4).map((event, index) => {
                    const year = event.date ? new Date(event.date).getFullYear() : "2025";
                    return {
                        id: event.id,
                        title: event.title,
                        event: `${event.type} ${year}`,
                        status: getComputedEventStatus(event),
                        imageUrl: getSupabaseImageUrl(event.poster_url || event.image_url, '/placeholder.jpg', { width: 1200, height: 1600, quality: 85 }),
                        className: classNames[index] || "md:col-span-1 md:row-span-1",
                        isPlaceholder: false
                    };
                });

                while (formattedItems.length < 4) {
                    const idx = formattedItems.length;
                    formattedItems.push({
                        id: `placeholder-${idx}`,
                        title: "Event Coming Soon",
                        event: "Stay Tuned",
                        status: "Registration Open",
                        imageUrl: "/placeholder.jpg",
                        className: classNames[idx],
                        isPlaceholder: true
                    });
                }

                setItems(formattedItems);
            } else {
                // Fallback if no events in db
                const placeholders = classNames.map((className, idx) => ({
                    id: `placeholder-${idx}`,
                    title: "Event Coming Soon",
                    event: "Stay Tuned",
                    status: "Registration Open",
                    imageUrl: "/placeholder.jpg",
                    className,
                    isPlaceholder: true
                }));
                setItems(placeholders);
            }

            setIsLoading(false);
        };

        loadPhotos();
    }, []);

    return (
        <section className="py-24 relative max-w-7xl mx-auto px-4 z-10 w-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-16"
            >
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-light text-white tracking-tight">
                    {sectionContent.title}
                </h2>
                <div className="w-12 h-px bg-white/20 mt-6"></div>
            </motion.div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 md:auto-rows-[300px] max-md:auto-rows-[300px] opacity-20">
                    <div className="md:col-span-2 md:row-span-2 bg-gray-800/50 rounded-2xl animate-pulse"></div>
                    <div className="md:col-span-2 md:row-span-1 bg-gray-800/50 rounded-2xl animate-pulse"></div>
                    <div className="md:col-span-1 md:row-span-1 bg-gray-800/50 rounded-2xl animate-pulse"></div>
                    <div className="md:col-span-1 md:row-span-1 bg-gray-800/50 rounded-2xl animate-pulse"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {items.map((item, i) => {
                        const cardContent = (
                            <div className="flex h-full w-full flex-col">
                                <div className="relative aspect-[3/4] w-full shrink-0 bg-black/40">
                                    <div className="absolute inset-0 bg-white/[0.02]">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    </div>

                                    {(item.status === 'Registration Open' || item.status === 'Event Ongoing') && (
                                    <div className="absolute left-3 top-3 z-20">
                                        <div className="relative flex items-center gap-2">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                            </span>
                                            <span className="px-3 py-1 bg-black/70 rounded-full text-xs font-mono text-primary font-bold border border-primary/30 shadow-lg">
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col justify-center border-t border-white/10 bg-surface/60 p-4 sm:p-5">
                                    <h3 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">{item.title}</h3>
                                    <p className="mt-2 text-gray-400 font-mono text-xs tracking-wider uppercase">{item.event}</p>
                                </div>
                            </div>
                        );

                        return item.isPlaceholder ? (
                            <div key={i} className={`relative rounded-2xl overflow-hidden group block cursor-default`}>
                                {cardContent}
                            </div>
                        ) : (
                            <Link key={i} href={`/events/${item.id}`} className="relative rounded-2xl overflow-hidden group block cursor-pointer">
                                {cardContent}
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
