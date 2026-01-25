"use client";

import { useRef, useEffect, useState } from "react";

const items = [
    { id: 1, text: "Hackathon 2023", color: "bg-purple-500" },
    { id: 2, text: "Linux Workshop", color: "bg-blue-500" },
    { id: 3, text: "FOSS Meetup", color: "bg-green-500" },
    { id: 4, text: "Git Training", color: "bg-red-500" },
    { id: 5, text: "Web Dev Sprint", color: "bg-yellow-500" },
    { id: 6, text: "AI Summit", color: "bg-pink-500" },
    { id: 7, text: "Cyber Security", color: "bg-indigo-500" },
    { id: 8, text: "Cloud Native", color: "bg-orange-500" },
];

const Row = ({ speed = 20, reverse = false, className = "" }: { speed?: number, reverse?: boolean, className?: string }) => {
    return (
        <div className={`w-full overflow-hidden ${className}`}>
            <div className={`flex gap-6 min-w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`} style={{ animationDuration: `${speed}s` }}>
                {items.concat(items).concat(items).map((item, i) => (
                    <div key={i} className="w-[300px] h-[200px] bg-surface border border-white/10 rounded-xl overflow-hidden relative group transition-all duration-300 hover:border-primary flex-shrink-0">
                        <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity ${item.color}`} />
                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                            <h3 className="text-xl font-display font-bold text-white uppercase">{item.text}</h3>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                            <p className="text-primary font-mono text-sm">EVENT_0{item.id}</p>
                        </div>
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
