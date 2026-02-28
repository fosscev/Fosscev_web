"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useEffect, useState, useRef, Suspense, lazy } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";

// Lazy-load the heavy Three.js scene — only on client
const HeroScene = lazy(() => import("./HeroScene"));

// ─── Subtle background ────────────────────────────────────────────────────────
function Background() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 60% at 50% 48%, rgba(0,230,118,0.05) 0%, transparent 68%)",
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(0,230,118,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.025) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 110% 90% at 50% 50%, transparent 38%, rgba(5,5,5,0.96) 100%)",
                }}
            />
        </div>
    );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
    { value: "10+", label: "Active Events" },
    { value: "200+", label: "Members" },
    { value: "100%", label: "Open Source" },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef);
    const mouseRef = useRef({ x: 0, y: 0 });
    const [mouseSmooth, setMouseSmooth] = useState({ x: 0, y: 0 });
    const [isClient, setIsClient] = useState(false);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const yText = useTransform(scrollYProgress, [0, 1], [0, 260]);
    const opacityFade = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
    const scaleCanvas = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

    useEffect(() => { setIsClient(true); }, []);

    // Smooth mouse via RAF
    useEffect(() => {
        let rafId: number;
        let cx = 0, cy = 0;
        const lp = (a: number, b: number, t: number) => a + (b - a) * t;
        const tick = () => {
            cx = lp(cx, mouseRef.current.x, 0.08);
            cy = lp(cy, mouseRef.current.y, 0.08);
            setMouseSmooth({ x: cx, y: cy });
            rafId = requestAnimationFrame(tick);
        };
        tick();
        const onMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMove);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove", onMove);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        >
            <Background />

            {/* 3D Canvas — full bleed, fades in on its own when WebGL starts */}
            {isClient && (
                <motion.div
                    className="absolute inset-0 z-10"
                    style={{ scale: scaleCanvas, opacity: opacityFade }}
                >
                    <Suspense fallback={null}>
                        <HeroScene mouse={mouseRef} isInView={isInView} />
                    </Suspense>
                </motion.div>
            )}

            {/* ── Hero Text ── */}
            <motion.div
                style={{ y: yText, opacity: opacityFade }}
                className="relative z-30 flex flex-col items-center justify-center flex-1 px-4 pt-20 pb-10"
            >
                {/* Main heading */}
                <motion.div
                    initial={{ opacity: 0, y: 44 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                    style={{ x: mouseSmooth.x * -9, y: mouseSmooth.y * -9 }}
                >
                    <h1 className="font-display font-bold leading-[1.02] tracking-tight">
                        {/* FOSS — gradient green/cyan */}
                        <span
                            className="block text-5xl sm:text-7xl md:text-8xl lg:text-[8rem]"
                            style={{
                                background: "linear-gradient(135deg, #00e676 0%, #00ffcc 45%, #00b4d8 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                filter: "drop-shadow(0 0 48px rgba(0,230,118,0.3))",
                            }}
                        >
                            FOSS
                        </span>

                        {/* CLUB — bright white */}
                        <span
                            className="block text-5xl sm:text-7xl md:text-8xl lg:text-[8rem]"
                            style={{ color: "#f8f8f8" }}
                        >
                            CLUB
                        </span>

                        {/* CE Vadakara — ivory/warm white, clearly readable */}
                        <span
                            className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mt-3"
                            style={{ color: "#e8e4dc" }}
                        >
                            CE Vadakara
                        </span>
                    </h1>
                </motion.div>

                {/* Tagline — bright enough to read on dark bg */}
                <motion.p
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 text-base sm:text-lg md:text-xl font-body max-w-lg mx-auto leading-relaxed text-center px-2"
                    style={{ color: "#d4d0cb", x: mouseSmooth.x * -4, y: mouseSmooth.y * -4 }}
                >
                    Code. Collaborate. Create.{" "}
                    <span style={{ color: "#a09a94" }}>
                        Building the future of open source engineering through innovation and community.
                    </span>
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-10 flex flex-col sm:flex-row gap-4"
                    style={{ x: mouseSmooth.x * -2.5, y: mouseSmooth.y * -2.5 }}
                >
                    <a
                        href="/events"
                        className="group relative overflow-hidden px-8 py-3.5 rounded-xl font-semibold text-black transition-transform duration-200 hover:scale-105 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg, #00e676, #00b4d8)",
                            boxShadow: "0 0 28px rgba(0,230,118,0.28), 0 4px 12px rgba(0,0,0,0.3)",
                        }}
                    >
                        <span className="relative z-10">Explore Events →</span>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                    </a>

                    <a
                        href={SOCIAL_LINKS.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                            background: "rgba(0,230,118,0.07)",
                            border: "1px solid rgba(0,230,118,0.28)",
                            color: "#00e676",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(0,230,118,0.13)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px rgba(0,230,118,0.18)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(0,230,118,0.07)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        }}
                    >
                        Join Community
                    </a>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.45 }}
                    transition={{ delay: 1.3 }}
                    className="mt-16 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] font-mono tracking-[0.25em] uppercase" style={{ color: "#555" }}>
                        Scroll
                    </span>
                    <div
                        className="w-px h-10 rounded-full relative overflow-hidden"
                        style={{ background: "rgba(0,230,118,0.1)" }}
                    >
                        <motion.div
                            className="absolute top-0 left-0 w-full rounded-full"
                            style={{ background: "#00e676", height: "35%" }}
                            animate={{ y: [0, 28, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>
            </motion.div>

            {/* Stats bar */}
            <motion.div
                style={{ opacity: opacityFade }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-30 w-full max-w-3xl mx-auto px-4 pb-12"
            >
                <div
                    className="grid grid-cols-3 py-5 rounded-2xl"
                    style={{
                        background: "rgba(5,5,5,0.52)",
                        border: "1px solid rgba(0,230,118,0.1)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                    }}
                >
                    {STATS.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="flex flex-col items-center px-4"
                            style={{
                                borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            }}
                        >
                            <span
                                className="text-3xl md:text-4xl font-display font-light tracking-tight"
                                style={{ color: "#00e676" }}
                            >
                                {stat.value}
                            </span>
                            <span className="mt-1 text-xs font-mono uppercase tracking-wider text-center" style={{ color: "#666" }}>
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
