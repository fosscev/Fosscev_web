"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="group relative h-[60vh] w-100 md:w-150 shrink-0 overflow-hidden bg-surface border border-white/10 grayscale hover:grayscale-0 transition-all duration-500"
                        >
                            {/* Placeholder for images */}
                            <div className="absolute inset-0 flex items-center justify-center bg-white/5 group-hover:bg-primary/5 transition-colors">
                                <span className="font-display text-9xl text-white/10 font-bold group-hover:text-primary/20">{i}</span>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-6 bg-linear-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-primary font-mono text-lg">Event 0{i}</p>
                                <h4 className="text-white font-bold text-2xl">Community Meetup</h4>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
