"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import {
    Plus,
    Trash,
    Edit3,
    Check,
    X,
    AlertCircle
} from 'lucide-react';
import ImageUploader from './ImageUploader';

// Zod schema for event form validation
const eventFormSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    location: z.string().min(1, 'Location is required'),
    description: z.string().min(1, 'Description is required'),
    type: z.enum(['Workshop', 'Hackathon', 'Talk', 'Meetup']),
    attendees: z.string(),
    status: z.enum(['Upcoming', 'Registration Open', 'Completed']),
    poster_url: z.string(),
    link: z.string(),
});

const MAX_POSTER_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export default function AdminEventList() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        type: 'Workshop',
        attendees: '0+',
        status: 'Upcoming',
        poster_url: '',
        link: ''
    });

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
        loadData();
    }, []);

    const validateForm = (): boolean => {
        const result = eventFormSchema.safeParse(formData);
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                errors[field] = issue.message;
            });
            setFormErrors(errors);
            return false;
        }
        setFormErrors({});
        return true;
    };

    const handleSaveEvent = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        let finalPosterUrl = formData.poster_url;

        try {
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    alert('Session expired. Please log in again.');
                    setIsSubmitting(false);
                    return;
                }

                const { data, error: uploadError } = await supabase.storage.from('event-posters').upload(fileName, selectedFile);
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('event-posters').getPublicUrl(data.path);
                finalPosterUrl = urlData.publicUrl;
            }

            const payload = { ...formData, poster_url: finalPosterUrl };

            if (isEditing) {
                const { error } = await supabase
                    .from('events')
                    .update(payload)
                    .eq('id', isEditing);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('events')
                    .insert([payload]);

                if (error) throw error;
            }

            loadData();
            resetForm();
        } catch (error: any) {
            alert('Error saving event: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const openEditModal = (event: any) => {
        setIsEditing(event.id);
        setFormData({
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            description: event.description || '',
            type: event.type,
            attendees: event.attendees || '0+',
            status: event.status,
            poster_url: event.poster_url || event.image_url || '',
            link: event.link || ''
        });
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setIsEditing(null);
        setSelectedFile(null);
        setFormErrors({});
        setFormData({
            title: '',
            date: '',
            time: '',
            location: '',
            description: '',
            type: 'Workshop',
            attendees: '0+',
            status: 'Upcoming',
            poster_url: '',
            link: ''
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                Events Management
            </h3>

            {/* Add/Edit Event Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-2xl space-y-4 my-8 relative">
                        <button
                            onClick={resetForm}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-white">
                            {isEditing ? 'Edit Event' : 'Create New Event'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Event Poster <span className="text-xs text-gray-600">(Max 2MB)</span></label>
                                <ImageUploader
                                    onFileSelect={setSelectedFile}
                                    maxFileSize={MAX_POSTER_SIZE}
                                    initialPreview={isEditing && formData.poster_url ? formData.poster_url : null}
                                />
                                {selectedFile && (
                                    <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                                        <Check size={14} /> Poster selected for upload
                                    </div>
                                )}
                                {isEditing && !formData.poster_url && (
                                    <div className="mt-1 text-xs text-gray-500">Current poster will be kept if not updated.</div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    className={`w-full bg-gray-800 text-white rounded px-3 py-2 border outline-none ${formErrors.title ? 'border-red-500' : 'border-gray-700 focus:border-primary'}`}
                                    value={formData.title}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, title: e.target.value })); setFormErrors(prev => ({ ...prev, title: '' })); }}
                                    placeholder="Event Title (min. 5 characters)"
                                />
                                {formErrors.title && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    className={`w-full bg-gray-800 text-white rounded px-3 py-2 border outline-none ${formErrors.date ? 'border-red-500' : 'border-gray-700 focus:border-primary'}`}
                                    value={formData.date}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, date: e.target.value })); setFormErrors(prev => ({ ...prev, date: '' })); }}
                                />
                                {formErrors.date && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                                <input
                                    type="text"
                                    className={`w-full bg-gray-800 text-white rounded px-3 py-2 border outline-none ${formErrors.time ? 'border-red-500' : 'border-gray-700 focus:border-primary'}`}
                                    value={formData.time}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, time: e.target.value })); setFormErrors(prev => ({ ...prev, time: '' })); }}
                                    placeholder="e.g. 10:00 AM - 4:00 PM"
                                />
                                {formErrors.time && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.time}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                <input
                                    type="text"
                                    className={`w-full bg-gray-800 text-white rounded px-3 py-2 border outline-none ${formErrors.location ? 'border-red-500' : 'border-gray-700 focus:border-primary'}`}
                                    value={formData.location}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, location: e.target.value })); setFormErrors(prev => ({ ...prev, location: '' })); }}
                                    placeholder="Multiplier Hall / Online"
                                />
                                {formErrors.location && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.location}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                                <select
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-primary outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="Workshop">Workshop</option>
                                    <option value="Hackathon">Hackathon</option>
                                    <option value="Talk">Talk</option>
                                    <option value="Meetup">Meetup</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Attendees (Estimate)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-primary outline-none"
                                    value={formData.attendees}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, attendees: e.target.value }))}
                                    placeholder="e.g. 50+"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                                <select
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-primary outline-none"
                                    value={formData.status}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value as any }))}
                                >
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Registration Open">Registration Open</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Registration Link</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-primary outline-none"
                                    value={formData.link}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, link: e.target.value }))}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    className={`w-full bg-gray-800 text-white rounded px-3 py-2 border outline-none min-h-[100px] ${formErrors.description ? 'border-red-500' : 'border-gray-700 focus:border-primary'}`}
                                    value={formData.description}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, description: e.target.value })); setFormErrors(prev => ({ ...prev, description: '' })); }}
                                    placeholder="Event description..."
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                className="px-4 py-2 bg-primary text-black font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!formData.title || !formData.date || isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-8 text-primary">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add New Card */}
                    <div
                        onClick={() => setIsAdding(true)}
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
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white border border-white/10 backdrop-blur-md
                                    ${event.status === 'Completed' ? 'bg-gray-800/80' :
                                        event.status === 'Registration Open' ? 'bg-green-600/80' : 'bg-blue-600/80'}`}
                                >
                                    {event.status}
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
                                        onClick={() => openEditModal(event)}
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
