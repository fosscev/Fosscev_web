"use client";

import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Edit3 } from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';
import { getComputedEventStatus } from '@/lib/event-utils';
import Image from 'next/image';
import { getSupabaseImageUrl } from '@/lib/image-utils';

export default function AdminEventList() {
    const { session } = useAdminAuth();
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error(error);
        } else {
            setEvents(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (session) {
            loadData();
        }
    }, [session]);

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        // Cleanup storage if there's an image
        const eventToDelete = events.find(e => e.id === id);
        const imageUrl = eventToDelete?.poster_url || eventToDelete?.image_url;
        if (imageUrl && imageUrl.includes('supabase.co')) {
            try {
                const url = new URL(imageUrl);
                const pathParts = url.pathname.split('/');
                const fileName = pathParts[pathParts.length - 1];
                await supabase.storage.from('event-posters').remove([fileName]);
            } catch (err) {
                console.error("Failed to delete event poster from storage:", err);
            }
        }

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting event: ' + error.message);
        } else {
            loadData();
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                Events Management
            </h3>

            {isLoading ? (
                <div className="flex justify-center p-8 text-primary">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {/* Add New Card */}
                    <div
                        onClick={() => router.push('/foss-manager/dashboard/events/form')}
                        className="group flex min-h-24 items-center gap-4 rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-gray-900/80 md:min-h-[300px] md:flex-col md:justify-center md:p-6 md:text-center"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-800 transition-colors group-hover:bg-primary/20 md:mb-4 md:h-16 md:w-16">
                            <Plus className="h-6 w-6 text-gray-400 group-hover:text-primary md:h-8 md:w-8" />
                        </div>
                        <div><h4 className="text-base font-bold text-gray-300 group-hover:text-white md:mb-2 md:text-lg">Create New Event</h4>
                        <p className="mt-1 text-xs text-gray-500 md:mt-0 md:text-sm">Plan a workshop, hackathon, or meetup.</p></div>
                    </div>

                    {events.map((event) => {
                        const displayStatus = getComputedEventStatus(event);
                        return (
                        <div key={event.id} className="group flex overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-gray-700 md:flex-col">
                            <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-gray-800 sm:w-36 md:aspect-[3/4] md:w-full">
                                {event.poster_url || event.image_url ? (
                                    <Image
                                        src={getSupabaseImageUrl(event.poster_url || event.image_url, '/placeholder.jpg', { width: 900, height: 1200, quality: 85 })}
                                        alt={event.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="w-full h-full object-contain bg-black/30"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                        No Image
                                    </div>
                                )}
                                <div className={`absolute top-2 right-2 px-2.5 py-1 rounded text-xs font-bold border backdrop-blur-md
                                    ${displayStatus === 'Draft' ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]' :
                                        displayStatus === 'Event Concluded' ? 'bg-gray-800/80 text-white border-white/10' :
                                        displayStatus === 'Registration Open' ? 'bg-green-600/80 text-white border-white/10' : 'bg-blue-600/80 text-white border-white/10'}`}
                                >
                                    {displayStatus === 'Draft' ? '● Draft' : displayStatus}
                                </div>
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 md:p-5">
                                <div className="mb-2 flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
                                    <span className="text-xs font-mono text-primary uppercase tracking-wider">{event.type}</span>
                                    <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <h4 className="mb-1 text-base font-bold leading-snug text-white line-clamp-2 sm:text-lg">{event.title}</h4>
                                <p className="mb-3 text-xs leading-5 text-gray-400 line-clamp-2 sm:text-sm md:mb-4">{event.description}</p>

                                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-800">
                                    <button
                                        onClick={() => router.push('/foss-manager/dashboard/events/form?id=' + event.id)}
                                        className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
}
