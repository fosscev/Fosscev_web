"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";

const team = [
    {
        name: "Rishnu Lal N",
        role: "Core Organizer",
        image: "/rish.jpg",
    },
    {
        name: "Hussain Huzefa",
        role: "Co Organizer",
        image: "/huss.jpg",
    },
    {
        name: "Devapriya k",
        role: "CO Organizer",
        image: "/DEVA.jpg",
    },
    {
        name: "Roshith Krishna",
        role: "Finance Lead",
        image: "/ROSH.jpg",
    },
    {
        name: "Anvar Sadath",
        role: "Design Lead",
        image: "/anv.jpg",
    },
    {
        name: "Lakshmi Reji Suresh",
        role: "Women in Lead",
        image: "/LAKSHMII.jpg",
    },
    {
        name: "Rida Waseem",
        role: "Women in Lead",
        image: "/RIDA.jpg",
    },
    {
        name: "Sayanth P",
        role: "Social Lead",
        image: "/say.jpg",
    },
    {
        name: "Ashwandha",
        role: "CO finance Lead",
        image: "/ASHWANDHA.jpg",
    },
    {
        name: "Muhammad Aswlah ",
        role: "Designer",
        image: "/ASWLAH.jpg",
    },
    {
        name: "Fathima P",
        role: "Designer",
        image: "/FATHIMA.jpg",
    },
    {
        name: "Sandra Sunil T",
        role: "Co social Lead",
        image: "/SANDRA.jpg",
    },
    {
        name: "Muhammed Sinan A P",
        role: "content Writer",
        image: "/SINAN.jpg",
    },
    
];

// Triple the array to ensure seamless looping
const marqueeTeam = [...team, ...team, ...team];

export function CoreTeam() {
    return (
        <section className="py-20 overflow-hidden bg-surface/30">
            <div className="max-w-7xl mx-auto px-4 mb-12">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-center">
                    Meet the <span className="text-primary">Core</span>
                </h2>
            </div>

            <div className="relative w-full">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 z-10 bg-linear-to-r from-background to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 z-10 bg-linear-to-l from-background to-transparent pointer-events-none" />

                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-6 md:gap-8 px-4"
                        animate={{ x: ["0%", "-33.33%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 20
                        }}
                    >
                        {marqueeTeam.map((member, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10, scale: 1.02, zIndex: 20 }}
                                className="w-64 md:w-72 shrink-0 group relative bg-surface border border-white/10 rounded-xl overflow-hidden hover:border-primary transition-colors duration-300"
                            >
                                <div className="aspect-square relative overflow-hidden bg-surface-highlight">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="font-display text-primary text-xs opacity-80 p-2 text-center">
                                            01001000 01101001<br />
                                            01000110 01101111<br />
                                            01110011 01110011
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-white/5 bg-surface/80 backdrop-blur-sm">
                                    <h3 className="text-lg font-bold text-white font-display">{member.name}</h3>
                                    <p className="text-primary text-sm font-display mb-3">{member.role}</p>
                                    <div className="flex gap-3">
                                        <Github className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                                        <Linkedin className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                                        <Twitter className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
