"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

const galleryImages = [
    { id: 1, title: "HackDay CEV", event: "Hackathon 2023", image: "/hackday-cev-2023.jpg" },
    { id: 2, title: "HackDay CEV", event: "Hackathon 2023", image: "/hackday-cev-2023.jpg" },
    { id: 3, title: "HackDay CEV", event: "Hackathon 2023", image: "/hackday-cev-2023.jpg" },
    { id: 4, title: "HackDay CEV", event: "Hackathon 2023", image: "/hackday-cev-2023.jpg" },
    { id: 5, title: "HackDay CEV", event: "Hackathon 2023", image: "/hackday-cev-2023.jpg" },
    { id: 6, title: "HackDay CEV", event: "Hackathon 2023", image: "/hackday-cev-2023.jpg" },
];


const Row = ({ speed = 20, reverse = false, className = "" }: { speed?: number, reverse?: boolean, className?: string }) => {
    return (
        <div className={`w-full overflow-hidden ${className}`}>
            <div className={`flex gap-6 min-w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`} style={{ animationDuration: `${speed}s` }}>
                {galleryImages.concat(galleryImages).concat(galleryImages).map((item, i) => (
                    <div key={i} className="w-[300px] h-[200px] bg-surface border border-white/10 rounded-xl overflow-hidden relative group transition-all duration-300 hover:border-primary flex-shrink-0 hover:scale-105">
                        {/* Image */}
                        <div className="absolute inset-0">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
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

                        {/* Bottom label always visible */}
                        <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-primary font-mono text-xs">EVENT_0{item.id}</p>
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
        <section className="relative bg-background overflow-hidden py-20 flex flex-col justify-center items-center min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />

            <div className="w-full max-w-none">
                <Row speed={15} className="mb-8" />
                <Row speed={15} reverse className="mb-8" />
                <Row speed={15} className="mb-8" />
            </div>

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                <h2 className="text-6xl md:text-9xl font-display font-black text-white mix-blend-overlay uppercase tracking-tighter text-center">
                    Community<br />Highlights
                </h2>
            </div>
        </section>
    );
}
