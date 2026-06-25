"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { usePicksAuth } from './PicksAuthProvider';
import { FLAIRS, type Flair } from '@/lib/picks-db';

interface SubmitFormProps {
    onClose: () => void;
    onPostCreated: () => void;
    onAuthRequired: () => void;
}

export function SubmitForm({ onClose, onPostCreated, onAuthRequired }: SubmitFormProps) {
    const { user, authId, session } = usePicksAuth();
    const [title, setTitle] = useState('');
    const [toolName, setToolName] = useState('');
    const [flair, setFlair] = useState<Flair>('Development');
    const [license, setLicense] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Parent guards mounting with !!user, but this return keeps TypeScript happy
    // and provides a safety net if the session drops mid-render.
    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            const token = session?.access_token;
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/picks/posts', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    tool_name: toolName.trim(),
                    flair,
                    license: license.trim(),
                    auth_id: authId,
                }),
            });

            if (res.ok) {
                onPostCreated();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create post');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mb-4">
            <div className="bg-[#0a0a0a]/90 border border-white/[0.08] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-100 font-display">
                        Submit a Pick
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Tool Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                Tool Name *
                            </label>
                            <input
                                type="text"
                                value={toolName}
                                onChange={(e) => setToolName(e.target.value)}
                                placeholder="e.g. Neovim, Blender, Figma"
                                maxLength={100}
                                required
                                className="w-full px-3 py-2 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                            />
                        </div>

                        {/* Flair */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                Category *
                            </label>
                            <div className="relative">
                                <select
                                    value={flair}
                                    onChange={(e) => setFlair(e.target.value as Flair)}
                                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 appearance-none focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all cursor-pointer"
                                >
                                    {FLAIRS.map(f => (
                                        <option key={f} value={f} className="bg-[#1a1a1a] text-gray-200">{f}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                            Post Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What makes this tool great?"
                            maxLength={200}
                            required
                            className="w-full px-3 py-2 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* License */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                License *
                            </label>
                            <input
                                type="text"
                                value={license}
                                onChange={(e) => setLicense(e.target.value)}
                                placeholder="e.g. MIT, GPL-3.0, Apache-2.0"
                                maxLength={50}
                                required
                                className="w-full px-3 py-2 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                            />
                        </div>
                        <div className="flex items-end">
                            <p className="text-xs text-gray-600 pb-2">
                                Posting as <span className="text-[#D85A30] font-mono">{user.username}</span>
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                            Why it helped you * <span className="text-gray-600">({description.length}/300)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                            placeholder="Share your experience — what problem does this tool solve for you?"
                            maxLength={300}
                            rows={3}
                            required
                            className="w-full px-3 py-2 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-xs text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={submitting || !title.trim() || !toolName.trim() || !description.trim() || !license.trim()}
                            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                                color: '#fff',
                                boxShadow: '0 0 20px rgba(216, 90, 48, 0.15)',
                            }}
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Posting...
                                </span>
                            ) : (
                                'Post Pick'
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
}
