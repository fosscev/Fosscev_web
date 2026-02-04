"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

const galleryImages = [
    { id: 1, title: "SIT & GIT", event: "FOSS CEV 2025", image: "/WhatsApp Image 2026-01-28 at 5.47.34 PM.jpeg" },
    { id: 2, title: "HackDay 2026", event: "FOSS CEV 2026", image: "/WhatsApp Image 2026-01-28 at 6.53.47 PM.jpeg" },
    { id: 3, title: "HackDay 2026", event: "FOSS CEV 2026", image: "/WhatsApp Image 2026-01-28 at 6.57.34 PM.jpeg" },
    { id: 4, title: "HackDay 2026", event: "FOSS CEV 2026", image: "/WhatsApp Image 2026-01-28 at 6.57.54 PM.jpeg" },
    { id: 5, title: "Linux Installation", event: "FOSS CEV 2025", image: "/WhatsApp Image 2026-01-28 at 7.00.34 PM.jpeg" },
    { id: 6, title: "SIT & GIT", event: "FOSS CEV 2025", image: "/WhatsApp Image 2026-01-28 at 7.06.03 PM.jpeg" },
    { id: 7, title: "HackDay CEV", event: "Hackathon 2023", image: "/hackday-cev-2023.jpg" },
];


const Row = ({ speed = 20, reverse = false, offset = 0, className = "" }: { speed?: number, reverse?: boolean, offset?: number, className?: string }) => {
    // Create a rotated array based on offset to show different images in each row
    const rotatedImages = [...galleryImages.slice(offset), ...galleryImages.slice(0, offset)];

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

export function TiltedScroll() {
    return (
        <section className="relative overflow-hidden py-20 flex flex-col justify-center items-center min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

            <div className="w-full max-w-none">
                <Row speed={15} offset={0} className="mb-8" />
                <Row speed={15} offset={2} reverse className="mb-8" />
                <Row speed={15} offset={4} className="mb-8" />
            </div>

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                <h2 className="text-6xl md:text-9xl font-display font-black text-white mix-blend-overlay uppercase tracking-tighter text-center">
                    Community<br />Highlights
                </h2>
            </div>
        </section>
    );
}

