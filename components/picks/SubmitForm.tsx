"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Image as ImageIcon, Upload, Scale, Tag, Laptop, AlertCircle, Loader2 } from 'lucide-react';
import { usePicksAuth } from './PicksAuthProvider';
import { FLAIRS, FLAIR_COLORS, type Flair } from '@/lib/picks-db';
import { uploadFile } from '@/lib/supabase';

interface SubmitFormProps {
    onClose: () => void;
    onPostCreated: () => void;
    onAuthRequired: () => void;
}

export function SubmitForm({ onClose, onPostCreated, onAuthRequired }: SubmitFormProps) {
    const { user, authId } = usePicksAuth();
    
    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [toolName, setToolName] = useState('');
    const [flair, setFlair] = useState<Flair>('Development');
    const [licenseType, setLicenseType] = useState<string>('MIT');
    const [customLicense, setCustomLicense] = useState<string>('');
    
    // Tab and image state
    const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Request state
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<string | null>(null); // "uploading", "posting", etc.
    const [error, setError] = useState<string | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize title input
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto';
            titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
        }
    }, [title]);

    // Clean up preview URL on unmount
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    if (!user) {
        onAuthRequired();
        onClose();
        return null;
    }

    const handleImageSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (PNG, JPG, WEBP, GIF)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5MB');
            return;
        }

        setError(null);
        setImageFile(file);
        
        // Revoke old preview
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleImageSelect(file);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    handleImageSelect(file);
                    setActiveTab('image'); // auto switch to image tab if they pasted
                    e.preventDefault();
                    break;
                }
            }
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        if (!title.trim()) {
            setError('A title is required');
            return;
        }
        if (!toolName.trim()) {
            setError('Tool name is required');
            return;
        }
        if (licenseType === 'Other' && !customLicense.trim()) {
            setError('Please specify the custom license name');
            return;
        }
        if (activeTab === 'text' && !description.trim()) {
            setError('Please write a short description explaining why this tool is helpful.');
            return;
        }

        setSubmitting(true);
        setError(null);

        let finalImageUrl = null;

        try {
            // Upload image to Supabase Storage if in image tab and file exists
            if (activeTab === 'image' && imageFile) {
                setSubmitStatus('Uploading image...');
                const fileExt = imageFile.name.split('.').pop() || 'png';
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                const filePath = `${authId}/${fileName}`;

                const { url, error: uploadErr } = await uploadFile('picks-images', filePath, imageFile);
                if (uploadErr || !url) {
                    throw new Error(uploadErr?.message || 'Failed to upload image. Please check your storage settings.');
                }
                finalImageUrl = url;
            }

            setSubmitStatus('Creating post...');

            const res = await fetch('/api/picks/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    tool_name: toolName.trim(),
                    flair,
                    license: licenseType === 'None' ? null : (licenseType === 'Other' ? customLicense.trim() : licenseType),
                    auth_id: authId,
                    image_url: finalImageUrl,
                }),
            });

            if (res.ok) {
                onPostCreated();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create post');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
            setSubmitStatus(null);
        }
    };

    const flairColor = FLAIR_COLORS[flair] || '#6B7280';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 w-full"
            onPaste={handlePaste}
        >
            <div className="bg-[#0a0a0a]/95 border border-white/[0.08] rounded-xl p-5 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Heading */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-100 font-display tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-[#D85A30] rounded-full" />
                        Create a Pick
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                        // Share an open source tool that helped you
                    </p>
                </div>

                {/* Tab Selectors */}
                <div className="flex border-b border-white/[0.06] mb-5 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('text')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all relative border-b-2 ${
                            activeTab === 'text'
                                ? 'text-gray-100 border-[#D85A30]'
                                : 'text-gray-500 hover:text-gray-300 border-transparent'
                        }`}
                    >
                        <FileText size={16} />
                        Post
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('image')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all relative border-b-2 ${
                            activeTab === 'image'
                                ? 'text-gray-100 border-[#D85A30]'
                                : 'text-gray-500 hover:text-gray-300 border-transparent'
                        }`}
                    >
                        <ImageIcon size={16} />
                        Image
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Rich Title Area (Large, borderless title) */}
                    <div>
                        <textarea
                            ref={titleRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                            placeholder="An interesting title for your pick..."
                            rows={1}
                            required
                            disabled={submitting}
                            className="w-full text-lg md:text-xl font-bold bg-transparent border-0 border-b border-white/[0.06] focus:border-[#D85A30]/40 focus:ring-0 px-0 py-2 placeholder-gray-600 text-gray-100 resize-none overflow-hidden focus:outline-none transition-colors"
                        />
                        <div className="flex justify-end text-[10px] text-gray-600 font-mono mt-1">
                            {title.length}/200
                        </div>
                    </div>

                    {/* Tab Panels */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'text' ? (
                            <motion.div
                                key="text-tab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-2"
                            >
                                <label className="block text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider">
                                    Why this tool is awesome *
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Explain your experience — what problems did this tool solve for you? Why should others use it?"
                                    rows={4}
                                    required
                                    disabled={submitting}
                                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all resize-none h-32 leading-relaxed"
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="image-tab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-4"
                            >
                                {/* Drag and Drop Zone */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider">
                                        Upload Image
                                    </label>
                                    
                                    {!imagePreview ? (
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 min-h-[160px] ${
                                                isDragging
                                                    ? 'border-[#D85A30] bg-[#D85A30]/5'
                                                    : 'border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.01]'
                                            }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageSelect(file);
                                                }}
                                                className="hidden"
                                            />
                                            <div className="p-3 bg-white/[0.04] rounded-full text-gray-400 group-hover:text-gray-300 transition-colors">
                                                <Upload size={22} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-300">
                                                    Drag and drop an image, or click to browse
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono mt-1">
                                                    PNG, JPG, WEBP, GIF up to 5MB (or copy & paste directly)
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black/40 flex items-center justify-center p-2 group min-h-[160px]">
                                            <img
                                                src={imagePreview}
                                                alt="Upload preview"
                                                className="max-h-72 object-contain rounded-lg shadow-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                disabled={submitting}
                                                className="absolute top-4 right-4 p-1.5 bg-black/80 hover:bg-black text-gray-300 hover:text-white rounded-full transition-colors border border-white/10"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Optional text description */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider">
                                        Optional description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add some text or context to go with your image (optional)..."
                                        rows={2}
                                        disabled={submitting}
                                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all resize-none leading-relaxed"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Metadata tags area (badges/tags layout instead of form grids) */}
                    <div className="pt-2 border-t border-white/[0.06]">
                        <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-2.5">
                            Post Settings & Metadata
                        </label>
                        <div className="flex flex-wrap gap-3 items-center">
                            
                            {/* Tool Name Badge */}
                            <div className="flex items-center bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus-within:border-[#D85A30]/40 focus-within:ring-1 focus-within:ring-[#D85A30]/20 rounded-full px-3 py-1 transition-all">
                                <Laptop size={12} className="text-gray-500 mr-2" />
                                <input
                                    type="text"
                                    value={toolName}
                                    onChange={(e) => setToolName(e.target.value)}
                                    placeholder="Tool Name (e.g. Neovim)"
                                    maxLength={100}
                                    required
                                    disabled={submitting}
                                    className="bg-transparent border-0 focus:ring-0 p-0 text-xs font-mono font-semibold text-gray-200 placeholder-gray-600 w-40 focus:outline-none"
                                />
                            </div>

                            {/* Category Selector Badge */}
                            <div 
                                className="flex items-center bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-full px-3 py-1 transition-all"
                                style={{ borderColor: `${flairColor}30` }}
                            >
                                <Tag size={12} style={{ color: flairColor }} className="mr-2" />
                                <select
                                    value={flair}
                                    onChange={(e) => setFlair(e.target.value as Flair)}
                                    disabled={submitting}
                                    className="bg-transparent border-0 focus:ring-0 p-0 text-xs font-mono font-semibold text-gray-200 cursor-pointer appearance-none pr-4 focus:outline-none"
                                    style={{ color: flairColor }}
                                >
                                    {FLAIRS.map(f => (
                                        <option key={f} value={f} className="bg-[#0f0f0f] text-gray-200">{f}</option>
                                    ))}
                                </select>
                            </div>

                            {/* License Selector Badge */}
                            <div className="flex items-center bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-full px-3 py-1 transition-all">
                                <Scale size={12} className="text-gray-500 mr-2" />
                                <select
                                    value={licenseType}
                                    onChange={(e) => setLicenseType(e.target.value)}
                                    disabled={submitting}
                                    className="bg-transparent border-0 focus:ring-0 p-0 text-xs font-mono font-semibold text-gray-200 cursor-pointer appearance-none pr-4 focus:outline-none"
                                >
                                    {['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'MPL-2.0', 'Unlicense', 'Other', 'None'].map(l => (
                                        <option key={l} value={l} className="bg-[#0f0f0f] text-gray-200">{l}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom License Input (shown only if 'Other' is selected) */}
                            {licenseType === 'Other' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center bg-white/[0.03] border border-[#D85A30]/30 rounded-full px-3 py-1 transition-all"
                                >
                                    <input
                                        type="text"
                                        value={customLicense}
                                        onChange={(e) => setCustomLicense(e.target.value)}
                                        placeholder="License Name (e.g. GPL-2.0)"
                                        maxLength={50}
                                        required
                                        disabled={submitting}
                                        className="bg-transparent border-0 focus:ring-0 p-0 text-xs font-mono font-semibold text-gray-200 placeholder-gray-600 w-44 focus:outline-none"
                                    />
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2">
                            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                            <p className="text-xs text-red-400 leading-normal">{error}</p>
                        </div>
                    )}

                    {/* Footer / Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] mt-2">
                        {/* User Identity info */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-inner"
                                style={{
                                    background: `hsl(${(user.username || '').charCodeAt(0) * 37 % 360}, 50%, 25%)`,
                                    color: `hsl(${(user.username || '').charCodeAt(0) * 37 % 360}, 70%, 75%)`,
                                }}
                            >
                                {user.username[0].toUpperCase()}
                            </div>
                            <p className="text-xs text-gray-500 font-mono">
                                Posting as <span className="text-[#D85A30] font-semibold">{user.username}</span>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] transition-colors disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={submitting || !title.trim() || !toolName.trim() || (licenseType === 'Other' && !customLicense.trim()) || (activeTab === 'text' && !description.trim()) || (activeTab === 'image' && !imageFile)}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                                    color: '#fff',
                                    boxShadow: '0 0 20px rgba(216, 90, 48, 0.15)',
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>{submitStatus || 'Posting...'}</span>
                                    </>
                                ) : (
                                    'Post Pick'
                                )}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
