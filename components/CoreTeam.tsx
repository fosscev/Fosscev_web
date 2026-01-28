"use client";

import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import Image from "next/image";
import { team } from "@/data/team";
import { useState } from "react";

// Triple the array to ensure seamless looping
const marqueeTeam = [...team, ...team, ...team];

export function CoreTeam() {
    const [isPaused, setIsPaused] = useState(false);
    const x = useMotionValue(0);

    useAnimationFrame(() => {
        if (!isPaused) {
            // Move at constant speed
            const speed = -0.5; // pixels per frame
            const newX = x.get() + speed;

            // Calculate reset point based on card width and gap
            // Each card is ~280px (w-64 md:w-72) + 32px gap = ~312px
            // One third of tripled array = team.length * 312
            const cardWidth = 312;
            const resetPoint = -(team.length * cardWidth);

            // Reset position for seamless loop
            if (newX <= resetPoint) {
                x.set(0);
            } else {
                x.set(newX);
            }
        }
    });

    return (
        <section className="py-20 overflow-hidden bg-surface/30">
            <div className="max-w-7xl mx-auto px-4 mb-12">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-center">
                    Meet the <span className="text-primary">Core</span>
                </h2>
            </div>

            <div className="relative w-full">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-6 md:gap-8 px-4"
                        style={{ x }}
                    >
                        {marqueeTeam.map((member, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10, scale: 1.02, zIndex: 20 }}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                                className="w-64 md:w-72 shrink-0 group relative bg-surface border border-white/10 rounded-xl overflow-hidden hover:border-primary transition-colors duration-300"
                            >
                                <div className="aspect-square relative overflow-hidden bg-surface-highlight">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>

                                <div className="p-4 border-t border-white/5 bg-surface/80 backdrop-blur-sm">
                                    <h3 className="text-lg font-bold text-white font-display">{member.name}</h3>
                                    <p className="text-primary text-sm font-display">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
