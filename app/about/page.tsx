"use client";

import { Navbar } from "../../components/Navbar";
import { Github, Linkedin, Mail, Instagram, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-black">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-20 pt-32">
                {/* Mission Section */}
                <section className="grid md:grid-cols-2 gap-12 mb-32 items-start">

                    {/* Left: README.md Style Vision */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-surface border border-white/10 rounded-xl overflow-hidden"
                    >
                        <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex justify-between items-center">
                            <span className="font-display text-sm text-gray-400">README.md</span>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">MD</span>
                                <span className="text-gray-500 text-xs">3.2 KB</span>
                            </div>
                        </div>
                        <div className="p-8 font-display text-sm md:text-base leading-relaxed text-gray-300">
                            <h1 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
                                # Vision Statement
                            </h1>
                            <p className="mb-4">
                                We envision a world where technology is <strong className="text-primary tick-text">open</strong>, <strong className="text-primary tick-text">inclusive</strong>, and <strong className="text-primary tick-text">accessible</strong> to everyone.
                            </p>
                            <p className="mb-4">
                                ## Core Values
                                <br />
                                1. <span className="text-yellow-400">Community First</span>: Collaboration over competition.
                                <br />
                                2. <span className="text-yellow-400">Knowledge Sharing</span>: Free education for all.
                                <br />
                                3. <span className="text-yellow-400">Innovation</span>: Pushing boundaries with open code.
                            </p>
                            <div className="p-4 bg-white/5 rounded border-l-2 border-primary mt-6">
                                <span className="text-gray-400 italic">"In a world of proprietary walls, be the open door."</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Goals List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-display font-bold text-white mb-8">
                            <span className="text-primary">./</span>Goals
                        </h2>
                        {[
                            "Host 10+ Workshops yearly",
                            "Contribute to 50+ Upstream Repos",
                            "Build a Campus Mesh Network",
                            "Mentor 200+ Students"
                        ].map((goal, i) => (
                            <div key={i} className="flex items-center gap-4 group cursor-default">
                                <span className="text-primary font-bold text-xl font-display">[ ]</span>
                                <span className="text-xl group-hover:text-primary transition-colors">{goal}</span>
                            </div>
                        ))}

                        <div className="flex items-center gap-4 group cursor-default">
                            <span className="text-primary font-bold text-xl font-display">[x]</span>
                            <span className="text-xl text-gray-500 line-through">Launch Community Website</span>
                        </div>
                    </motion.div>
                </section>

                {/* Social Grid */}
                <section>
                    <h2 className="text-center text-3xl font-display font-bold mb-12">
                        Connect with <span className="text-primary">Us</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: "GitHub", icon: Github, link: "#", color: "hover:border-[#fff]" },
                            { name: "LinkedIn", icon: Linkedin, link: "#", color: "hover:border-[#0077b5]" },
                            { name: "Instagram", icon: Instagram, link: "#", color: "hover:border-[#E1306C]" },
                            { name: "Email", icon: Mail, link: "mailto:hello@foss.edu", color: "hover:border-primary" },
                        ].map((social, i) => (
                            <a
                                key={i}
                                href={social.link}
                                className={`group p-8 bg-surface border border-white/10 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-surface-highlight transition-all duration-300 ${social.color} hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]`}
                            >
                                <social.icon strokeWidth={1.5} className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors duration-300" />
                                <div className="flex items-center gap-2">
                                    <span className="font-display font-bold text-lg text-gray-300 group-hover:text-white">{social.name}</span>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
