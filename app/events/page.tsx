"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { Navbar } from "../../components/Navbar";

// Mock Data
const events = [
    {
        id: 1,
        title: "Linux Installation party",
        date: "Oct 15, 2024",
        location: "Lab 304, CS Dept",
        description: "Bring your laptops! We will help you dual-boot Linux alongside Windows. Learn the basics of partitioning, drivers, and choosing the right distro for you.",
        type: "Workshop",
        rotation: "rotate-2",
    },
    {
        id: 2,
        title: "HackDay 2026 CEV",
        date: "Nov 5-6, 2024",
        location: "Main Auditorium",
        description: "A 24-hour hackathon focused on building open source tools. Food and swag provided. Teams of 2-4 allowed. Prizes worth $500.",
        type: "Hackathon",
        rotation: "-rotate-1",
    },
    {
        id: 3,
        title: "Git & Sit",
        date: "Nov 20, 2024",
        location: "Seminar Hall A",
        description: "Stop emailing zip files! Learn version control, branching strategies, and how to make your first Pull Request.",
        type: "Workshop",
        rotation: "rotate-3",
    },
    {
        id: 4,
        title: "Introduction to FOSS",
        date: "Dec 10, 2024",
        location: "mini auditorium",
        description: "Guest speakers from Red Hat and Mozilla talk about the future of open web standards.",
        type: "Talk",
        rotation: "-rotate-2",
    },
];

export default function EventsPage() {
    const [selectedEvent, setSelectedEvent] = useState(events[0]);

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-black">
            <Navbar />

            <main className="pt-20 pb-10">

                {/* Corkboard Section */}
                <div className="h-[60vh] w-full relative overflow-hidden bg-[#111] border-b border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 hacker-grid opacity-30 pointer-events-none" />

                    <div className="relative z-10 container mx-auto h-full flex items-center justify-center p-4">
                        <div className="flex flex-wrap gap-8 justify-center items-center w-full max-w-6xl">
                            {events.map((event) => (
                                <motion.div
                                    key={event.id}
                                    layoutId={`event-${event.id}`}
                                    onClick={() => setSelectedEvent(event)}
                                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                                    className={`cursor-pointer bg-white text-black w-64 h-80 p-4 shadow-xl flex flex-col justify-between transform transition-transform duration-300 ${event.rotation} hover:shadow-primary/50 relative paper-texture`}
                                >
                                    {/* Pin */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_#00e676]" />

                                    <div>
                                        <span className="inline-block px-2 py-1 bg-black text-white text-xs font-bold font-display uppercase mb-2">
                                            {event.type}
                                        </span>
                                        <h3 className="text-2xl font-bold leading-tight font-body">
                                            {event.title}
                                        </h3>
                                    </div>

                                    <div className="border-t-2 border-dashed border-black/20 pt-4">
                                        <p className="font-display font-medium text-sm flex items-center gap-1">
                                            <Calendar size={14} /> {event.date}
                                        </p>
                                        <p className="font-display text-sm text-gray-600 flex items-center gap-1 mt-1">
                                            <MapPin size={14} /> {event.location}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedEvent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-surface border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-xl"
                        >
                            <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-bold font-display text-primary mb-2">
                                        {selectedEvent.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-4 text-gray-400 mb-6 font-display text-sm">
                                        <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                            <Calendar className="w-4 h-4 text-primary" /> {selectedEvent.date}
                                        </span>
                                        <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                            <MapPin className="w-4 h-4 text-primary" /> {selectedEvent.location}
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-300 leading-relaxed font-body max-w-2xl">
                                        {selectedEvent.description}
                                    </p>
                                </div>

                                <button className="whitespace-nowrap flex items-center gap-2 px-8 py-4 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,118,0.4)]">
                                    RSVP Now <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </main>
        </div>
    );
}
