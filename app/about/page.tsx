"use client";

import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { Github, Linkedin, Mail, Instagram, ArrowUpRight, Users, Target, Lightbulb, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/lib/constants";
import { WhatWeDo } from "../../components/WhatWeDo";

export default function AboutPage() {
    return (
        <div className="relative min-h-screen bg-background text-white selection:bg-primary selection:text-black overflow-hidden">


            <div className="relative z-10">
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

                    {/* Mission & Vision */}
                    <div className="grid md:grid-cols-2 gap-12 mb-32">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative bg-surface/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 hover:border-primary/40 transition-all">
                                <Target className="w-12 h-12 text-primary mb-6" />
                                <h2 className="text-3xl font-display font-bold mb-4">Our Mission</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    To foster a vibrant community of developers, designers, and tech enthusiasts who believe in the power of Free and Open Source Software. We aim to democratize technology education and create opportunities for everyone to contribute to the global open-source ecosystem.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative bg-surface/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 hover:border-primary/40 transition-all">
                                <Lightbulb className="w-12 h-12 text-primary mb-6" />
                                <h2 className="text-3xl font-display font-bold mb-4">Our Vision</h2>
                                <p className="text-gray-400 leading-relaxed">
                                    To become the leading FOSS community in Kerala, inspiring the next generation of open-source contributors. We envision a future where every student has the skills, confidence, and platform to build impactful solutions using open-source technologies.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* What We Do Component */}
                    <div className="mb-32">
                        <WhatWeDo />
                    </div>

                    {/* Connect Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-display font-black mb-8">
                            Connect With <span className="text-primary">Us</span>
                        </h2>
                        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
                            Join our community on social media and stay updated with the latest events, workshops, and opportunities.
                        </p>
                        <div className="flex justify-center gap-6 flex-wrap">
                            {[
                                { icon: Github, href: SOCIAL_LINKS.github, label: "GitHub" },
                                { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
                                { icon: Instagram, href: SOCIAL_LINKS.instagram, label: "Instagram" },
                                { icon: Mail, href: `mailto:${SOCIAL_LINKS.email}`, label: "Email" }
                            ].map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className="group relative bg-surface/50 backdrop-blur-sm border border-white/10 hover:border-primary/50 rounded-xl p-6 transition-all hover:scale-105"
                                >
                                    <social.icon className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-3" />
                                    <p className="text-sm font-mono text-gray-400 group-hover:text-primary transition-colors">{social.label}</p>
                                    <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.section>
                </main>

                <Footer />
            </div>
        </div>
    );
}
