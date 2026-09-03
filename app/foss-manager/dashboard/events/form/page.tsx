"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { z } from 'zod';
import { Check, ArrowLeft, AlertCircle } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';

const eventFormSchema = z.object({
    title: z.coerce.string().min(3, 'Title is required'),
    date: z.coerce.string().min(1, 'Date is required'),
    time: z.coerce.string().min(1, 'Time is required'),
    location: z.coerce.string().min(1, 'Location is required'),
    description: z.coerce.string().min(1, 'Description is required'),
    type: z.coerce.string().optional().nullable(),
    attendees: z.coerce.string().optional().nullable(),
    status: z.coerce.string().optional().nullable(),
    poster_url: z.coerce.string().optional().nullable(),
    link: z.coerce.string().optional().nullable(),
});

const MAX_POSTER_SIZE = 2 * 1024 * 1024;

export default function EventFormPage() {
    const { session } = useAdminAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = searchParams.get('id');
    const isEditing = !!eventId;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    useEffect(() => {
        if (!session) return;
        if (eventId) {
            const fetchEvent = async () => {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', eventId)
                    .single();

                if (data) {
                    let formattedDate = '';
                    if (data.date) {
                        try {
                            const d = new Date(data.date);
                            if (!isNaN(d.getTime())) {
                                formattedDate = d.toISOString().split('T')[0];
                            } else {
                                formattedDate = String(data.date).split('T')[0];
                            }
                        } catch (e) {
                            formattedDate = String(data.date).split('T')[0];
                        }
                    }
                    setFormData({
                        title: data.title || '',
                        date: formattedDate,
                        time: data.time || '',
                        location: data.location || '',
                        description: data.description || '',
                        type: data.type || 'Workshop',
                        attendees: data.attendees || '0+',
                        status: data.status || 'Upcoming',
                        poster_url: data.poster_url || data.image_url || '',
                        link: data.link || ''
                    });
                }
                setIsLoading(false);
            };
            fetchEvent();
        }
    }, [eventId, session]);

    const validateForm = (): boolean => {
        const result = eventFormSchema.safeParse(formData);
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                errors[field] = issue.message;
            });
            setFormErrors(errors);
            
            const errorMessages = Object.entries(errors).map(([field, msg]) => `${field}: ${msg}`).join('\n');
            alert(`Please fix the following errors:\n${errorMessages}`);
            
            return false;
        }
        setFormErrors({});
        return true;
    };

    const handleSaveEvent = async (overrideStatus?: string) => {
        if (!validateForm()) return;
        setIsSubmitting(true);

        let finalPosterUrl = formData.poster_url;

        try {
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

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

            const targetStatus = overrideStatus || formData.status;
            const payload = { ...formData, status: targetStatus, poster_url: finalPosterUrl };

            if (isEditing) {
                const { error } = await supabase
                    .from('events')
                    .update(payload)
                    .eq('id', eventId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('events')
                    .insert([payload]);
                if (error) throw error;
            }

            router.push('/foss-manager/dashboard');
        } catch (error: any) {
            alert('Error saving event: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-primary p-8 text-center">Loading Event Data...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => router.push('/foss-manager/dashboard')}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-3xl font-bold text-white">
                    {isEditing ? 'Edit Event' : 'Create New Event'}
                </h2>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
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
                            <option value="Draft">Draft (Hidden from Public)</option>
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

                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
                    <button
                        type="button"
                        onClick={() => router.push('/foss-manager/dashboard')}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSaveEvent('Draft')}
                        className="px-4 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold rounded hover:bg-amber-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSaveEvent()}
                        className="px-4 py-2 bg-primary text-black font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Event' : 'Publish Event')}
                    </button>
                </div>
            </div>
        </div>
    );
}
