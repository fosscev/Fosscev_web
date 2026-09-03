"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Github, Instagram, Linkedin } from "lucide-react";
import { useSiteContent } from "@/lib/useSiteContent";

interface TeamMember {
    name: string;
    role: string;
    image: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
}

const memberOrder = [
    "Rishnu Lal N",
    "Roshith Krishna",
    "Sayanth P",
    "Anvar Sadath",
    "Lakshmi Reji Suresh",
    "Ashwandha RJ",
    "Sandra Sunil T",
    "Muhammad Shabaz",
    "Muhammad Aswlah",
    "Fathima P",
    "Hemanth Sudhan C",
    "Ananthanarayanan M",
] as const;

export function CoreTeam() {
    const [teamData, setTeamData] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [activeTrackIndex, setActiveTrackIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [viewportWidth, setViewportWidth] = useState(960);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const { content: siteContent } = useSiteContent();
    const sectionContent = siteContent.core_team || { title: "Core Team" };

    const orderedMembers = useMemo(() => {
        if (!teamData.length) return [] as TeamMember[];

        const memberMap = new Map(teamData.map((member) => [member.name, member]));
        return memberOrder
            .map((name) => memberMap.get(name))
            .filter((member): member is TeamMember => Boolean(member));
    }, [teamData]);

    const displayMembers = useMemo(() => orderedMembers.slice(0, memberOrder.length), [orderedMembers]);
    const loopMembers = useMemo(() => {
        if (!displayMembers.length) return [] as TeamMember[];
        return [...displayMembers, ...displayMembers, ...displayMembers];
    }, [displayMembers]);
    const activeMember = loopMembers[activeTrackIndex % loopMembers.length] ?? displayMembers[0];
    const markerSpacing = viewportWidth < 640 ? 320 : viewportWidth < 1024 ? 280 : 240;
    const markerSize = 72;
    const trackOffset = viewportWidth > 0 ? -(activeTrackIndex * markerSpacing) + viewportWidth / 2 - markerSize / 2 : 0;

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
            { rootMargin: "400px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const element = viewportRef.current;
        if (!element) return;

        const updateSize = () => {
            const rect = element.getBoundingClientRect();
            setViewportWidth(rect.width);
        };

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(element);
        window.addEventListener("resize", updateSize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateSize);
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const fetchTeam = async () => {
            try {
                const response = await fetch("/api/data/team", { cache: "no-store" });
                if (!response.ok) throw new Error("Failed to fetch team data");

                const data = await response.json();
                const coreTeamMembers = Array.isArray(data?.coreTeam) ? data.coreTeam : [];
                const formattedData = coreTeamMembers.map((member: Record<string, any>) => ({
                    name: member.name || "",
                    role: member.role || "",
                    image: member.image_url || member.image || "/placeholder.jpg",
                    github: member.github || undefined,
                    linkedin: member.linkedin || undefined,
                    instagram: member.instagram || undefined,
                }));

                setTeamData(formattedData);
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeam();
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible || !isAutoPlaying || loopMembers.length === 0) return;

        const timer = window.setTimeout(() => {
            setActiveTrackIndex((prev) => prev + 1);
        }, 3000);

        return () => window.clearTimeout(timer);
    }, [isVisible, isAutoPlaying, activeTrackIndex, loopMembers.length]);

    useEffect(() => {
        if (!isVisible || isAutoPlaying) return;

        const timer = window.setTimeout(() => {
            setIsAutoPlaying(true);
        }, 5000);

        return () => window.clearTimeout(timer);
    }, [isAutoPlaying, isVisible]);

    const handleSelectMember = (index: number) => {
        if (!loopMembers.length) return;
        setActiveTrackIndex(index);
        setIsAutoPlaying(false);
    };

    const handlePrev = () => {
        if (!loopMembers.length) return;
        setActiveTrackIndex((prev) => prev - 1);
        setIsAutoPlaying(false);
    };

    const handleNext = () => {
        if (!loopMembers.length) return;
        setActiveTrackIndex((prev) => prev + 1);
        setIsAutoPlaying(false);
    };

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        setDragStartX(event.clientX);
        setIsAutoPlaying(false);
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (dragStartX === null) return;
        const delta = event.clientX - dragStartX;
        if (delta > 70) {
            handlePrev();
        } else if (delta < -70) {
            handleNext();
        }
        setDragStartX(null);
    };

    const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
        setDragStartX(event.touches[0]?.clientX ?? null);
        setIsAutoPlaying(false);
    };

    const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
        if (dragStartX === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? 0) - dragStartX;
        if (delta > 70) {
            handlePrev();
        } else if (delta < -70) {
            handleNext();
        }
        setDragStartX(null);
    };

    const showSkeleton = !isVisible || isLoading;

    const renderDescription = (member: TeamMember) => {
        const copy: Record<string, string> = {
            "Rishnu Lal N": "Steering the mission with calm precision and long-range vision.",
            "Roshith Krishna": "Holding the architecture steady while every signal stays live.",
            "Sayanth P": "Designing fluid experiences that feel sharp and responsive.",
            "Anvar Sadath": "Bridging ideas to action with focused momentum.",
            "Lakshmi Reji Suresh": "Keeping the network human, clear, and deeply connected.",
            "Ashwandha RJ": "Crafting stories that carry the pulse of the community.",
            "Sandra Sunil T": "Turning ideas into welcoming, polished experiences.",
            "Muhammad Shabaz": "Driving the narrative with clarity and high-impact presence.",
            "Muhammad Aswlah": "Leading with energy, structure, and unwavering momentum.",
            "Fathima P": "Bringing warmth and structure to every initiative.",
            "Hemanth Sudhan C": "Powering the technical backbone with disciplined focus.",
            "Ananthanarayanan M": "Keeping the roadmap grounded in purpose and execution.",
        };

        return copy[member.name] ?? "Driving progress with a sharp eye for detail and long-term impact.";
    };

    const renderDetailCard = (member: TeamMember) => (
        <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[1.5rem] border border-emerald-400/25 bg-slate-950/85 p-4 shadow-[0_0_45px_rgba(16,185,129,0.17)] backdrop-blur-xl"
        >
            <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(120deg,rgba(16,185,129,0.12),transparent_45%,rgba(16,185,129,0.08))]" />
            <motion.div
                className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_100%)]"
                initial={{ x: "-130%" }}
                animate={{ x: "140%" }}
                transition={{ duration: 0.85, ease: "easeInOut" }}
            />
            <div className="relative">
                <div className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-slate-900/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={member.image} alt={member.name} loading="lazy" decoding="async" className="h-40 w-full object-cover sm:h-52" />
                </div>
                <div className="mt-4">
                    <p className="text-[0.65rem] font-mono uppercase tracking-[0.35em] text-emerald-400/70">Mission Node</p>
                    <h3 className="mt-2 text-xl font-light tracking-[0.18em] text-white">{member.name}</h3>
                    <p className="mt-2 text-[0.7rem] font-mono uppercase tracking-[0.28em] text-gray-400">{member.role}</p>
                    <p className="mt-3 text-sm leading-6 text-gray-300">{renderDescription(member)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 p-2.5 text-emerald-300 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/70 hover:bg-emerald-400/10">
                            <Github className="h-4 w-4" />
                        </a>
                    )}
                    {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 p-2.5 text-emerald-300 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/70 hover:bg-emerald-400/10">
                            <Linkedin className="h-4 w-4" />
                        </a>
                    )}
                    {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 p-2.5 text-emerald-300 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/70 hover:bg-emerald-400/10">
                            <Instagram className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden py-20"
            style={{ contentVisibility: "auto", containIntrinsicSize: "auto 620px" }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_46%)]" />
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.1),transparent_30%)]" />
            <motion.div
                className="absolute inset-0 opacity-70"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 24, ease: "linear", repeat: Infinity }}
                style={{ background: "radial-gradient(circle at center, rgba(16,185,129,0.06), transparent 62%)" }}
            />

            {showSkeleton ? (
                <>
                    <div className="mx-auto mb-12 max-w-7xl px-4 text-center">
                        <div className="mx-auto h-10 w-48 animate-pulse rounded bg-gray-800/50 md:h-14 md:w-64"></div>
                        <div className="mx-auto mt-6 h-px w-12 bg-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.7)]"></div>
                    </div>
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="relative h-[560px] animate-pulse overflow-hidden rounded-[2rem] border border-white/10 bg-gray-900/40">
                            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-700/50"></div>
                            <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-700/30"></div>
                            <div className="absolute left-[20%] top-[30%] h-16 w-16 rounded-full bg-gray-800/80"></div>
                            <div className="absolute left-[80%] top-[30%] h-16 w-16 rounded-full bg-gray-800/80"></div>
                            <div className="absolute left-1/2 top-[20%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-700/80"></div>
                            <div className="absolute bottom-6 left-1/2 w-[320px] -translate-x-1/2 h-32 rounded-xl bg-gray-800/60"></div>
                        </div>
                    </div>
                </>
            ) : displayMembers.length === 0 ? null : (
                <>
                    <div className={`mx-auto mb-8 max-w-7xl px-4 text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                        <h2 className="text-3xl font-light tracking-tight text-white md:text-5xl">{sectionContent.title}</h2>
                        <div className="mx-auto mt-6 h-px w-12 bg-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.7)]"></div>
                    </div>

                    <div className="mx-auto max-w-7xl px-4">
                        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-slate-950/70 p-3 shadow-[0_0_90px_rgba(16,185,129,0.12)] backdrop-blur-2xl md:p-5">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-transparent" />
                            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:38px_38px]" />

                            <div className="relative z-10 flex items-center justify-between gap-3">
                                <button type="button" onClick={handlePrev} className="group rounded-full border border-emerald-400/25 bg-slate-950/70 p-3 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.15)] transition-all duration-300 hover:-rotate-6 hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.32)]">
                                    <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                </button>
                                <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
                                    {displayMembers.map((_, index) => (
                                        <div key={index} className="h-1.3 w-14 overflow-hidden rounded-full bg-white/10">
                                            <motion.div animate={{ width: index === activeTrackIndex % displayMembers.length ? "100%" : "0%" }} transition={{ duration: 0.45 }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300" />
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleNext} className="group rounded-full border border-emerald-400/25 bg-slate-950/70 p-3 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.15)] transition-all duration-300 hover:rotate-6 hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.32)]">
                                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                </button>
                            </div>

                            <div className="relative mt-4 h-[560px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_58%)]" ref={viewportRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_80%_25%,rgba(16,185,129,0.08),transparent_24%),radial-gradient(circle_at_50%_85%,rgba(16,185,129,0.06),transparent_24%)]" />
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:58px_58px]" />
                                <div className="absolute left-[8%] top-[7%] h-[84%] w-[84%] rounded-full border border-emerald-400/10" />
                                <div className="absolute left-[20%] top-[18%] h-[62%] w-[62%] rounded-full border border-emerald-400/10" />
                                <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(transparent_0%,rgba(16,185,129,0.04)_50%,transparent_100%)] [background-size:100%_140px]" />
                                <motion.div className="absolute inset-0" animate={{ x: trackOffset }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>
                                    <div className="absolute inset-y-0 left-0 w-[2000px] bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_75%_70%,rgba(16,185,129,0.05),transparent_30%)]" />
                                    <svg viewBox="0 0 2200 900" className="absolute inset-0 h-full w-full">
                                        {loopMembers.map((member, index) => {
                                            const x = index * markerSpacing + 220;
                                            const y = index % 2 === 0 ? 240 : 620;
                                            const next = loopMembers[index + 1];
                                            if (!next) return null;
                                            const nextX = (index + 1) * markerSpacing + 220;
                                            const nextY = (index + 1) % 2 === 0 ? 240 : 620;
                                            return (
                                                <g key={`${member.name}-${index}`}>
                                                    <motion.line
                                                        x1={x}
                                                        y1={y}
                                                        x2={nextX}
                                                        y2={nextY}
                                                        stroke="rgba(52,211,153,0.22)"
                                                        strokeWidth="2.4"
                                                        strokeLinecap="round"
                                                        initial={{ pathLength: 0, opacity: 0.2 }}
                                                        animate={{ pathLength: 1, opacity: 0.7 }}
                                                        transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
                                                    />
                                                    <circle cx={x} cy={y} r="2.2" fill="#6ee7b7" opacity="0.65" />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    <motion.div className="absolute inset-y-0 left-[22%] w-[50%] border-l border-r border-emerald-400/10" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
                                    <motion.div className="absolute left-0 top-[14%] h-[72%] w-[100%] border-y border-emerald-400/10" animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

                                    {loopMembers.map((member, index) => {
                                        const x = index * markerSpacing + 220;
                                        const y = index % 2 === 0 ? 240 : 620;
                                        const isActive = activeTrackIndex === index;
                                        const close = Math.abs(activeTrackIndex - index) <= 1;

                                        return (
                                            <motion.button
                                                key={`${member.name}-${index}`}
                                                type="button"
                                                onClick={() => handleSelectMember(index)}
                                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                                style={{ left: x, top: y }}
                                                animate={{ scale: isActive ? 1.18 : 0.86, opacity: isActive ? 1 : close ? 0.72 : 0.55 }}
                                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                                whileHover={{ scale: 1.06, y: -4 }}
                                            >
                                                <div className="relative flex h-20 w-20 items-center justify-center">
                                                    <motion.div className="absolute inset-0 rounded-full border border-emerald-400/40" animate={{ scale: isActive ? [1, 1.16, 1] : 1, opacity: isActive ? [0.3, 0.8, 0.3] : 0.16 }} transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }} />
                                                    <motion.div className="absolute inset-[-10px] rounded-full border border-emerald-300/25" animate={{ rotate: isActive ? 360 : 0, opacity: isActive ? 0.9 : 0.4 }} transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }} />
                                                    <div className="absolute top-[-10px] h-0 w-0 border-b-[14px] border-l-[11px] border-r-[11px] border-b-emerald-400/85 border-l-transparent border-r-transparent drop-shadow-[0_0_16px_rgba(16,185,129,0.45)]" />
                                                    <div className="absolute top-[-2px] h-0 w-0 border-b-[11px] border-l-[8px] border-r-[8px] border-b-emerald-300/90 border-l-transparent border-r-transparent" />
                                                    <div className="relative mt-2 h-12 w-12 overflow-hidden rounded-full border border-white/15 bg-slate-900/90 shadow-[0_0_20px_rgba(16,185,129,0.24)]">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={member.image} alt={member.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}

                                    <motion.div className="absolute left-[50%] top-[18%] h-[62%] w-[1px] bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                                </motion.div>

                                <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center">
                                    <AnimatePresence mode="wait">
                                        {activeMember && (
                                            <motion.div
                                                key={activeMember.name}
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                                                className="rounded-full border border-emerald-400/20 bg-slate-950/85 px-4 py-2 text-[0.68rem] font-mono uppercase tracking-[0.34em] text-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.16)]"
                                            >
                                                {activeMember.role}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
                                    <div className="w-[min(84%,360px)]">
                                        <AnimatePresence mode="wait">{activeMember && renderDetailCard(activeMember)}</AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
