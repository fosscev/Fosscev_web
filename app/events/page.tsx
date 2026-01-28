"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Clock, Users, ExternalLink } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { events, getUpcomingEvents, getPastEvents, Event } from "@/data/events";

export default function EventsPage() {
    const upcomingEvents = getUpcomingEvents();
    const pastEvents = getPastEvents();

    // If no upcoming events, show past events by default
    const hasUpcomingEvents = upcomingEvents.length > 0;
    const [showPastEvents, setShowPastEvents] = useState(!hasUpcomingEvents);
    const [selectedEvent, setSelectedEvent] = useState(
        hasUpcomingEvents ? upcomingEvents[0] : (pastEvents.length > 0 ? pastEvents[0] : events[0])
    );
    const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

    const displayEvents = showPastEvents ? pastEvents : upcomingEvents;

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-black">
            <Navbar />

            <main className="pt-24 pb-10">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-display font-black mb-6 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
                            {showPastEvents ? "Past Events" : "Upcoming Events"}
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            {showPastEvents
                                ? "Relive the amazing moments from our previous events"
                                : "Join us for workshops, hackathons, and talks that will level up your open-source journey"
                            }
                        </p>

                        {/* Toggle Button */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowPastEvents(false)}
                                disabled={!hasUpcomingEvents}
                                className={`px-6 py-3 rounded-lg font-display font-bold transition-all duration-300 ${!showPastEvents
                                    ? "bg-primary text-black"
                                    : hasUpcomingEvents
                                        ? "bg-surface border border-white/10 text-gray-400 hover:text-white"
                                        : "bg-surface border border-white/10 text-gray-600 cursor-not-allowed opacity-50"
                                    }`}
                            >
                                Upcoming Events {!hasUpcomingEvents && "(0)"}
                            </button>
                            <button
                                onClick={() => setShowPastEvents(true)}
                                className={`px-6 py-3 rounded-lg font-display font-bold transition-all duration-300 ${showPastEvents
                                    ? "bg-primary text-black"
                                    : "bg-surface border border-white/10 text-gray-400 hover:text-white"
                                    }`}
                            >
                                Past Events ({pastEvents.length})
                            </button>
                        </div>

                        {/* No Upcoming Events Message */}
                        {!hasUpcomingEvents && !showPastEvents && (
                            <div className="mt-8 p-6 bg-surface border border-white/10 rounded-xl text-center">
                                <p className="text-gray-400 text-lg">
                                    No upcoming events at the moment. Check out our past events below!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Events Grid - Dark Pinboard Style */}
                <div className="max-w-7xl mx-auto px-4 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {displayEvents.map((event, index) => {
                            // Random rotation for pinboard effect
                            const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-3'];
                            const rotation = rotations[index % rotations.length];
                            const isSelected = selectedEvent.id === event.id;

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedEvent(event)}
                                    onMouseEnter={() => setHoveredEvent(event)}
                                    onMouseLeave={() => setHoveredEvent(null)}
                                    className={`cursor-pointer group relative md:${rotation} transition-all duration-300 hover:scale-105 md:hover:scale-110 hover:rotate-0 hover:z-50`}
                                    style={{ transformOrigin: 'top center' }}
                                >
                                    {/* Dark Polaroid Card */}
                                    <div className={`bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-2xl overflow-hidden border transition-all duration-300 ${isSelected
                                        ? 'border-primary shadow-[0_0_40px_rgba(0,230,118,0.5)]'
                                        : 'border-white/10 hover:border-primary/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
                                        }`}>
                                        {/* Pin at the top */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                            <div className="relative">
                                                {/* Pin glow for selected */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-primary rounded-full blur-md animate-pulse"></div>
                                                )}
                                                {/* Pin shadow */}
                                                <div className="absolute inset-0 bg-black/50 rounded-full blur-sm translate-y-1"></div>
                                                {/* Pin head */}
                                                <div className={`relative w-6 h-6 rounded-full shadow-lg border-2 transition-all duration-300 ${isSelected
                                                    ? 'bg-primary border-primary/50 shadow-primary/50'
                                                    : 'bg-gradient-to-br from-gray-700 to-gray-900 border-white/20 group-hover:from-primary/50 group-hover:to-primary/30'
                                                    }`}></div>
                                                {/* Pin needle */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-gray-500 to-gray-700"></div>
                                            </div>
                                        </div>

                                        {/* Event Image/Gradient */}
                                        <div className="h-48 md:h-56 bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20 relative overflow-hidden">
                                            {/* Animated gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 group-hover:from-black/20 group-hover:to-black/40 transition-all duration-300"></div>

                                            {/* Event Type Badge */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className="px-2 md:px-3 py-1 bg-black/80 backdrop-blur-sm text-primary text-xs font-bold font-display uppercase rounded-md shadow-lg border border-primary/30">
                                                    {event.type}
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            {event.status === "Completed" && (
                                                <div className="absolute top-3 left-3 z-10">
                                                    <span className="px-2 md:px-3 py-1 bg-gray-800/90 backdrop-blur-sm text-gray-300 text-xs font-bold font-display uppercase rounded-md shadow-lg border border-white/10">
                                                        Completed
                                                    </span>
                                                </div>
                                            )}

                                            {/* Grid pattern overlay */}
                                            <div className="absolute inset-0 opacity-5" style={{
                                                backgroundImage: 'linear-gradient(rgba(0,230,118,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.3) 1px, transparent 1px)',
                                                backgroundSize: '20px 20px'
                                            }}></div>

                                            {/* Diagonal lines pattern */}
                                            <div className="absolute inset-0 opacity-10" style={{
                                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,230,118,0.1) 10px, rgba(0,230,118,0.1) 20px)'
                                            }}></div>
                                        </div>

                                        {/* Dark info section */}
                                        <div className="bg-gradient-to-b from-gray-900 to-black p-3 md:p-4 pb-4 md:pb-6 border-t border-white/5">
                                            <h3 className="text-base md:text-lg font-bold font-display text-white mb-2 md:mb-3 line-clamp-2 min-h-[2.5rem] md:min-h-[3.5rem] group-hover:text-primary transition-colors">
                                                {event.title}
                                            </h3>

                                            <div className="space-y-1.5 md:space-y-2">
                                                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <Calendar className="w-3 md:w-4 h-3 md:h-4 text-primary flex-shrink-0" />
                                                    <span className="font-mono">{event.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <Clock className="w-3 md:w-4 h-3 md:h-4 text-primary flex-shrink-0" />
                                                    <span className="font-mono">{event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <MapPin className="w-3 md:w-4 h-3 md:h-4 text-primary flex-shrink-0" />
                                                    <span className="line-clamp-1 font-mono text-xs">{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    <Users className="w-3 md:w-4 h-3 md:h-4 text-primary flex-shrink-0" />
                                                    <span className="font-mono">{event.attendees}</span>
                                                </div>
                                            </div>

                                            {/* Description snippet */}
                                            <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-white/5">
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Neon tape effect on corners (visible on hover) */}
                                        <div className="absolute top-0 right-0 w-16 md:w-20 h-6 md:h-8 bg-gradient-to-br from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rotate-45 translate-x-4 md:translate-x-6 -translate-y-2 md:-translate-y-3 shadow-lg backdrop-blur-sm border border-primary/20"></div>
                                        <div className="absolute bottom-20 md:bottom-24 left-0 w-16 md:w-20 h-6 md:h-8 bg-gradient-to-br from-purple-500/20 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -rotate-45 -translate-x-4 md:-translate-x-6 shadow-lg backdrop-blur-sm border border-purple-500/20"></div>

                                        {/* Glowing edge effect on hover */}
                                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                            style={{
                                                background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.1), transparent)',
                                                animation: 'shimmer 2s infinite'
                                            }}
                                        ></div>
                                    </div>

                                    {/* Click indicator */}
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                                        <span className="text-xs text-primary font-mono whitespace-nowrap flex items-center gap-1">
                                            Click to view details <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Event Details - Dark Theme */}
                <div className="max-w-5xl mx-auto px-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedEvent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gradient-to-br from-gray-900 to-black border border-primary/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,230,118,0.2)]"
                        >
                            {/* Header with gradient and patterns */}
                            <div className="relative h-64 bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20 overflow-hidden">
                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40"></div>

                                {/* Grid pattern */}
                                <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: 'linear-gradient(rgba(0,230,118,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.3) 1px, transparent 1px)',
                                    backgroundSize: '30px 30px'
                                }}></div>

                                {/* Diagonal pattern */}
                                <div className="absolute inset-0 opacity-5" style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(0,230,118,0.2) 15px, rgba(0,230,118,0.2) 30px)'
                                }}></div>

                                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                                        <span className="px-4 py-2 bg-black/80 backdrop-blur-sm text-primary text-sm font-bold font-display uppercase rounded-lg border border-primary/30 shadow-lg">
                                            {selectedEvent.type}
                                        </span>
                                        <span className={`px-4 py-2 backdrop-blur-sm text-white text-sm font-bold font-display rounded-lg border shadow-lg ${selectedEvent.status === "Completed"
                                            ? "bg-gray-800/80 border-gray-600/50"
                                            : "bg-white/10 border-white/20"
                                            }`}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold font-display text-white drop-shadow-lg">
                                        {selectedEvent.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12 bg-gradient-to-b from-gray-900/50 to-black">
                                {/* Event Meta Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-mono uppercase mb-1">Date</p>
                                            <p className="text-white font-display font-bold">{selectedEvent.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all">
                                            <Clock className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-mono uppercase mb-1">Time</p>
                                            <p className="text-white font-display font-bold">{selectedEvent.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-mono uppercase mb-1">Attendees</p>
                                            <p className="text-white font-display font-bold">{selectedEvent.attendees}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-3 mb-8 p-5 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:border-primary/40 transition-all">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-mono uppercase mb-1">Location</p>
                                        <p className="text-white font-display text-lg">{selectedEvent.location}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-8 p-6 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10">
                                    <h3 className="text-2xl font-display font-bold mb-4 text-primary">About this Event</h3>
                                    <p className="text-lg text-gray-300 leading-relaxed">
                                        {selectedEvent.description}
                                    </p>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex gap-4 flex-wrap">
                                    {selectedEvent.link && (
                                        <a
                                            href={selectedEvent.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,230,118,0.6)] font-display text-lg group"
                                        >
                                            View on FOSS United
                                            <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    )}
                                    {selectedEvent.status !== "Completed" && (
                                        <button className="px-8 py-4 bg-gradient-to-br from-white/10 to-white/5 text-white font-bold rounded-lg hover:from-white/15 hover:to-white/10 transition-all duration-300 border border-white/20 hover:border-primary/30 font-display">
                                            Share Event
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
}
