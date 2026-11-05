"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Users, ChevronLeft, Tag, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getEventById } from "@/lib/api/events";
import { getComputedEventStatus } from "@/lib/event-utils";
import { Event } from "@/data/events";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSupabaseImageUrl } from "@/lib/image-utils";

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function fetchEvent() {
            setIsLoading(true);
            try {
                const { data: foundEvent } = await getEventById(String(eventId));
                if (!active) return;
                if (!foundEvent) {
                    setEvent(null);
                    return;
                }
                setEvent({
                    id: foundEvent.id,
                    title: foundEvent.title,
                    date: new Date(foundEvent.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    dateObj: new Date(foundEvent.date),
                    time: foundEvent.time,
                    location: foundEvent.location,
                    description: foundEvent.description,
                    type: foundEvent.type,
                    attendees: foundEvent.attendees,
                    status: getComputedEventStatus(foundEvent),
                    image: getSupabaseImageUrl(foundEvent.image_url, '/placeholder.jpg', { width: 1400, height: 1800, quality: 85 }),
                    poster: getSupabaseImageUrl(foundEvent.poster_url || foundEvent.image_url, '/placeholder.jpg', { width: 1400, height: 1800, quality: 85 }),
                    link: foundEvent.link,
                });
            } catch (error) {
                console.error("Failed to fetch event:", error);
                if (active) setEvent(null);
            } finally {
                if (active) setIsLoading(false);
            }
        }
        fetchEvent();
        return () => { active = false; };
    }, [eventId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-white">
                <Navbar />
                <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-6 pt-24">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                        <p className="font-mono text-sm text-gray-400">Loading event…</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background text-white">
                <Navbar />
                <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-6 pt-24">
                    <div className="text-center">
                        <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-primary">404 · Event missing</p>
                        <h1 className="mb-6 text-3xl font-bold">We couldn’t find that event.</h1>
                        <button onClick={() => router.push('/events')} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-primary/50 hover:text-primary">
                            <ChevronLeft className="h-4 w-4" /> Back to events
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const poster = event.poster || event.image;
    const isConcluded = event.status === "Event Concluded";
    const details = [
        { label: "Date", value: event.date, Icon: Calendar },
        { label: "Time", value: event.time, Icon: Clock },
        { label: "Location", value: event.location, Icon: MapPin },
        { label: "Attendees", value: event.attendees, Icon: Users },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-white selection:bg-primary selection:text-black">
            <Navbar />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,230,118,0.12),transparent_65%)]" />

            <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
                <button onClick={() => router.push('/events')} className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-gray-300 backdrop-blur transition hover:border-primary/40 hover:text-primary">
                    <ChevronLeft className="h-4 w-4" /> All events
                </button>

                <div className="grid items-start gap-8 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto w-[min(72vw,280px)] sm:w-full sm:max-w-[520px]">
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#080d0b] shadow-[0_24px_90px_rgba(0,0,0,0.5)]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,230,118,0.08),transparent_60%)]" />
                            {poster ? (
                                <Image src={poster} alt={`${event.title} poster`} fill priority sizes="(max-width: 1024px) 92vw, 42vw" className="object-contain" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-gray-500">Poster unavailable</div>
                            )}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-wider text-gray-500">
                            <span className="inline-flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-primary" /> {event.type}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-700" />
                            <span>{event.date}</span>
                        </div>
                    </motion.div>

                    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
                        <div className="mb-5 flex flex-wrap gap-2">
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">{event.type}</span>
                            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${isConcluded ? 'border-white/10 bg-white/5 text-gray-400' : 'border-primary/30 bg-primary/10 text-primary'}`}>{event.status}</span>
                        </div>
                        <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">{event.title}</h1>
                        <div className="my-7 h-px w-24 bg-gradient-to-r from-primary to-transparent" />
                        <p className="max-w-2xl whitespace-pre-wrap text-base leading-7 text-gray-300 sm:text-lg">{event.description}</p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            {details.map(({ label, value, Icon }) => (
                                <div key={label} className="flex min-h-[92px] items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-primary/25 hover:bg-white/[0.055]">
                                    <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5"><Icon className="h-4 w-4 text-primary" /></div>
                                    <div className="min-w-0">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{label}</p>
                                        <p className="break-words text-sm font-medium leading-5 text-gray-100">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {event.link && (
                                <a href={event.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-black shadow-[0_10px_35px_rgba(0,230,118,0.18)] transition hover:-translate-y-0.5 hover:bg-primary/90">
                                    Event link <ArrowUpRight className="h-4 w-4" />
                                </a>
                            )}
                            <button onClick={() => router.push('/events')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-gray-200 transition hover:border-white/20 hover:bg-white/10">
                                <ChevronLeft className="h-4 w-4" /> Browse events
                            </button>
                        </div>
                    </motion.section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
