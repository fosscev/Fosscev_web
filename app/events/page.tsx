"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Clock, Users, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { events as localEvents, Event } from "@/data/events";
import { getUpcomingEvents, getPastEvents } from "@/lib/api/events";
import EventsSkeleton from "./loading";

// Helper to format date string like "10 Feb 2026"
const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Map DB event to frontend Event interface
const mapEvent = (dbEvent: any): Event => ({
    id: dbEvent.id, // allow string or number
    title: dbEvent.title,
    date: formatDate(dbEvent.date),
    dateObj: new Date(dbEvent.date),
    time: dbEvent.time,
    location: dbEvent.location,
    description: dbEvent.description,
    type: dbEvent.type,
    attendees: dbEvent.attendees,
    status: dbEvent.status,
    image: dbEvent.image_url,
    poster: dbEvent.image_url, // Use image_url as poster (posters are stored as image_url in DB)
    link: dbEvent.link
});

export default function EventsPage() {
    // Initial state (empty until fetched from DB)
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [pastEvents, setPastEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch from Supabase
    useEffect(() => {
        async function fetchEvents() {
            setIsLoading(true);
            try {
                const [upcomingResponse, pastResponse] = await Promise.all([
                    getUpcomingEvents(),
                    getPastEvents()
                ]);

                if (upcomingResponse.data) {
                    setUpcomingEvents(upcomingResponse.data.map(mapEvent));
                }

                if (pastResponse.data) {
                    setPastEvents(pastResponse.data.map(mapEvent));
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEvents();
    }, []);

    // If no upcoming events, show past events by default
    const hasUpcomingEvents = upcomingEvents.length > 0;
    const [showPastEvents, setShowPastEvents] = useState(false);

    // Update showPastEvents once data is loaded
    useEffect(() => {
        if (!isLoading && !hasUpcomingEvents && pastEvents.length > 0) {
            setShowPastEvents(true);
        }
    }, [isLoading, hasUpcomingEvents, pastEvents.length]);

    const displayEvents = showPastEvents ? pastEvents : upcomingEvents;

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

    // Update selected event when view changes, data loads, or on hash navigation
    useEffect(() => {
        // Handle direct linking to specific event via URL hash
        if (typeof window !== 'undefined' && window.location.hash) {
            const hashId = window.location.hash.substring(1);

            // Check if it's in upcoming
            const inUpcoming = upcomingEvents.find(e => e.id.toString() === hashId);
            if (inUpcoming) {
                setShowPastEvents(false);
                setSelectedEvent(inUpcoming);
                return;
            }

            // Check if it's in past
            const inPast = pastEvents.find(e => e.id.toString() === hashId);
            if (inPast) {
                setShowPastEvents(true);
                setSelectedEvent(inPast);
                return;
            }
        }

        // Default behavior if no hash or hash not found
        if (displayEvents.length > 0 && !selectedEvent) {
            setSelectedEvent(displayEvents[0]);
        } else if (displayEvents.length > 0 && selectedEvent) {
            // Check if selected event is in currently displayed list, if not, select first
            const exists = displayEvents.find(e => e.id === selectedEvent?.id);
            if (!exists) setSelectedEvent(displayEvents[0]);
        }
    }, [displayEvents, upcomingEvents, pastEvents, selectedEvent?.id]);

    // Get the display image for an event card (prefer poster, then image)
    const getEventCardImage = (event: Event): string | undefined => {
        return event.poster || event.image;
    };

    if (isLoading) {
        return <EventsSkeleton />;
    }

    return (
        <div className="relative min-h-screen bg-background text-white selection:bg-primary selection:text-black overflow-hidden">


            <div className="relative z-10">
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
                                        : hasUpcomingEvents
                                            ? "bg-surface border border-white/10 text-gray-400 hover:text-white"
                                            : "bg-surface border border-white/10 text-gray-600 opacity-70"
                                        }`}
                                >
                                    Upcoming Events ({upcomingEvents.length})
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
                                const isSelected = selectedEvent?.id === event.id;
                                const cardImage = getEventCardImage(event);

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => setSelectedEvent(event)}
                                        onMouseEnter={() => setHoveredEvent(event)}
                                        onMouseLeave={() => setHoveredEvent(null)}
                                        className="cursor-pointer group relative transition-all duration-500 hover:-translate-y-2"
                                    >
                                        {/* Modern Glass Card */}
                                        <div className={`bg-surface/40 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-500 h-full flex flex-col ${isSelected
                                            ? 'border-primary shadow-[0_0_30px_rgba(0,230,118,0.2)]'
                                            : 'border-white/5 hover:border-primary/40 hover:bg-surface/60 hover:shadow-2xl'
                                            }`}>

                                            {/* Event Poster Image */}
                                            <div className="h-48 md:h-56 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden shrink-0">
                                                {/* Display poster/image if available */}
                                                {cardImage ? (
                                                    <Image
                                                        src={cardImage}
                                                        alt={event.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                ) : null}

                                                {/* Animated gradient overlay */}
                                                <div className={`absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 group-hover:from-black/20 group-hover:to-black/40 transition-all duration-300 ${cardImage ? 'bg-black/30' : ''}`}></div>

                                                {/* Event Type Badge */}
                                                <div className="absolute top-3 right-3 z-10">
                                                    <span className="px-2 md:px-3 py-1 bg-black/80 backdrop-blur-sm text-primary text-xs font-bold font-display uppercase rounded-md shadow-lg border border-primary/30">
                                                        {event.type}
                                                    </span>
                                                </div>

                                                {event.status === "Completed" ? (
                                                    <div className="absolute top-3 left-3 z-10">
                                                        <span className="px-2 md:px-3 py-1 bg-black/60 backdrop-blur-md text-gray-400 text-xs font-bold font-mono uppercase rounded-md border border-white/10">
                                                            Completed
                                                        </span>
                                                    </div>
                                                ) : (event.status === "Upcoming" || event.status === "Registration Open") && (
                                                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2 md:px-3 py-1 bg-black/60 backdrop-blur-md border border-primary/20 rounded-md">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                                        </span>
                                                        <span className="text-primary text-xs font-bold font-mono uppercase">
                                                            {event.status}
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

                                            {/* Minimal info section */}
                                            <div className="p-4 md:p-6 border-t border-white/5 flex flex-col flex-1">
                                                <h3 className="text-xl md:text-2xl font-display font-medium text-white mb-4 line-clamp-2 md:min-h-[4rem] group-hover:text-primary transition-colors tracking-tight">
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
                    {selectedEvent && (
                        <div className="max-w-5xl mx-auto px-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedEvent.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
                                >
                                    {/* Abstract glow behind the selected event box */}
                                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

                                    {/* Header with gradient and patterns */}
                                    <div className="relative h-64 bg-gradient-to-br from-surface to-background overflow-hidden border-b border-white/5">
                                        {/* Display poster or image if available */}
                                        {(selectedEvent.poster || selectedEvent.image) ? (
                                            <Image
                                                src={selectedEvent.poster || selectedEvent.image || ""}
                                                alt={selectedEvent.title}
                                                fill
                                                className="object-cover opacity-50 mix-blend-overlay"
                                                sizes="(max-width: 768px) 100vw, 1000px"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-background opacity-50"></div>
                                        )}

                                        {/* Minimal overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>

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

                                    {/* Content inside Selected Event */}
                                    <div className="p-8 md:p-12 bg-surface/50 backdrop-blur-md">
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
                                        <div className="flex gap-4 flex-wrap mt-8">
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
                    )}
                </main>

                <Footer />
            </div>
        </div>
    );
}
