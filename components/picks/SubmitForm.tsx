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
            <div
                className="rounded-xl p-5 md:p-6 shadow-2xl relative overflow-hidden"
                style={{
                    background: 'rgba(8,8,8,0.96)',
                    border: '1px solid rgba(0,230,118,0.1)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 40px rgba(0,230,118,0.04), 0 25px 60px rgba(0,0,0,0.6)',
                }}
            >
                {/* Green glow top */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.3), transparent)' }}
                />
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1.5 rounded-lg transition-colors"
                    style={{ color: '#525252' }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = '#a3a3a3';
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = '#525252';
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                >
                    <X size={17} />
                </button>

                {/* Heading */}
                <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-100 font-mono tracking-wide flex items-center gap-2">
                        <span
                            className="w-1.5 h-4 rounded-full"
                            style={{ background: '#00e676', boxShadow: '0 0 8px rgba(0,230,118,0.5)' }}
                        />
                        Create a Pick
                    </h3>
                    <p className="text-xs text-gray-600 font-mono mt-0.5">
                        <span className="text-[#00e676]/40">//</span> share an open source tool that helped you
                    </p>
                </div>

                {/* Tab Selectors */}
                <div
                    className="flex mb-5 gap-1 p-1 rounded-xl"
                    style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(0,230,118,0.06)',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setActiveTab('text')}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold font-mono transition-all rounded-lg flex-1 justify-center"
                        style={{
                            background: activeTab === 'text' ? 'rgba(0,230,118,0.1)' : 'transparent',
                            color: activeTab === 'text' ? '#00e676' : '#525252',
                            border: activeTab === 'text' ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent',
                        }}
                    >
                        <FileText size={13} />
                        Post
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('image')}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold font-mono transition-all rounded-lg flex-1 justify-center"
                        style={{
                            background: activeTab === 'image' ? 'rgba(0,230,118,0.1)' : 'transparent',
                            color: activeTab === 'image' ? '#00e676' : '#525252',
                            border: activeTab === 'image' ? '1px solid rgba(0,230,118,0.2)' : '1px solid transparent',
                        }}
                    >
                        <ImageIcon size={13} />
                        Image
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Title */}
                    <div>
                        <textarea
                            ref={titleRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                            placeholder="An interesting title for your pick..."
                            rows={1}
                            required
                            disabled={submitting}
                            className="w-full text-base md:text-lg font-bold bg-transparent border-0 px-0 py-2 placeholder-gray-700 text-gray-100 resize-none overflow-hidden focus:outline-none transition-colors font-mono"
                            style={{ borderBottom: '1px solid rgba(0,230,118,0.08)' }}
                            onFocus={e => { (e.target as HTMLElement).style.borderBottomColor = 'rgba(0,230,118,0.25)'; }}
                            onBlur={e => { (e.target as HTMLElement).style.borderBottomColor = 'rgba(0,230,118,0.08)'; }}
                        />
                        <div className="flex justify-end text-[10px] text-gray-700 font-mono mt-1">
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
                                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-300 placeholder-gray-700 focus:outline-none transition-all resize-none h-32 leading-relaxed font-mono"
                                    style={{
                                        background: 'rgba(0,230,118,0.03)',
                                        border: '1px solid rgba(0,230,118,0.08)',
                                    }}
                                    onFocus={e => {
                                        (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.2)';
                                        (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.05)';
                                    }}
                                    onBlur={e => {
                                        (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.08)';
                                        (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.03)';
                                    }}
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
                                            className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 min-h-[160px]"
                                            style={{
                                                border: isDragging
                                                    ? '2px dashed rgba(0,230,118,0.5)'
                                                    : '2px dashed rgba(0,230,118,0.1)',
                                                background: isDragging ? 'rgba(0,230,118,0.05)' : 'rgba(0,230,118,0.02)',
                                            }}
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
                                            <div
                                                className="p-3 rounded-xl"
                                                style={{
                                                    background: 'rgba(0,230,118,0.08)',
                                                    border: '1px solid rgba(0,230,118,0.15)',
                                                    color: '#00e676',
                                                }}
                                            >
                                                <Upload size={20} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-400 font-mono">
                                                    Drop image or click to browse
                                                </p>
                                                <p className="text-xs text-gray-600 font-mono mt-1">
                                                    PNG, JPG, WEBP, GIF · max 5MB · paste supported
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
                                        className="w-full px-4 py-3 rounded-xl text-sm text-gray-300 placeholder-gray-700 focus:outline-none transition-all resize-none leading-relaxed font-mono"
                                        style={{
                                            background: 'rgba(0,230,118,0.03)',
                                            border: '1px solid rgba(0,230,118,0.08)',
                                        }}
                                        onFocus={e => {
                                            (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.2)';
                                        }}
                                        onBlur={e => {
                                            (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.08)';
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Metadata */}
                    <div
                        className="pt-3"
                        style={{ borderTop: '1px solid rgba(0,230,118,0.06)' }}
                    >
                        <label className="block text-[10px] font-semibold text-gray-600 font-mono uppercase tracking-widest mb-2.5">
                            Post Metadata
                        </label>
                        <div className="flex flex-wrap gap-2 items-center">
                            
                            {/* Tool Name Badge */}
                            <div
                                className="flex items-center rounded-full px-3 py-1.5 transition-all"
                                style={{
                                    background: 'rgba(0,230,118,0.04)',
                                    border: '1px solid rgba(0,230,118,0.1)',
                                }}
                            >
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
                                className="flex items-center rounded-full px-3 py-1.5 transition-all"
                                style={{
                                    background: `${flairColor}0a`,
                                    border: `1px solid ${flairColor}25`,
                                }}
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
                            <div
                                className="flex items-center rounded-full px-3 py-1.5 transition-all"
                                style={{
                                    background: 'rgba(0,230,118,0.04)',
                                    border: '1px solid rgba(0,230,118,0.1)',
                                }}
                            >
                                <Scale size={12} className="mr-2" style={{ color: '#00e676', opacity: 0.6 }} />
                                <select
                                    value={licenseType}
                                    onChange={(e) => setLicenseType(e.target.value)}
                                    disabled={submitting}
                                    className="bg-transparent border-0 focus:ring-0 p-0 text-xs font-mono font-semibold cursor-pointer appearance-none pr-4 focus:outline-none"
                                    style={{ color: '#a3a3a3' }}
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
                                    className="flex items-center rounded-full px-3 py-1.5 transition-all"
                                    style={{
                                        background: 'rgba(0,230,118,0.06)',
                                        border: '1px solid rgba(0,230,118,0.2)',
                                    }}
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
                    <div
                        className="flex items-center justify-between pt-3 mt-2"
                        style={{ borderTop: '1px solid rgba(0,230,118,0.06)' }}
                    >
                        {/* User Identity info */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold font-mono"
                                style={{
                                    background: `hsl(${(user.username || '').charCodeAt(0) * 37 % 360}, 40%, 20%)`,
                                    color: `hsl(${(user.username || '').charCodeAt(0) * 37 % 360}, 60%, 70%)`,
                                    border: `1px solid hsl(${(user.username || '').charCodeAt(0) * 37 % 360}, 40%, 30%)`,
                                }}
                            >
                                {user.username[0].toUpperCase()}
                            </div>
                            <p className="text-[11px] text-gray-600 font-mono">
                                as <span className="text-[#00e676]/80">{user.username}</span>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-40"
                                style={{ color: '#525252' }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.color = '#a3a3a3';
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.color = '#525252';
                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                }}
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={submitting || !title.trim() || !toolName.trim() || (licenseType === 'Other' && !customLicense.trim()) || (activeTab === 'text' && !description.trim()) || (activeTab === 'image' && !imageFile)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0,230,118,0.15) 0%, rgba(0,168,84,0.1) 100%)',
                                    color: '#00e676',
                                    border: '1px solid rgba(0,230,118,0.25)',
                                    boxShadow: '0 0 20px rgba(0,230,118,0.08)',
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
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
