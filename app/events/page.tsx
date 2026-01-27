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
    const [selectedEvent, setSelectedEvent] = useState(upcomingEvents.length > 0 ? upcomingEvents[0] : events[0]);
    const [showPastEvents, setShowPastEvents] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

    const displayEvents = showPastEvents ? pastEvents : upcomingEvents.length > 0 ? upcomingEvents : events.slice(0, 4);

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
                                className={`px-6 py-3 rounded-lg font-display font-bold transition-all duration-300 ${!showPastEvents
                                    ? "bg-primary text-black"
                                    : "bg-surface border border-white/10 text-gray-400 hover:text-white"
                                    }`}
                            >
                                Upcoming Events
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
                    </motion.div>
                </div>

                {/* Events Grid */}
                <div className="max-w-7xl mx-auto px-4 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setSelectedEvent(event)}
                                onMouseEnter={() => setHoveredEvent(event)}
                                onMouseLeave={() => setHoveredEvent(null)}
                                className={`cursor-pointer group relative bg-surface border rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${selectedEvent.id === event.id
                                    ? 'border-primary shadow-[0_0_30px_rgba(0,230,118,0.3)]'
                                    : 'border-white/10 hover:border-primary/50'
                                    }`}
                            >
                                {/* Event Type Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="px-3 py-1 bg-primary text-black text-xs font-bold font-display uppercase rounded-full">
                                        {event.type}
                                    </span>
                                </div>

                                {/* Status Badge */}
                                {event.status === "Completed" && (
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="px-3 py-1 bg-gray-600 text-white text-xs font-bold font-display uppercase rounded-full">
                                            Completed
                                        </span>
                                    </div>
                                )}

                                {/* Image/Gradient Background */}
                                <div className="h-48 bg-gradient-to-br from-primary/20 to-purple-600/20 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-xl font-bold font-display text-white line-clamp-2">
                                            {event.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Event Info */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="line-clamp-1">{event.location}</span>
                                    </div>
                                </div>

                                {/* Hover Overlay with Full Details */}
                                <AnimatePresence>
                                    {hoveredEvent?.id === event.id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 bg-black/95 backdrop-blur-sm p-4 flex flex-col justify-between z-20"
                                        >
                                            <div>
                                                <h4 className="text-lg font-bold font-display text-primary mb-2">
                                                    {event.title}
                                                </h4>
                                                <p className="text-sm text-gray-300 line-clamp-6 mb-3">
                                                    {event.description}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Calendar className="w-3 h-3 text-primary" />
                                                    <span>{event.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <MapPin className="w-3 h-3 text-primary" />
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Users className="w-3 h-3 text-primary" />
                                                    <span>{event.attendees} attendees</span>
                                                </div>
                                                <div className="pt-2">
                                                    <span className="text-xs text-primary font-mono">
                                                        Click to view full details →
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Hover Indicator */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Selected Event Details */}
                <div className="max-w-5xl mx-auto px-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedEvent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            {/* Header with gradient */}
                            <div className="relative h-64 bg-gradient-to-br from-primary/30 to-purple-600/30 overflow-hidden">
                                <div className="absolute inset-0 bg-black/50"></div>
                                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                                        <span className="px-4 py-2 bg-primary text-black text-sm font-bold font-display uppercase rounded-full">
                                            {selectedEvent.type}
                                        </span>
                                        <span className={`px-4 py-2 backdrop-blur-sm text-white text-sm font-bold font-display rounded-full border ${selectedEvent.status === "Completed"
                                            ? "bg-gray-600/50 border-gray-500"
                                            : "bg-white/10 border-white/20"
                                            }`}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-bold font-display text-white">
                                        {selectedEvent.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 md:p-12">
                                {/* Event Meta Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-mono uppercase">Date</p>
                                            <p className="text-white font-display font-bold">{selectedEvent.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-mono uppercase">Time</p>
                                            <p className="text-white font-display font-bold">{selectedEvent.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-mono uppercase">Attendees</p>
                                            <p className="text-white font-display font-bold">{selectedEvent.attendees}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-3 mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-mono uppercase mb-1">Location</p>
                                        <p className="text-white font-display text-lg">{selectedEvent.location}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-display font-bold mb-4">About this Event</h3>
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
                                            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] font-display text-lg"
                                        >
                                            View on FOSS United <ExternalLink size={20} />
                                        </a>
                                    )}
                                    {selectedEvent.status !== "Completed" && (
                                        <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10 font-display">
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
