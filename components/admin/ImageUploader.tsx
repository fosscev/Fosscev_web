"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload } from 'lucide-react';

export default function ImageUploader({
    bucket,
    maxFileSize,
    onUploadComplete,
}: {
    bucket: string;
    maxFileSize?: number;
    onUploadComplete: (url: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return; // User cancelled
            }

            const file = event.target.files[0];

            // Validate file size
            if (maxFileSize && file.size > maxFileSize) {
                const maxMB = (maxFileSize / (1024 * 1024)).toFixed(0);
                alert(`File is too large. Maximum size is ${maxMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
                setUploading(false);
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Create object URL for immediate preview
            setPreview(URL.createObjectURL(file));

            // Verify session first
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (!session) {
                console.error("No active session found during upload!");
                alert("Authentication Error: You do not appear to be logged in. Please refresh the page and sign in again.");
                setUploading(false);
                return;
            }
            console.log("User authenticated:", session.user.id);

            const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

            if (error) {
                console.error("Supabase Storage Error:", error);
                throw error;
            }

            // Get public URL
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
            onUploadComplete(urlData.publicUrl);

        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-700 rounded-lg p-6 bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
            {preview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                        onClick={() => setPreview(null)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-4">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Click to upload image</p>
                </div>
            )}

            <label className="cursor-pointer bg-primary text-black px-4 py-2 rounded font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? 'Uploading...' : 'Select Image'}
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}
