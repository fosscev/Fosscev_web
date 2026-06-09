"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useSiteContent } from "@/lib/useSiteContent";

interface TeamMember {
    name: string;
    role: string;
    image: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
}

export function CoreTeam() {
    const [teamData, setTeamData] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const { content: siteContent } = useSiteContent();
    const sectionContent = siteContent.core_team || { title: "Core Team" };

    // Defer data fetch until section is near viewport
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

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
    }, [isVisible]);

    // Double the array for seamless CSS marquee loop
    const marqueeTeam = teamData.length > 0 ? [...teamData, ...teamData] : [];

    const showSkeleton = !isVisible || isLoading;

    return (
        <section ref={sectionRef} className="py-20 overflow-hidden bg-surface/30" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
            {showSkeleton ? (
                <>
                    <div className="max-w-7xl mx-auto px-4 mb-12">
                        <div className="h-12 w-64 mx-auto bg-gray-800/50 rounded animate-pulse border border-white/5"></div>
                    </div>
                    <div className="flex gap-6 md:gap-8 px-4 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-64 md:w-72 shrink-0 flex flex-col gap-4 animate-pulse">
                                <div className="aspect-[4/5] rounded-lg bg-gray-800/50"></div>
                                <div className="text-center space-y-2">
                                    <div className="h-5 w-3/4 mx-auto bg-gray-800/50 rounded"></div>
                                    <div className="h-4 w-1/2 mx-auto bg-gray-800/50 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : teamData.length === 0 ? null : (
                <>
                    <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                        <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
                            {sectionContent.title}
                        </h2>
                        <div className="w-12 h-px bg-white/20 mx-auto mt-6"></div>
                    </div>

                    <div className="relative w-full">
                        {/* Gradient Masks */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

                        <div className="flex overflow-hidden">
                            <div
                                className="flex gap-6 md:gap-8 px-4 w-max will-change-transform animate-marquee hover:[animation-play-state:paused]"
                                style={{ animationDuration: `${Math.max(20, teamData.length * 3)}s` }}
                            >
                                {marqueeTeam.map((member, i) => (
                                    <div
                                        key={i}
                                        className="w-64 md:w-72 shrink-0 group relative flex flex-col gap-4"
                                    >
                                        <div className="aspect-[4/5] relative rounded-lg overflow-hidden isolate">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                            />
                                        </div>

                                        <div className="text-center">
                                            <h3 className="text-lg font-light text-white tracking-wide">{member.name}</h3>
                                            <p className="text-gray-500 text-xs font-mono tracking-wider uppercase mt-1">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
