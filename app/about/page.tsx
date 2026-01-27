"use client";

import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Github, Linkedin, Mail, Instagram, ArrowUpRight, Users, Target, Lightbulb, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/constants";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-black">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-20 pt-32">
                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-32 text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-display font-black mb-6 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
                        About FOSS Community
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Building a culture of <span className="text-primary font-bold">open collaboration</span>,
                        <span className="text-primary font-bold"> innovation</span>, and
                        <span className="text-primary font-bold"> knowledge sharing</span> at CEV
                    </p>
                </motion.section>

                {/* Mission & Vision Grid */}
                <section className="grid md:grid-cols-2 gap-8 mb-32">
                    {/* Vision Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-surface border border-white/10 rounded-2xl p-8 hover:border-primary transition-all duration-300">
                            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-4">Our Vision</h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                We envision a world where technology is <strong className="text-primary">open</strong>,
                                <strong className="text-primary"> inclusive</strong>, and
                                <strong className="text-primary"> accessible</strong> to everyone.
                                A community where knowledge flows freely and innovation thrives through collaboration.
                            </p>
                        </div>
                    </motion.div>

                    {/* Mission Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-surface border border-white/10 rounded-2xl p-8 hover:border-primary transition-all duration-300">
                            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Lightbulb className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-4">Our Mission</h2>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                To empower students with open-source skills, foster a culture of contribution,
                                and create a vibrant community of developers, designers, and innovators who
                                believe in the power of collaborative development.
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* Core Values */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-32"
                >
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16">
                        Core <span className="text-primary">Values</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Community First",
                                description: "Collaboration over competition. We believe in lifting each other up and growing together.",
                                color: "from-yellow-500/20 to-orange-500/20"
                            },
                            {
                                icon: Heart,
                                title: "Knowledge Sharing",
                                description: "Free education for all. We're committed to making learning accessible to everyone.",
                                color: "from-pink-500/20 to-red-500/20"
                            },
                            {
                                icon: Lightbulb,
                                title: "Innovation",
                                description: "Pushing boundaries with open code. We encourage experimentation and creative problem-solving.",
                                color: "from-blue-500/20 to-cyan-500/20"
                            }
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="relative group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                <div className="relative bg-surface border border-white/10 rounded-2xl p-6 hover:border-primary transition-all duration-300 h-full">
                                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                        <value.icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold mb-3 text-yellow-400">{value.title}</h3>
                                    <p className="text-gray-300 leading-relaxed">{value.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Goals Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-32"
                >
                    <div className="bg-surface border border-white/10 rounded-2xl p-8 md:p-12">
                        <h2 className="text-4xl font-display font-bold mb-8">
                            <span className="text-primary">./</span>Goals for 2024-25
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                "Host 10+ Workshops yearly",
                                "Contribute to 50+ Upstream Repos",
                                "Build a Campus Mesh Network",
                                "Mentor 200+ Students"
                            ].map((goal, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-default p-4 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="text-primary font-bold text-2xl font-display">[ ]</span>
                                    <span className="text-xl group-hover:text-primary transition-colors">{goal}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-4 group cursor-default p-4 rounded-lg bg-primary/5">
                                <span className="text-primary font-bold text-2xl font-display">[✓]</span>
                                <span className="text-xl text-primary font-bold">Launch Community Website</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Quote Section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mb-32"
                >
                    <div className="relative bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-2xl p-8 md:p-12 overflow-hidden">
                        <div className="absolute top-0 right-0 text-[200px] text-primary/5 font-display leading-none">"</div>
                        <p className="text-2xl md:text-3xl font-display italic text-gray-300 relative z-10 max-w-3xl">
                            In a world of proprietary walls, be the <span className="text-primary font-bold">open door</span>.
                        </p>
                        <p className="text-gray-500 mt-4 font-mono">— FOSS Community CEV</p>
                    </div>
                </motion.section>

                {/* Connect Section */}
                <section>
                    <h2 className="text-center text-4xl font-display font-bold mb-12">
                        Connect with <span className="text-primary">Us</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "GitHub", icon: Github, link: SOCIAL_LINKS.github, color: "hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]" },
                            { name: "LinkedIn", icon: Linkedin, link: SOCIAL_LINKS.linkedin, color: "hover:border-[#0077b5] hover:shadow-[0_0_20px_rgba(0,119,181,0.3)]" },
                            { name: "Instagram", icon: Instagram, link: SOCIAL_LINKS.instagram, color: "hover:border-[#E1306C] hover:shadow-[0_0_20px_rgba(225,48,108,0.3)]" },
                            { name: "Email", icon: Mail, link: SOCIAL_LINKS.email, color: "hover:border-primary hover:shadow-[0_0_20px_rgba(0,230,118,0.3)]" },
                        ].map((social, i) => (
                            <motion.a
                                key={i}
                                href={social.link}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                                className={`group p-8 bg-surface border border-white/10 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-surface-highlight transition-all duration-300 ${social.color}`}
                            >
                                <social.icon strokeWidth={1.5} className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors duration-300" />
                                <div className="flex items-center gap-2">
                                    <span className="font-display font-bold text-lg text-gray-300 group-hover:text-white">{social.name}</span>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
