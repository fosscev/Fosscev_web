"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const events = [
    {
        year: "2023",
        date: "FEB 10",
        title: "Community Launch",
        description: "The official inception of the FOSS Community at CEV. Over 100 students joined the first meet.",
    },
    {
        year: "2023",
        date: "MAR 25",
        title: "Linux Installation Fest",
        description: "Massive installation drive. 50+ laptops dual-booted with Ubuntu and Fedora in a single day.",
    },
    {
        year: "2023",
        date: "AUG 15",
        title: "Freedom Hackathon",
        description: "24-hour hackathon celebrating software freedom. 15 teams, 3 winners, infinite coffee.",
    },
    {
        year: "2024",
        date: "JAN 20",
        title: "Git Workshop",
        description: "Advanced Git & GitHub flows. Understanding PRs, merges, and resolving heavy conflicts.",
    },
];

const EventCard = ({ event, index }: { event: any; index: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className={`flex md:contents ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
        >
            <div className={`col-start-5 col-end-6 md:mx-auto relative mr-10 md:mr-0
                ${index % 2 === 0 ? "" : "md:hidden"} 
            `}> {/* Vertical Line Dot */}
                <div className="h-full w-6 flex items-center justify-center">
                    <div className="h-full w-1 bg-white/20 pointer-events-none"></div>
                </div>
                <div className="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-primary shadow-[0_0_15px_#00e676]"></div>
            </div>

            <div className={`col-start-1 col-end-5 p-4 rounded-xl my-4 ml-auto w-full md:w-auto ${index % 2 !== 0 ? "col-start-6 col-end-10 mr-auto" : "md:text-right"}`}>
                <div className={`bg-surface p-6 border border-white/10 hover:border-primary/50 transition-colors duration-300 relative group overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl text-white group-hover:text-primary transition-colors">
                        {event.year}
                    </div>
                    <span className="text-primary font-mono text-lg font-bold mb-2 block">{event.date}</span>
                    <h3 className="text-2xl font-bold text-white mb-2 font-display">{event.title}</h3>
                    <p className="text-gray-400">{event.description}</p>
                </div>
            </div>

            <div className={`col-start-5 col-end-6 md:mx-auto relative mr-10 md:mr-0 hidden md:flex items-center justify-center`}>
                <div className="h-full w-px bg-gradient-to-b from-primary/50 via-white/20 to-primary/50"></div>
                <div className="w-4 h-4 absolute top-1/2 -mt-2 bg-black border-2 border-primary rounded-none rotate-45 z-10"></div>
            </div>

            {/* Spacer for alternating layout */}
            {index % 2 === 0 && <div className="col-start-6 col-end-10 mr-auto w-full hidden md:block"></div>}
            {index % 2 !== 0 && <div className="col-start-1 col-end-5 ml-auto w-full hidden md:block"></div>}

        </motion.div>
    );
}

export function Timeline() {
    return (
        <section className="bg-background py-32 relative overflow-hidden">
            <div className="absolute inset-0 hacker-grid opacity-20 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-24 text-center tracking-tighter uppercase">
                    Timeline_
                </h2>

                <div className="flex flex-col md:grid grid-cols-9 mx-auto p-2 text-white">
                    {events.map((event, index) => (
                        <EventCard key={index} event={event} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
