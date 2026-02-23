"use client";

import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TeamMember {
    name: string;
    role: string;
    image: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
}

export function CoreTeam() {
    const [isPaused, setIsPaused] = useState(false);
    const [teamData, setTeamData] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const x = useMotionValue(0);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const { data, error } = await supabase
                    .from('team_members')
                    .select('*')
                    .eq('is_core_team', true)
                    .order('display_order', { ascending: true });

                if (error) {
                    console.error('Error fetching team:', error);
                    return;
                }

                if (data) {
                    const formattedData = data.map(member => ({
                        name: member.name,
                        role: member.role,
                        // Use image_url from DB, fallback to placeholder if empty
                        image: member.image_url || '/placeholder.jpg',
                        github: member.github || undefined,
                        linkedin: member.linkedin || undefined,
                        instagram: member.instagram || undefined,
                    }));
                    setTeamData(formattedData);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeam();
    }, []);

    // Triple the array to ensure seamless looping (only if we have data)
    const marqueeTeam = teamData.length > 0 ? [...teamData, ...teamData, ...teamData] : [];

    useAnimationFrame((t, delta) => {
        if (!isPaused && marqueeTeam.length > 0) {
            // Move at constant speed (pixels per second)
            // Previously -1.2 per frame @ 60fps ≈ -72px/sec
            const speedPerSecond = 72;
            const moveDist = -speedPerSecond * (delta / 1000);

            const newX = x.get() + moveDist;

            // Calculate reset point based on card width and gap
            // Each card is ~280px (w-64 md:w-72) + 32px gap = ~312px
            const cardWidth = 312;
            const singleSetWidth = teamData.length * cardWidth;
            const resetPoint = -singleSetWidth;

            // Reset position for seamless loop
            if (newX <= resetPoint) {
                // Adjust for overshoot to maintain smoothness
                const overshoot = resetPoint - newX;
                x.set(0 - overshoot);
            } else {
                x.set(newX);
            }
        }
    });

    if (isLoading) {
        return (
            <section className="py-20 overflow-hidden bg-surface/30">
                <div className="max-w-7xl mx-auto px-4 mb-12">
                    <div className="h-12 w-64 mx-auto bg-gray-800/50 rounded animate-pulse border border-white/5"></div>
                </div>
                <div className="flex gap-6 md:gap-8 px-4 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-64 md:w-72 shrink-0 h-80 bg-surface border border-white/10 rounded-xl overflow-hidden animate-pulse">
                            <div className="h-64 bg-gray-800/50"></div>
                            <div className="p-4 space-y-2">
                                <div className="h-6 w-3/4 bg-gray-800/50 rounded"></div>
                                <div className="h-4 w-1/2 bg-gray-800/50 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (teamData.length === 0) {
        return null; // Or some fallback UI
    }

    return (
        <section className="py-20 overflow-hidden bg-surface/30">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-4 mb-16 text-center"
            >
                <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
                    Core Team
                </h2>
                <div className="w-12 h-px bg-white/20 mx-auto mt-6"></div>
            </motion.div>

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
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                                className="w-64 md:w-72 shrink-0 group relative flex flex-col gap-4"
                            >
                                <div className="aspect-[4/5] relative rounded-lg overflow-hidden bg-white/[0.02] opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>

                                <div className="text-center">
                                    <h3 className="text-lg font-light text-white tracking-wide">{member.name}</h3>
                                    <p className="text-gray-500 text-xs font-mono tracking-wider uppercase mt-1">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
