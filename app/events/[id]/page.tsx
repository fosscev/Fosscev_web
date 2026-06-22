"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Users, ChevronLeft, Tag, User } from "lucide-react";
import Image from "next/image";
import { getUpcomingEvents, getPastEvents } from "@/lib/api/events";
import { Event } from "@/data/events";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchEvent() {
            setIsLoading(true);
            try {
                const [upcomingResponse, pastResponse] = await Promise.all([
                    getUpcomingEvents(),
                    getPastEvents()
                ]);

                // Combine both responses
                const allEvents = [
                    ...(upcomingResponse.data || []),
                    ...(pastResponse.data || [])
                ];

                // Find the event using params.id
                const foundEvent = allEvents.find(e => e.id.toString() === eventId);
                setEvent(foundEvent || null);
            } catch (error) {
                console.error("Failed to fetch event:", error);
                setEvent(null);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEvent();
    }, [eventId]);

    if (isLoading) {
        return (
            <div className="relative min-h-screen bg-background text-white">
                <Navbar />
                <div className="h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading event...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="relative min-h-screen bg-background text-white">
                <Navbar />
                <div className="h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Event not found</h2>
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back to Events
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Use the same image field logic as event cards: poster_url (with fallback) or image_url
    const cardImage = (event as any).poster_url || (event as any).image_url || event.poster || event.image;

    return (
        <div className="relative min-h-screen bg-background text-white selection:bg-primary selection:text-black">
            <Navbar />

            {/* Back Button - Floating */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="fixed top-24 left-6 z-40 flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-md border border-white/10 rounded-lg hover:border-primary/40 hover:bg-surface text-gray-300 hover:text-primary transition-all duration-300 group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-display font-bold">Back</span>
            </motion.button>

            <main className="pt-32 pb-20">
                {/* HERO SECTION - Liquid Glass Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative h-96 md:h-[500px] overflow-hidden group"
                >
                    {/* Hero Background Image */}
                    {cardImage ? (
                        <Image
                            src={cardImage}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                    )}

                    {/* Gradient Fade to Background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>

                    {/* Liquid Glass Overlay */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/25 group-hover:bg-black/20 transition-all duration-500"></div>

                    {/* Subtle Green Glow Accent */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{
                        background: 'radial-gradient(circle at center, rgba(0, 230, 118, 0.15) 0%, transparent 70%)'
                    }}></div>

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'linear-gradient(rgba(0,230,118,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.3) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}></div>

                    {/* Hero Content - Title */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-center max-w-5xl"
                        >
                            <div className="mb-6 flex items-center justify-center gap-3">
                                <span className="px-4 py-2 bg-black/60 backdrop-blur-md border border-primary/40 rounded-full text-primary text-sm font-display font-bold uppercase">
                                    {event.type}
                                </span>
                                <span className={`px-4 py-2 bg-black/60 backdrop-blur-md border rounded-full text-xs font-display font-bold uppercase ${
                                    event.status === "Completed"
                                        ? "border-gray-400 text-gray-400"
                                        : "border-primary/40 text-primary"
                                }`}>
                                    {event.status}
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent drop-shadow-lg">
                                {event.title}
                            </h1>

                            {/* Decorative line */}
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
                        </motion.div>
                    </div>

                    {/* Glow border effect */}
                    <div className="absolute inset-0 border-t border-white/5 shadow-2xl shadow-primary/10"></div>
                </motion.div>

                {/* MAIN CONTENT SECTION */}
                <div className="max-w-6xl mx-auto px-6 mt-16 space-y-12">

                    {/* Info Grid - Date, Time, Location, Attendees */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Date Card */}
                        <div className="group bg-surface/40 backdrop-blur-lg rounded-2xl border border-white/10 p-8 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm font-display uppercase tracking-wider mb-2">Date</p>
                                    <p className="text-2xl font-bold text-white font-mono">{event.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Time Card */}
                        <div className="group bg-surface/40 backdrop-blur-lg rounded-2xl border border-white/10 p-8 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                                    <Clock className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm font-display uppercase tracking-wider mb-2">Time</p>
                                    <p className="text-2xl font-bold text-white font-mono">{event.time}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="group bg-surface/40 backdrop-blur-lg rounded-2xl border border-white/10 p-8 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 md:col-span-2">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm font-display uppercase tracking-wider mb-2">Location</p>
                                    <p className="text-xl font-bold text-white font-mono leading-relaxed">{event.location}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Additional Info Row - Attendees & Type */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Attendees Card */}
                        <div className="group bg-surface/40 backdrop-blur-lg rounded-2xl border border-white/10 p-8 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm font-display uppercase tracking-wider mb-2">Attendees</p>
                                    <p className="text-2xl font-bold text-white font-mono">{event.attendees}</p>
                                </div>
                            </div>
                        </div>

                        {/* Event Type Card */}
                        <div className="group bg-surface/40 backdrop-blur-lg rounded-2xl border border-white/10 p-8 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                                    <Tag className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm font-display uppercase tracking-wider mb-2">Event Type</p>
                                    <p className="text-2xl font-bold text-white font-mono">{event.type}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* DESCRIPTION SECTION */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="group bg-surface/40 backdrop-blur-lg rounded-2xl border border-white/10 p-10 md:p-12 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-white">About This Event</h2>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed font-body whitespace-pre-wrap">
                            {event.description}
                        </p>

                        {/* Decorative bottom line */}
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm font-display font-bold uppercase">
                                    #{event.type.toLowerCase().replace(/\s+/g, '-')}
                                </span>
                                <span className={`px-4 py-2 rounded-full text-sm font-display font-bold uppercase border ${
                                    event.status === "Completed"
                                        ? "bg-gray-900 border-gray-700 text-gray-400"
                                        : "bg-primary/10 border-primary/30 text-primary"
                                }`}>
                                    {event.status}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Call-to-Action Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
                    >
                        <button
                            onClick={() => router.back()}
                            className="px-8 py-4 bg-surface border border-white/10 rounded-xl font-display font-bold text-white hover:border-primary/40 hover:bg-surface/60 transition-all duration-300 text-center"
                        >
                            ← Back to Events
                        </button>

                        {event.link && (
                            <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-primary text-black rounded-xl font-display font-bold hover:bg-primary-dark transition-all duration-300 text-center shadow-xl shadow-primary/20"
                            >
                                Learn More →
                            </a>
                        )}
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
}