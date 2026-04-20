"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, X } from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function AdminGalleryList() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const loadPhotos = async () => {
        setIsLoading(true);
        const { data: files, error } = await supabase.storage
            .from('event-photos')
            .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

        if (error) {
            console.error("Error fetching photos", error);
        } else if (files) {
            const validFiles = files.filter(f => f.name && !f.name.startsWith('.') && f.id);
            const formatted = validFiles.map(file => {
                const { data: urlData } = supabase.storage.from('event-photos').getPublicUrl(file.name);
                return {
                    name: file.name,
                    id: file.id,
                    url: urlData.publicUrl,
                    title: file.name.split('.')[0].replace(/_/g, ' ')
                };
            });
            setPhotos(formatted);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadPhotos();
    }, []);

    const handleDelete = async (fileName: string) => {
        if (!window.confirm("Are you sure you want to delete this photo from the gallery?")) return;

        const { error } = await supabase.storage.from('event-photos').remove([fileName]);
        if (error) {
            alert("Error deleting: " + error.message);
        } else {
            loadPhotos();
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsSubmitting(true);
        setUploadError(null);

        try {
            // Generate a safe unique filename based on the original name
            const ext = selectedFile.name.split('.').pop();
            const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9_-]/g, '_');
            const newFileName = `${baseName}_${Date.now()}.${ext}`;

            const { error: uploadErr } = await supabase.storage
                .from('event-photos')
                .upload(newFileName, selectedFile);

            if (uploadErr) throw uploadErr;

            setIsAdding(false);
            setSelectedFile(null);
            loadPhotos();
        } catch (err: any) {
            setUploadError(err.message || 'Error uploading photo');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    Community Gallery
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                    {isAdding ? 'Cancel' : 'Add Photo'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-surface/50 border border-white/5 rounded-xl p-6">
                    <form onSubmit={handleUpload} className="space-y-6">
                        {uploadError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded">
                                {uploadError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Photo</label>
                            <ImageUploader onFileSelect={setSelectedFile} maxFileSize={5 * 1024 * 1024} />
                            <p className="text-xs text-gray-500 mt-2">Max 5MB. The filename will be used as the title in the gallery.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedFile}
                            className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Uploading...' : 'Upload Photo'}
                        </button>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-8 text-primary animate-pulse">Loading gallery...</div>
            ) : photos.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
                    No photos found in the gallery.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div key={photo.name} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group">
                            <div className="aspect-video relative">
                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => handleDelete(photo.name)}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        title="Delete photo"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-sm font-medium text-white truncate" title={photo.title}>{photo.title}</p>
                                <p className="text-xs text-gray-500 truncate">{photo.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
