"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight, Clock, Users, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { events as localEvents, Event } from "@/data/events";
import EventsSkeleton from "./loading";
import useSWR from "swr";
import { FetchError } from "@/components/FetchError";

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
    poster: dbEvent.poster_url || dbEvent.image_url, // Use poster_url, fallback to image_url
    link: dbEvent.link
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EventsPage() {
    const { data, error, isLoading, mutate } = useSWR('/api/data/events', fetcher, {
        dedupingInterval: 3600000 // 1 hour
    });

    const upcomingEvents = data?.upcoming?.map(mapEvent) || [];
    const pastEvents = data?.past?.map(mapEvent) || [];

    const router = useRouter();

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



    // Direct event linking is handled by the dedicated Event Details page.
    // This page only renders the event cards and navigation controls.

    // Get the display image for an event card (prefer poster, then image)
    const getEventCardImage = (event: Event): string | undefined => {
        return event.poster || event.image;
    };

    if (error) {
        return (
            <div className="relative min-h-screen text-white selection:bg-primary selection:text-black overflow-hidden flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center pt-24 pb-10 px-4">
                    <FetchError onRetry={() => mutate()} />
                </main>
                <Footer />
            </div>
        );
    }

    if (isLoading) {
        return <EventsSkeleton />;
    }

    return (
        <div className="relative min-h-screen text-white selection:bg-primary selection:text-black overflow-hidden">


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
                            {displayEvents.map((event: Event, index: number) => {
                                const cardImage = getEventCardImage(event);

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        role="link"
                                        tabIndex={0}
                                        aria-label={`View details for ${event.title}`}
                                        onClick={() => router.push(`/events/${event.id}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                router.push(`/events/${event.id}`);
                                            }
                                        }}
                                        className="cursor-pointer group relative transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,230,118,0.15)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70"
                                    >
                                        {/* Modern Glass Card */}
                                        <div className="bg-surface/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 h-full flex flex-col hover:border-primary/40 hover:bg-surface/60 hover:shadow-2xl">

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
                                                        </div>

                                        <div className="absolute inset-x-6 bottom-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs text-primary font-mono uppercase tracking-[0.18em] border border-primary/30 backdrop-blur-sm shadow-[0_0_20px_rgba(0,230,118,0.12)]">
                                                Click to view details <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>

        </div>
    );
}
