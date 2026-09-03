"use client";

import { useState, useEffect } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Edit3 } from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add New Card */}
                    <div
                        onClick={() => router.push('/foss-manager/dashboard/events/form')}
                        className="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] hover:border-primary/50 hover:bg-gray-900/80 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                            <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-400 group-hover:text-white mb-2">Create New Event</h4>
                        <p className="text-sm text-gray-500 text-center">Plan a workshop, hackathon, or meetup.</p>
                    </div>

                    {events.map((event) => (
                        <div key={event.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
                            <div className="relative h-48 bg-gray-800 overflow-hidden">
                                {event.poster_url || event.image_url ? (
                                    <img
                                        src={event.poster_url || event.image_url}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                        No Image
                                    </div>
                                )}
                                <div className={`absolute top-2 right-2 px-2.5 py-1 rounded text-xs font-bold border backdrop-blur-md
                                    ${event.status === 'Draft' ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]' :
                                        event.status === 'Completed' ? 'bg-gray-800/80 text-white border-white/10' :
                                        event.status === 'Registration Open' ? 'bg-green-600/80 text-white border-white/10' : 'bg-blue-600/80 text-white border-white/10'}`}
                                >
                                    {event.status === 'Draft' ? '● Draft' : event.status}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-primary uppercase tracking-wider">{event.type}</span>
                                    <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2 line-clamp-1">{event.title}</h4>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>

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
                    ))}
                </div>
            )}
        </div>
    );
}
