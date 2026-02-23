"use client";

import { motion } from "framer-motion";
import { Users, Target, Heart } from "lucide-react";

export function WhatWeDo() {
    return (
        <section className="py-24 relative overflow-hidden bg-background">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-7xl mx-auto px-4 text-center mb-16"
            >
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-mono text-gray-300">
                    <span className="text-primary mr-2">●</span> Impact
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
                    What We <span className="text-primary">Do</span>
                </h2>
                <p className="mt-6 text-xl text-gray-400 font-body max-w-2xl mx-auto leading-relaxed">
                    Empowering students to transition from participants to open-source contributors through hands-on collaboration.
                </p>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 z-20 relative">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[320px]">
                    {/* Block 1: Large Featured */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="md:col-span-8 relative group rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-surface to-background"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        {/* Abstract Background Design */}
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" style={{
                            backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(0, 230, 118, 0.4) 0%, transparent 60%)'
                        }}></div>

                        <div className="relative h-full p-8 md:p-12 flex flex-col justify-end">
                            <Users className="w-14 h-14 text-primary mb-6 md:mb-8 opacity-90 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-md">Workshops & Events</h3>
                            <p className="text-lg md:text-xl text-gray-400 group-hover:text-gray-200 transition-colors duration-300 max-w-xl leading-relaxed">
                                Curated hands-on workshops, 24-hour hackathons, and deep-dive technical talks featuring industry professionals and open-source foundation maintainers.
                            </p>
                        </div>
                    </motion.div>

                    {/* Block 2: Tall Right */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="md:col-span-4 md:row-span-2 relative group rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-b from-surface to-black/50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="absolute inset-0 hacker-grid opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>

                        <div className="relative h-full p-8 md:p-12 flex flex-col h-full bg-black/20 group-hover:bg-transparent transition-colors duration-500">
                            <Target className="w-14 h-14 text-primary mb-auto opacity-90 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />

                            <div className="mt-8">
                                <h3 className="text-3xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-md">Skill<br />Development</h3>
                                <p className="text-lg text-gray-400 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                                    Structured, mentor-led learning paths covering Git architecture, Linux administration, full-stack web engineering, and navigating your first pull requests in major open-source repositories.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Block 3: Bottom Left Wide */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        className="md:col-span-8 relative group rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-tr from-surface to-black/50 flex flex-col md:flex-row items-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="p-8 md:p-12 flex-1 relative z-10 w-full">
                            <Heart className="w-12 h-12 text-primary mb-6 opacity-90 group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500" />
                            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-md">Community Building</h3>
                            <p className="text-gray-400 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed max-w-lg">
                                Fusing a supportive environment where seasoned developers and beginners collaborate daily. We build side-projects, share knowledge peer-to-peer, and grow as a collective unit.
                            </p>
                        </div>

                        {/* Decorative side element */}
                        <div className="hidden md:block w-1/3 h-full relative border-l border-white/5 bg-gradient-to-br from-black/20 to-transparent flex items-center justify-center pointer-events-none">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle at center, rgba(0, 230, 118, 0.2) 2px, transparent 2px)',
                                backgroundSize: '20px 20px',
                                opacity: 0.3
                            }}></div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
