"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Hero() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    // Transform scroll progress to X position (horizontal)
    // First line moves left, second line moves right
    const x1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const x2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={targetRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
            {/* Massive Headline with Parallax */}
            <div className="flex-1 flex flex-col justify-center items-center z-10 px-4">
                <div className="relative">
                    {/* First line - moves left on scroll */}
                    <motion.div
                        style={{ x: x1, opacity }}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-display leading-[0.9] tracking-tighter text-white text-center uppercase">
                            FOSS CLUB
                        </h1>
                    </motion.div>

                    {/* Second line - moves right on scroll */}
                    <motion.div
                        style={{ x: x2, opacity }}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    >
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-display leading-[0.9] tracking-tighter text-center uppercase">
                            <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-gray-400">
                                CE Vadakara
                            </span>
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Infinite Marquee */}
            <div className="w-full bg-background/80 backdrop-blur-sm border-y border-primary/30 py-4 overflow-hidden relative z-20">
                <div className="absolute inset-0 bg-primary/5"></div>
                <div className="flex animate-marquee whitespace-nowrap">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="text-4xl md:text-5xl font-black text-primary mx-8 font-display tracking-widest uppercase">
                            Build • Ship • Innovate • Collaborate •
                        </span>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-primary/20 bg-surface/50 backdrop-blur-sm z-20">
                {[
                    { label: "Events", value: "10" },
                    { label: "Members", value: "200+" },
                    { label: "FOSS", value: "100%" },
                ].map((stat, index) => (
                    <div key={index} className="flex flex-col items-center justify-center py-12 border-b md:border-b-0 md:border-r border-primary/20 last:border-r-0 hover:bg-white/5 transition-colors">
                        <h3 className="text-5xl md:text-7xl font-bold text-white mb-2 font-display">{stat.value}</h3>
                        <p className="text-primary font-mono text-xl tracking-widest uppercase">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
