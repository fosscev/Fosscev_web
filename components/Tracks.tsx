"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Cpu, Code2, Globe } from "lucide-react";

const tracks = [
    {
        id: 1,
        title: "LINUX WORKSHOPS",
        description: "Master the command line, kernel development, and system administration. From beginner basics to advanced styling.",
        icon: <Terminal className="w-12 h-12" />,
    },
    {
        id: 2,
        title: "HACKATHONS",
        description: "24-48 hour coding marathons. Build insane projects, win prizes, and collaborate with the best minds.",
        icon: <Cpu className="w-12 h-12" />,
    },
    {
        id: 3,
        title: "WEB DEVELOPMENT",
        description: "Full-stack modern web dev. React, Next.js, Rust, and deploying on the edge. Build the future of the web.",
        icon: <Globe className="w-12 h-12" />,
    },
    {
        id: 4,
        title: "OPEN SOURCE CONTRIB",
        description: "Learn how to contribute to real-world projects. Git, PRs, and navigating large codebases.",
        icon: <Code2 className="w-12 h-12" />,
    },
];

export function Tracks() {
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    return (
        <section className="py-20 relative border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-16 tracking-tighter uppercase">
                    Focus Areas_
                </h2>

                <div className="flex flex-col border border-white/20">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="relative group border-b border-white/20 last:border-b-0"
                            onMouseEnter={() => setHoveredId(track.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <motion.div
                                className={`p-8 md:p-12 transition-colors duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8 ${hoveredId === track.id ? "bg-primary text-black" : "bg-transparent text-white"
                                    }`}
                                layout
                            >
                                <div className="flex items-center gap-6">
                                    <span className={`font-mono text-xl ${hoveredId === track.id ? "text-black" : "text-primary"}`}>0{track.id}</span>
                                    <h3 className="text-3xl md:text-5xl font-bold font-display uppercase tracking-tight">{track.title}</h3>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{
                                        opacity: hoveredId === track.id ? 1 : 0,
                                        height: hoveredId === track.id ? "auto" : 0
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden md:max-w-xl"
                                >
                                    <p className={`text-lg md:text-xl font-medium leading-relaxed ${hoveredId === track.id ? "text-black/80" : "text-gray-400"}`}>
                                        {track.description}
                                    </p>
                                </motion.div>

                                <div className={`hidden md:block transition-transform duration-300 ${hoveredId === track.id ? "rotate-45" : ""}`}>
                                    {/* Arrow Icon */}
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
