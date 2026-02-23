"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";

export function Hero() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const yParallaxText = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const yParallaxStats = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setMousePosition({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <section ref={targetRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-10">
            {/* Elegant Minimal Headline */}
            <motion.div
                style={{ y: yParallaxText, opacity: opacityFade }}
                className="flex-1 flex flex-col justify-center items-center z-10 px-4 max-w-5xl mx-auto w-full"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, x: mousePosition.x * 0.5, y: mousePosition.y * 0.5 }}
                    transition={{ duration: 0.8, ease: "easeOut", x: { duration: 0.2, ease: "linear" }, y: { duration: 0.2, ease: "linear" } }}
                    className="text-center space-y-6"
                >
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-mono text-gray-300">
                        <span className="text-primary mr-2">●</span> The Open Source Community
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-bold font-display leading-[1.1] tracking-tight text-white gap-y-4">
                        <span className="text-primary">FOSS</span> CLUB<br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-gray-200 to-gray-500">
                            CE Vadakara
                        </span>
                    </h1>

                    <p className="mt-8 text-xl md:text-2xl text-gray-400 font-body max-w-2xl mx-auto leading-relaxed">
                        Code. Collaborate. Create. Building the future of open source engineering through innovation and community.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-12 flex flex-col sm:flex-row gap-4"
                >
                    <a href="/events" className="px-8 py-4 rounded-lg bg-primary text-black font-semibold hover:bg-primary/80 transition-colors duration-300">
                        Explore Events
                    </a>
                    <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-lg border border-primary/40 text-primary font-semibold hover:bg-primary/10 transition-colors duration-300">
                        Join Community
                    </a>
                </motion.div>
            </motion.div>

            {/* Clean Stats Row */}
            <motion.div
                style={{ y: yParallaxStats, opacity: opacityFade }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-5xl mx-auto mt-24 px-4 z-20"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-t border-white/10">
                    {[
                        { label: "Active Events", value: "10+" },
                        { label: "Community Members", value: "200+" },
                        { label: "Open Source Tech", value: "100%" },
                    ].map((stat, index) => (
                        <div key={index} className="flex flex-col items-center md:items-start group">
                            <h3 className="text-4xl md:text-5xl font-light text-white group-hover:text-primary transition-colors duration-300 mb-2 font-display tracking-tight">{stat.value}</h3>
                            <p className="text-sm text-gray-400 group-hover:text-primary/70 transition-colors duration-300 tracking-wider uppercase font-mono">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
