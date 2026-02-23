"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getEvents } from "@/lib/api/events";

export function Tracks() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPhotos = async () => {
            const { data, error } = await getEvents();

            const classNames = [
                "md:col-span-2 md:row-span-2",
                "md:col-span-2 md:row-span-1",
                "md:col-span-1 md:row-span-1",
                "md:col-span-1 md:row-span-1"
            ];

            if (data && data.length > 0) {
                const formattedItems = data.slice(0, 4).map((event, index) => {
                    const year = event.date ? new Date(event.date).getFullYear() : "2025";
                    return {
                        id: event.id,
                        title: event.title,
                        event: `${event.type} ${year}`,
                        status: event.status,
                        imageUrl: event.poster_url || event.image_url || '/placeholder.jpg',
                        className: classNames[index] || "md:col-span-1 md:row-span-1"
                    };
                });

                // Pad with placeholders if less than 4 events exist
                while (formattedItems.length < 4) {
                    const idx = formattedItems.length;
                    formattedItems.push({
                        id: `placeholder-${idx}`,
                        title: "Event Coming Soon",
                        event: "Stay Tuned",
                        status: "Upcoming",
                        imageUrl: "/placeholder.jpg",
                        className: classNames[idx]
                    });
                }
                setItems(formattedItems);
            } else {
                // Fallback if no events in db
                const placeholders = classNames.map((className, idx) => ({
                    id: `placeholder-${idx}`,
                    title: "Event Coming Soon",
                    event: "Stay Tuned",
                    status: "Upcoming",
                    imageUrl: "/placeholder.jpg",
                    className
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
                <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
                    Activities
                </h2>
                <div className="w-12 h-px bg-white/20 mt-6"></div>
            </motion.div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px] opacity-20">
                    <div className="md:col-span-2 md:row-span-2 bg-gray-800/50 rounded-2xl animate-pulse"></div>
                    <div className="md:col-span-2 md:row-span-1 bg-gray-800/50 rounded-2xl animate-pulse"></div>
                    <div className="md:col-span-1 md:row-span-1 bg-gray-800/50 rounded-2xl animate-pulse"></div>
                    <div className="md:col-span-1 md:row-span-1 bg-gray-800/50 rounded-2xl animate-pulse"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 md:auto-rows-[300px]">
                    {items.map((item, i) => (
                        <Link href={`/events#${item.id}`} key={i} className={`relative rounded-2xl overflow-hidden group ${item.className} max-md:h-[300px] block`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full w-full"
                            >
                                <div className="absolute inset-0 bg-white/[0.02]">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className={`absolute inset-0 bg-gradient-to-t ${item.status === 'Upcoming' || item.status === 'Registration Open' ? 'from-primary/20' : 'from-black/90'} via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                {(item.status === 'Upcoming' || item.status === 'Registration Open') && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="relative flex items-center gap-2">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                            </span>
                                            <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-mono text-primary font-bold border border-primary/30 shadow-lg">
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
                                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mb-2 drop-shadow-md">{item.title}</h3>
                                    <p className="text-gray-300 font-mono text-xs md:text-sm tracking-wider uppercase drop-shadow">{item.event}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
