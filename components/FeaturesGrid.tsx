"use client";

import { motion } from "framer-motion";
import { Terminal, Users, Code, Cpu } from "lucide-react";

const features = [
    {
        title: "Linux Workshops",
        description: "Master the command line and server administration.",
        icon: Terminal,
        className: "col-span-1 md:col-span-2 row-span-2",
    },
    {
        title: "Hackathons",
        description: "24-hour coding sprints to solve real-world problems.",
        icon: Code,
        className: "col-span-1 md:col-span-1 row-span-1",
    },
    {
        title: "Open Source",
        description: "Contribute to projects that matter.",
        icon: Users,
        className: "col-span-1 md:col-span-1 row-span-1",
    },
    {
        title: "Tech Talks",
        description: "Learn from industry experts and alumni.",
        icon: Cpu,
        className: "col-span-1 md:col-span-2 row-span-1",
    },
];

export function FeaturesGrid() {
    return (
        <section className="py-20 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className={`group relative overflow-hidden rounded-xl border border-white/10 bg-surface/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-colors duration-300 ${feature.className}`}
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <feature.icon className="w-8 h-8 text-primary mb-4" />
                                <h3 className="text-xl font-display font-bold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 font-body text-sm">
                                    {feature.description}
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <span className="text-primary/50 text-xs font-display group-hover:text-primary transition-colors">
                                    ./read_more
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
