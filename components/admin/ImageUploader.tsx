"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload } from 'lucide-react';

export default function ImageUploader({
    maxFileSize,
    onFileSelect,
    initialPreview = null,
}: {
    maxFileSize?: number;
    onFileSelect: (file: File | null) => void;
    initialPreview?: string | null;
}) {
    const [preview, setPreview] = useState<string | null>(initialPreview);

    const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];

        if (maxFileSize && file.size > maxFileSize) {
            const maxMB = (maxFileSize / (1024 * 1024)).toFixed(0);
            alert(`File is too large. Maximum size is ${maxMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
            return;
        }

        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
    };

    const handleClear = () => {
        setPreview(null);
        onFileSelect(null);
    };

    return (
        <div className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-700 rounded-lg p-6 bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
            {preview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-4">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Click to select image</p>
                </div>
            )}

            <label className="cursor-pointer bg-primary text-black px-4 py-2 rounded font-bold hover:bg-primary/90 transition-colors">
                Select Image
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleSelect}
                />
            </label>
        </div>
    );
}
