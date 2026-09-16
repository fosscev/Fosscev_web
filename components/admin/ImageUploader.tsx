"use client";

import { useState, useRef } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { Upload, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import NextImage from 'next/image';

const compressImage = (file: File, maxMB: number = 1): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const maxDim = 1920;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                                type: 'image/webp',
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        } else {
                            reject(new Error('Canvas to Blob failed'));
                        }
                    },
                    'image/webp',
                    0.8
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

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
    const [isCompressing, setIsCompressing] = useState(false);

    const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        setIsCompressing(true);

        try {
            const compressedFile = await compressImage(file, 1);

            if (maxFileSize && compressedFile.size > maxFileSize) {
                const maxMB = (maxFileSize / (1024 * 1024)).toFixed(0);
                alert(`File is still too large after compression. Maximum size is ${maxMB}MB.`);
                setIsCompressing(false);
                return;
            }

            setPreview(URL.createObjectURL(compressedFile));
            onFileSelect(compressedFile);
        } catch (err) {
            console.error("Compression failed", err);
            // Fallback to original
            if (maxFileSize && file.size > maxFileSize) {
                const maxMB = (maxFileSize / (1024 * 1024)).toFixed(0);
                alert(`File is too large. Maximum size is ${maxMB}MB.`);
                setIsCompressing(false);
                return;
            }
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleClear = () => {
        setPreview(null);
        onFileSelect(null);
    };

    return (
        <div className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-700 rounded-lg p-6 bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
            {preview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
                    <NextImage
                        src={preview}
                        alt="Preview"
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 640px"
                        className="object-contain"
                    />
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

            <label className={`cursor-pointer bg-primary text-black px-4 py-2 rounded font-bold transition-colors ${isCompressing ? 'opacity-50 cursor-wait' : 'hover:bg-primary/90'}`}>
                {isCompressing ? 'Compressing...' : 'Select Image'}
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
