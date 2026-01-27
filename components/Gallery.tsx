"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const galleryImages = [
    { id: 1, title: "Linux Installation Party", event: "Workshop 2024", image: "/gallery/event1.jpg" },
    { id: 2, title: "HackDay CEV", event: "Hackathon 2024", image: "/gallery/event2.jpg" },
    { id: 3, title: "Git Workshop", event: "Learning Session", image: "/gallery/event3.jpg" },
    { id: 4, title: "Community Meetup", event: "Networking", image: "/gallery/event4.jpg" },
    { id: 5, title: "FOSS Talk", event: "Guest Speaker", image: "/gallery/event5.jpg" },
    { id: 6, title: "Code Sprint", event: "Contribution Day", image: "/gallery/event6.jpg" },
];

export function Gallery() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-background">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <h2 className="absolute top-10 left-10 text-4xl md:text-6xl font-display font-bold text-white z-20 tracking-tighter uppercase mix-blend-difference">
                    Gallery_
                </h2>
                <motion.div style={{ x }} className="flex gap-10 pl-10 pr-10">
                    {galleryImages.map((item) => (
                        <div
                            key={item.id}
                            className="group relative h-[60vh] w-[400px] md:w-[500px] shrink-0 overflow-hidden bg-surface border border-white/10 rounded-xl grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105"
                        >
                            {/* Image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 400px, 500px"
                                    onError={(e) => {
                                        // Fallback to placeholder if image doesn't exist
                                        const target = e.target as HTMLElement;
                                        target.style.display = 'none';
                                    }}
                                />
                                {/* Fallback placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center bg-white/5 group-hover:bg-primary/5 transition-colors">
                                    <span className="font-display text-9xl text-white/10 font-bold group-hover:text-primary/20">{item.id}</span>
                                </div>
                            </div>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 w-full p-6">
                                    <p className="text-primary font-mono text-sm mb-2">{item.event}</p>
                                    <h4 className="text-white font-bold text-2xl">{item.title}</h4>
                                </div>
                            </div>

                            {/* Glowing border effect on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(0,230,118,0.3)]"></div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
