"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { Github, Linkedin, Instagram } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";
import { TeamSkeleton } from "@/components/skeletons/TeamSkeleton";

interface CardPosition {
    x: number;
    y: number;
}

// Helper to normalize/validate image URLs and map DB fields to component fields
const normalizeImageUrl = (url: any) => {
    const placeholder = "/placeholder-user.svg";
    if (!url) return placeholder;

    try {
        new URL(url);
        return url;
    } catch (e) {
        return placeholder;
    }
};

// Helper to map database fields to component fields
const mapTeamMember = (member: any) => ({
    name: member.name,
    role: member.role,
    image: normalizeImageUrl(member.image_url || member.image),
    github: member.github,
    linkedin: member.linkedin,
    instagram: member.instagram,
    bio: member.bio,
    is_core_team: member.is_core_team
});

const TeamMemberCard = ({
    member,
    index,
    hoveredIndex,
    onHover,
    onLeave,
    cardPositions
}: {
    member: any,
    index: number,
    hoveredIndex: number | null,
    onHover: (index: number) => void,
    onLeave: () => void,
    cardPositions: React.MutableRefObject<Map<number, DOMRect>>
}) => {
    const [magneticPos, setMagneticPos] = useState<CardPosition>({ x: 0, y: 0 });
    const [repulsionPos, setRepulsionPos] = useState<CardPosition>({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isHovered = hoveredIndex === index;

    // Handle magnetic effect for hovered card (subtle mouse following)
    useEffect(() => {
        const card = cardRef.current;
        if (!card || !isHovered) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            // Magnetic pull: cards follow cursor up to 15px
            const magneticX = deltaX * 0.12;
            const magneticY = deltaY * 0.12;
            setMagneticPos({ x: magneticX, y: magneticY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isHovered]);

    // Handle repulsion effect for non-hovered cards (they push away slightly from hovered card)
    useEffect(() => {
        if (hoveredIndex === null || isHovered) {
            setRepulsionPos({ x: 0, y: 0 });
            return;
        }

        const updatePosition = () => {
            const card = cardRef.current;
            const hoveredCardPos = cardPositions.current.get(hoveredIndex);

            if (!card || !hoveredCardPos) return;

            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const hoverCenterX = hoveredCardPos.left + hoveredCardPos.width / 2;
            const hoverCenterY = hoveredCardPos.top + hoveredCardPos.height / 2;

            const dx = centerX - hoverCenterX;
            const dy = centerY - hoverCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Subtle push away (repulsion): max 6px shift, decreases with distance
            if (distance > 0 && distance < 450) {
                const force = (450 - distance) / 450;
                const pushX = (dx / distance) * 6 * force;
                const pushY = (dy / distance) * 6 * force;
                setRepulsionPos({ x: pushX, y: pushY });
            } else {
                setRepulsionPos({ x: 0, y: 0 });
            }
        };

        updatePosition();

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [index, hoveredIndex, isHovered, cardPositions]);

    const handleMouseEnter = () => {
        onHover(index);
        if (cardRef.current) {
            cardPositions.current.set(index, cardRef.current.getBoundingClientRect());
        }
    };

    const handleMouseLeave = () => {
        onLeave();
        setMagneticPos({ x: 0, y: 0 });
    };

    // Combine magnetic and repulsion effects
    const totalX = isHovered ? magneticPos.x : repulsionPos.x;
    const totalY = isHovered ? magneticPos.y : repulsionPos.y;

    return (
        <div
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative"
            style={{
                transform: `translate(${totalX}px, ${totalY}px)`,
                transition: isHovered
                    ? 'transform 0.1s ease-out'
                    : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: isHovered ? 50 : 1,
            }}
        >
            <div className="relative bg-surface border border-white/10 rounded-xl overflow-hidden hover:border-primary transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,230,118,0.3)]">
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Glowing orb effect */}
                <div
                    className="absolute w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />

                {/* Profile Image Container */}
                <div className="relative aspect-square overflow-hidden bg-surface-highlight">
                    {/* Shimmer Placeholder while loading image */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-900 overflow-hidden z-10">
                            <div 
                                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                style={{ animation: 'var(--animate-shimmer) 2s infinite' }}
                            />
                        </div>
                    )}
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className={`object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        loading="eager"
                        onLoad={() => setImageLoaded(true)}
                    />

                    {/* Scan line effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div
                            className="absolute w-full h-0.5 bg-primary/50 animate-scan"
                            style={{
                                animation: 'scan 2s ease-in-out infinite',
                            }}
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="relative p-6 bg-surface/90 backdrop-blur-sm border-t border-white/5 border-t-emerald-400/5">
                    {/* Name */}
                    <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-primary transition-colors duration-300">
                        {member.name}
                    </h3>

                    {/* Designation */}
                    <p className="text-primary/80 text-sm font-mono uppercase tracking-wider mb-4 group-hover:text-primary transition-colors duration-300">
                        {member.role}
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-4 group-hover:via-primary/60 transition-all duration-300" />

                    {/* Social Links */}
                    <div className="flex gap-3 justify-center">
                        {member.github && (
                            <a
                                href={member.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group/icon p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Github className="w-5 h-5 text-gray-400 group-hover/icon:text-primary transition-colors duration-300" />
                                <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
                            </a>
                        )}
                        {member.linkedin && (
                            <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group/icon p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Linkedin className="w-5 h-5 text-gray-400 group-hover/icon:text-primary transition-colors duration-300" />
                                <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
                            </a>
                        )}
                        {member.instagram && (
                            <a
                                href={member.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group/icon p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Instagram className="w-5 h-5 text-gray-400 group-hover/icon:text-primary transition-colors duration-300" />
                                <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
};

export default function TeamPage() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredSubteamIndex, setHoveredSubteamIndex] = useState<number | null>(null);
    const cardPositions = useRef<Map<number, DOMRect>>(new Map());
    const subteamCardPositions = useRef<Map<number, DOMRect>>(new Map());

    const [hoveredFacultyIndex, setHoveredFacultyIndex] = useState<number | null>(null);
    const facultyCardPositions = useRef<Map<number, DOMRect>>(new Map());

    // State for team data
    const [coreTeamData, setCoreTeamData] = useState<any[]>([]);
    const [previousCoreTeamData, setPreviousCoreTeamData] = useState<any[]>([]);
    const [subTeamData, setSubTeamData] = useState<any[]>([]);
    const [facultyTeamData, setFacultyTeamData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current');

    useEffect(() => {
        let retries = 3;
        let active = true;

        async function fetchTeamData() {
            try {
                const response = await fetch("/api/data/team", { cache: "no-store" });
                if (!active) return;
                if (!response.ok) throw new Error("Failed to fetch team data");
                const data = await response.json();

                if (data.coreTeam) {
                    const mappedCore = data.coreTeam.map(mapTeamMember);
                    setCoreTeamData(mappedCore);
                    // Duplicate for previous core team initially as requested
                    setPreviousCoreTeamData(mappedCore);
                }

                if (data.subTeam) {
                    setSubTeamData(data.subTeam.map(mapTeamMember));
                }

                if (data.faculty) {
                    setFacultyTeamData(data.faculty.map(mapTeamMember));
                }
                setError(null);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch team data:", err);
                if (retries > 0) {
                    retries--;
                    setTimeout(() => {
                        if (active) fetchTeamData();
                    }, 2000);
                } else {
                    if (active) {
                        setError("Failed to load team data");
                        setIsLoading(false);
                    }
                }
            }
        }

        fetchTeamData();

        return () => {
            active = false;
        };
    }, []);

    return (
        <main className="relative min-h-screen text-white selection:bg-primary selection:text-black overflow-hidden">
            <div className="relative z-10">
                <Navbar />

                <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto overflow-visible">
                    {/* Faculty Advisors Section */}
                    <div className="mb-20">
                        <div className="mb-12 text-center">
                            <h2 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white mb-4 animate-gradient">
                                FACULTY_ADVISORS
                            </h2>
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
                                <p className="text-lg text-primary font-mono">
                                // MENTORS & GUIDES
                                </p>
                                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
                            </div>
                            <p className="text-gray-400 font-mono max-w-2xl mx-auto">
                                The pillars of support guiding our community forward.
                            </p>
                        </div>

                        <div className="flex justify-center gap-8 flex-wrap">
                            {facultyTeamData.length > 0 ? facultyTeamData.map((member, i) => (
                                <div key={`faculty-${i}`} className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.33%-21px)] max-w-[320px]">
                                    <TeamMemberCard
                                        member={member as any}
                                        index={i}
                                        hoveredIndex={hoveredFacultyIndex}
                                        onHover={setHoveredFacultyIndex}
                                        onLeave={() => setHoveredFacultyIndex(null)}
                                        cardPositions={facultyCardPositions}
                                    />
                                </div>
                            )) : !isLoading && (
                                <div className="text-gray-500 font-mono text-center w-full py-8">
                                    No faculty advisors found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-6xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white mb-6 animate-gradient">
                            CORE_TEAM
                        </h1>
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
                            <p className="text-xl text-primary font-mono">
                            // MEET THE ARCHITECTS
                            </p>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
                        </div>
                        <p className="text-gray-400 font-mono max-w-2xl mx-auto">
                            The minds behind the code. The visionaries executing the mission.
                        </p>
                    </div>

                    {/* Toggle Switcher */}
                    {!isLoading && !error && (
                        <div className="flex justify-center mb-16">
                            <div className="relative flex p-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl max-w-md w-full sm:w-auto">
                                {/* Sliding background highlight */}
                                <div 
                                    className="absolute top-1.5 bottom-1.5 left-1.5 rounded-lg bg-primary/20 border border-primary/30 transition-all duration-300 ease-out"
                                    style={{
                                        left: activeTab === 'current' ? '6px' : 'calc(50% + 2px)',
                                        width: 'calc(50% - 8px)'
                                    }}
                                />
                                
                                <button
                                    onClick={() => setActiveTab('current')}
                                    className={`relative z-10 flex-1 px-6 py-2.5 rounded-lg text-sm font-display font-bold transition-colors duration-300 whitespace-nowrap text-center ${
                                        activeTab === 'current' ? 'text-primary' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Current Core Team
                                </button>
                                <button
                                    onClick={() => setActiveTab('previous')}
                                    className={`relative z-10 flex-1 px-6 py-2.5 rounded-lg text-sm font-display font-bold transition-colors duration-300 whitespace-nowrap text-center ${
                                        activeTab === 'previous' ? 'text-primary' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Previous Core Team
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <TeamSkeleton />
                    ) : error ? (
                        <div className="text-center py-10 z-20">
                            <p className="text-red-500 font-mono">{error}</p>
                        </div>
                    ) : (
                        // Team Grid with transitions
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20 overflow-visible min-h-fit"
                            >
                                {activeTab === 'current' 
                                    ? coreTeamData.map((member, i) => (
                                        <TeamMemberCard
                                            key={`core-${i}`}
                                            member={member}
                                            index={i}
                                            hoveredIndex={hoveredIndex}
                                            onHover={setHoveredIndex}
                                            onLeave={() => setHoveredIndex(null)}
                                            cardPositions={cardPositions}
                                        />
                                      ))
                                    : previousCoreTeamData.map((member, i) => (
                                        <TeamMemberCard
                                            key={`prev-${i}`}
                                            member={member}
                                            index={i}
                                            hoveredIndex={hoveredIndex}
                                            onHover={setHoveredIndex}
                                            onLeave={() => setHoveredIndex(null)}
                                            cardPositions={cardPositions}
                                        />
                                      ))
                                }
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {!isLoading && !error && subTeamData.length > 0 && (
                        /* Subteam Section */
                        <div className="mb-20">
                            {/* Subteam Header */}
                            <div className="mb-12 text-center">
                                <h2 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white mb-4 animate-gradient">
                                    SUB_TEAM
                                </h2>
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
                                    <p className="text-lg text-primary font-mono">
                                    // THE SUPPORTING FORCE
                                    </p>
                                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
                                </div>
                                <p className="text-gray-400 font-mono max-w-2xl mx-auto">
                                    Dedicated contributors powering our community initiatives.
                                </p>
                            </div>

                            {/* Subteam Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {subTeamData.map((member, i) => (
                                    <TeamMemberCard
                                        key={`subteam-${i}`}
                                        member={member}
                                        index={i}
                                        hoveredIndex={hoveredSubteamIndex}
                                        onHover={setHoveredSubteamIndex}
                                        onLeave={() => setHoveredSubteamIndex(null)}
                                        cardPositions={subteamCardPositions}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Call to Action */}
                    <div className="relative p-8 md:p-12 border border-white/10 bg-surface/50 rounded-xl overflow-hidden backdrop-blur-sm">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `repeating-linear-gradient(0deg, #00E676 0px, #00E676 1px, transparent 1px, transparent 20px),
                                            repeating-linear-gradient(90deg, #00E676 0px, #00E676 1px, transparent 1px, transparent 20px)`
                            }} />
                        </div>

                        {/* Glowing corner accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

                        <div className="relative z-10 text-center">
                            <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                                Join the <span className="text-primary">Collective</span>
                            </h3>
                            <p className="text-gray-400 mb-8 font-mono max-w-2xl mx-auto">
                                We are looking for passionate contributors who believe in the power of FOSS.<br />
                                <span className="text-primary">// Initialize your journey with us</span>
                            </p>
                            <Link
                                href={SOCIAL_LINKS.whatsapp}
                                target="_blank"
                                className="group relative inline-block bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black px-8 py-4 font-bold transition-all duration-300 uppercase font-display overflow-hidden"
                            >
                                <span className="relative z-10">Join_With_Us</span>
                                <div className="absolute inset-0 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left -z-0" />
                            </Link>
                        </div>
                    </div>
                </section>

                <Footer />

                <style jsx>{`
                @keyframes scan {
                    0% {
                        top: 0%;
                    }
                    50% {
                        top: 100%;
                    }
                    100% {
                        top: 0%;
                    }
                }
                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
            </div>
        </main>
    );
}
