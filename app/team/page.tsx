"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { team, subteam } from "@/data/team";
import Image from "next/image";
import { Github, Linkedin, Instagram } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";

interface CardPosition {
    x: number;
    y: number;
}


// Personalized messages for each team member
const getPersonalizedMessage = (name: string, role: string): string => {
    const messages: { [key: string]: string } = {
        "Rishnu Lal N": "The visionary leader driving<br />our FOSS community forward",
        "Hussain Huzefa": "Strategic organizer shaping<br />our community's future",
        "Devapriya k": "Passionate organizer bringing<br />ideas to life",
        "Roshith Krishna": "Managing our resources with<br />precision and care",
        "Anvar Sadath": "Crafting beautiful experiences<br />for our community",
        "Lakshmi Reji Suresh": "Empowering women in tech<br />and open source",
        "Rida Waseem": "Championing diversity and<br />inclusion in FOSS",
        "Sayanth P": "Connecting our community<br />across all platforms",
        "Ashwandha": "Ensuring financial stability<br />and transparency",
        "Muhammad Aswlah": "Designing the visual identity<br />of our community",
        "Fathima P": "Creating stunning designs<br />that inspire",
        "Sandra Sunil T": "Building bridges through<br />social engagement",
        "Muhammed Sinan A P": "Crafting stories that<br />bring our mission to life",
    };
    return messages[name] || `Passionate ${role}<br />in our FOSS community`;
};


const TeamMemberCard = ({
    member,
    index,
    hoveredIndex,
    onHover,
    onLeave,
    cardPositions
}: {
    member: typeof team[0],
    index: number,
    hoveredIndex: number | null,
    onHover: (index: number) => void,
    onLeave: () => void,
    cardPositions: React.MutableRefObject<Map<number, DOMRect>>
}) => {
    const [magneticPos, setMagneticPos] = useState<CardPosition>({ x: 0, y: 0 });
    const [repulsionPos, setRepulsionPos] = useState<CardPosition>({ x: 0, y: 0 });
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

            // Very subtle magnetic strength for hovered card
            const strength = 0.08;
            setMagneticPos({
                x: deltaX * strength,
                y: deltaY * strength
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        return () => card.removeEventListener('mousemove', handleMouseMove);
    }, [isHovered]);

    // Handle repulsion effect for nearby cards
    useEffect(() => {
        if (hoveredIndex === null || hoveredIndex === index) {
            // Reset repulsion when nothing is hovered or this card is hovered
            setRepulsionPos({ x: 0, y: 0 });
            return;
        }

        const hoveredRect = cardPositions.current.get(hoveredIndex);
        const thisRect = cardPositions.current.get(index);

        if (!hoveredRect || !thisRect) return;

        const hoveredCenterX = hoveredRect.left + hoveredRect.width / 2;
        const hoveredCenterY = hoveredRect.top + hoveredRect.height / 2;
        const thisCenterX = thisRect.left + thisRect.width / 2;
        const thisCenterY = thisRect.top + thisRect.height / 2;

        const deltaX = thisCenterX - hoveredCenterX;
        const deltaY = thisCenterY - hoveredCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Repulsion radius (in pixels)
        const repulsionRadius = 400;

        if (distance < repulsionRadius && distance > 0) {
            // Calculate repulsion strength (STRONGER - increased from 30 to 50)
            const repulsionStrength = (1 - distance / repulsionRadius) * 50;
            const angle = Math.atan2(deltaY, deltaX);

            const repulseX = Math.cos(angle) * repulsionStrength;
            const repulseY = Math.sin(angle) * repulsionStrength;




            setRepulsionPos({
                x: repulseX,
                y: repulseY
            });
        } else {
            setRepulsionPos({ x: 0, y: 0 });
        }
    }, [hoveredIndex, index, cardPositions]);

    // Update card position in the map
    useEffect(() => {
        const updatePosition = () => {
            if (cardRef.current) {
                cardPositions.current.set(index, cardRef.current.getBoundingClientRect());
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [index, cardPositions]);

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
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                    />

                    {/* Overlay with binary code */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div
                                className="font-mono text-primary text-sm leading-relaxed opacity-80"
                                dangerouslySetInnerHTML={{ __html: getPersonalizedMessage(member.name, member.role) }}
                            />
                        </div>
                    </div>

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
                <div className="relative p-6 bg-surface/90 backdrop-blur-sm border-t border-white/5">
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

    return (
        <main className="min-h-screen bg-background text-white selection:bg-primary selection:text-black">
            <Navbar />

            <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-16 text-center">
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

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
                    {team.map((member, i) => (
                        <TeamMemberCard
                            key={i}
                            member={member}
                            index={i}
                            hoveredIndex={hoveredIndex}
                            onHover={setHoveredIndex}
                            onLeave={() => setHoveredIndex(null)}
                            cardPositions={cardPositions}
                        />
                    ))}
                </div>

                {/* Subteam Section */}
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
                        {subteam.map((member, i) => (
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
        </main>
    );
}
